<?php

namespace App\Services\Providers\DtOne;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * DT One (DVS API)-backed top-up provider. Maps DT One's operator/product/
 * transaction model onto Tappy's provider-agnostic DTOs.
 *
 * Like DingConnect, DT One sends against a specific product (a denomination),
 * not a bare operator — so this adapter resolves the number's operator, picks
 * its primary recharge product, and carries that **product id as the opaque
 * operatorId**, which round-trips into the sync transaction.
 *
 * `external_id` is the idempotency key. Status: built to the published DVS spec;
 * live-sandbox (preprod) verification pending credentials.
 */
class DtOneTopUpProvider implements TopUpProvider
{
    // Only COMPLETED means the value was delivered. CREATED/CONFIRMED/SUBMITTED
    // are in-flight (even with auto_confirm, a sync call may return CONFIRMED or
    // SUBMITTED before settlement). DECLINED carries variant suffixes.
    private const SUCCESS_STATES = ['COMPLETED'];

    private const PENDING_STATES = ['CREATED', 'CONFIRMED', 'SUBMITTED'];

    private const FAILED_STATES = ['REJECTED', 'CANCELLED', 'REVERSED'];

    public function __construct(private readonly DtOneClient $client) {}

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        $iso = strtoupper($countryIso);

        try {
            // POST lookup (the GET-by-path variant is deprecated). The number must
            // be E.164 with a leading +.
            $operators = $this->client->post('/lookup/mobile-number', ['mobile_number' => $this->e164($phone)]);
            $operator = $this->first($operators);

            if ($operator === null || blank($operator['id'] ?? null)) {
                return null;
            }

            $products = $this->client->get('/products', ['operator_id' => $operator['id'], 'per_page' => 50]);
        } catch (Throwable) {
            return null;
        }

        $product = $this->selectProduct($products);

        if ($product === null || blank($product['id'] ?? null)) {
            return null;
        }

        $destination = is_array($product['destination'] ?? null) ? $product['destination'] : [];
        $source = is_array($product['source'] ?? null) ? $product['source'] : [];
        $ranged = str_contains(strtoupper((string) ($product['type'] ?? '')), 'RANGED');

        // For ranged products, `amount` is a {min,max,increment} object; for fixed
        // it is a plain number.
        [$minLocal, $maxLocal] = $this->bounds($destination['amount'] ?? null);
        [$minSource, $maxSource] = $this->bounds($source['amount'] ?? null);

        return new OperatorDetail(
            operatorId: (string) $product['id'],
            name: (string) ($operator['name'] ?? ($product['name'] ?? '')),
            // Keep the app's own ISO-3166 alpha-2; DT One returns alpha-3.
            countryIso: $iso,
            denominationType: $ranged ? 'RANGE' : 'FIXED',
            localCurrency: (string) ($destination['unit'] ?? 'USD'),
            fxRate: $maxSource > 0 ? round($maxLocal / $maxSource, 6) : 1.0,
            minLocal: $minLocal > 0 ? $minLocal : null,
            maxLocal: $maxLocal > 0 ? $maxLocal : null,
            fixedAmounts: ! $ranged && $maxLocal > 0 ? [$maxLocal] : [],
        );
    }

    public function sendTopUp(TopUpOrder $order): TopUpResult
    {
        try {
            $resp = $this->client->post('/sync/transactions', [
                'external_id' => $order->customIdentifier,
                'product_id' => (int) $order->operatorId,
                'auto_confirm' => true,
                'credit_party_identifier' => ['mobile_number' => $this->e164($order->recipientPhone)],
            ]);
        } catch (RequestException $e) {
            return new TopUpResult(
                status: TransactionStatus::Failed,
                providerStatus: 'FAILED',
                message: $this->errorMessage($e),
                raw: ['error' => $e->response->json() ?? $e->getMessage()],
            );
        }

        return $this->toResult($resp);
    }

    public function getTransaction(string $providerTransactionId): TopUpResult
    {
        return $this->toResult($this->client->get('/transactions/'.$providerTransactionId), $providerTransactionId);
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $state = $this->statusValue($resp);

        $status = match (true) {
            in_array($state, self::SUCCESS_STATES, true) => TransactionStatus::Success,
            in_array($state, self::PENDING_STATES, true) => TransactionStatus::Processing,
            str_starts_with($state, 'DECLINED') || in_array($state, self::FAILED_STATES, true) => TransactionStatus::Failed,
            // Unknown states are treated as in-flight so a delivered top-up is
            // never wrongly failed; the stuck-transaction reconciler resolves it.
            default => TransactionStatus::Processing,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: isset($resp['id']) ? (string) $resp['id'] : $fallbackId,
            providerStatus: $state !== '' ? $state : null,
            message: $status === TransactionStatus::Failed && $state !== '' ? $state : null,
            raw: $resp,
        );
    }

    /**
     * DT One's status is a nested object ({id, message, class}); tolerate a bare
     * string too.
     *
     * @param  array<string, mixed>  $resp
     */
    private function statusValue(array $resp): string
    {
        $status = $resp['status'] ?? null;

        if (is_array($status)) {
            $status = $status['message'] ?? ($status['class']['message'] ?? '');
        }

        return strtoupper((string) $status);
    }

    /**
     * Normalize a DT One amount into [min, max]. Ranged products express it as a
     * {min,max,increment} object; fixed products as a plain number.
     *
     * @return array{0: float, 1: float}
     */
    private function bounds(mixed $amount): array
    {
        if (is_array($amount)) {
            $min = (float) ($amount['min'] ?? 0);
            $max = (float) ($amount['max'] ?? $min);

            return [$min, $max];
        }

        $value = (float) $amount;

        return [$value, $value];
    }

    /** Ensure the number is E.164 with a single leading +. */
    private function e164(string $phone): string
    {
        return '+'.ltrim($phone, '+');
    }

    /**
     * Pick the product to fulfil against. A sync transaction sends a fixed-value
     * product with just its id, whereas a ranged product also needs a
     * calculation_mode + source/destination amount the send step doesn't carry —
     * so a FIXED_VALUE product is preferred (always orderable); otherwise the
     * first product.
     *
     * @param  array<string, mixed>  $resp
     * @return array<string, mixed>|null
     */
    private function selectProduct(array $resp): ?array
    {
        $products = array_is_list($resp)
            ? $resp
            : (is_array($resp['data'] ?? null) ? $resp['data'] : []);
        $products = array_values(array_filter($products, 'is_array'));

        foreach ($products as $product) {
            if (! str_contains(strtoupper((string) ($product['type'] ?? '')), 'RANGED')) {
                return $product;
            }
        }

        return $products[0] ?? null;
    }

    /**
     * The first record in a DT One list response (a bare array or wrapped).
     *
     * @param  array<string, mixed>  $resp
     * @return array<string, mixed>|null
     */
    private function first(array $resp): ?array
    {
        if (array_is_list($resp)) {
            return is_array($resp[0] ?? null) ? $resp[0] : null;
        }

        foreach (['data', 'operators', 'products'] as $key) {
            if (is_array($resp[$key][0] ?? null)) {
                return $resp[$key][0];
            }
        }

        return $resp === [] ? null : $resp;
    }

    private function errorMessage(RequestException $e): string
    {
        $errors = $e->response->json('errors');

        if (is_array($errors) && $errors !== []) {
            $first = $errors[0] ?? $errors;

            return is_array($first) ? (string) ($first['message'] ?? json_encode($first)) : (string) $first;
        }

        return $e->getMessage();
    }
}
