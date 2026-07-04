<?php

namespace App\Services\Providers\Tremendous;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Tremendous-backed gift-card provider. Talks to the Tremendous API v2 and maps
 * its catalog and orders onto Tappy's provider-agnostic shapes.
 *
 * Orders are funded from the Tremendous account balance (funding_source_id
 * "balance"), so the account must be pre-funded. `external_id` carries the
 * idempotency key so retries return the existing order rather than re-issuing.
 *
 * Status: built to the published v2 spec; live-sandbox verification pending
 * credentials.
 */
class TremendousGiftCardProvider implements GiftCardProvider
{
    /** The only order status that means rewards are being delivered. */
    private const SUCCESS_STATES = ['EXECUTED'];

    /** Order statuses still in flight (must not be treated as failed). */
    private const PENDING_STATES = ['OPEN', 'CART', 'PENDING APPROVAL', 'PENDING INTERNAL PAYMENT APPROVAL', 'PENDING SETTLEMENT'];

    public function __construct(private readonly TremendousClient $client) {}

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        try {
            $resp = $this->client->get('/products', $countryIso !== null
                ? ['country' => strtoupper($countryIso)]
                : []);
        } catch (Throwable) {
            return [];
        }

        $products = is_array($resp['products'] ?? null) ? $resp['products'] : [];

        return array_values(array_map(
            fn (array $p): array => $this->mapProduct($p),
            array_slice(array_filter($products, 'is_array'), 0, $size),
        ));
    }

    /**
     * @param  array<string, mixed>  $p
     * @return array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}
     */
    private function mapProduct(array $p): array
    {
        $countries = array_values(array_filter(array_map(
            fn ($c): ?string => is_array($c) ? strtoupper((string) ($c['abbr'] ?? '')) : null,
            is_array($p['countries'] ?? null) ? $p['countries'] : [],
        )));

        $images = is_array($p['images'] ?? null) ? $p['images'] : [];
        $logo = is_array($images[0] ?? null) ? ($images[0]['src'] ?? null) : null;

        return [
            'id' => (string) ($p['id'] ?? ''),
            'brand' => (string) ($p['name'] ?? 'Gift card'),
            'cat' => (string) ($p['category'] ?? 'Gift card'),
            'denoms' => $this->denominations($p),
            'countries' => $countries,
            'logo' => $logo !== null ? (string) $logo : null,
        ];
    }

    /**
     * Flatten a product's SKUs into selectable denominations: fixed SKUs
     * (min == max) become exact values; a variable SKU becomes low/mid/high.
     *
     * @param  array<string, mixed>  $p
     * @return list<float>
     */
    private function denominations(array $p): array
    {
        $skus = is_array($p['skus'] ?? null) ? $p['skus'] : [];
        $denoms = [];

        foreach ($skus as $sku) {
            if (! is_array($sku)) {
                continue;
            }

            $min = (float) ($sku['min'] ?? 0);
            $max = (float) ($sku['max'] ?? $min);

            if ($min > 0 && $min === $max) {
                $denoms[] = $min;
            } elseif ($min < $max) {
                $denoms = [...$denoms, $min, round(($min + $max) / 2, 2), $max];
            }
        }

        return array_values(array_unique($denoms));
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        // A Tremendous order carries a single reward, so quantity > 1 becomes one
        // order per unit (each with its own external_id for idempotency). The
        // result reflects the last order; a failure short-circuits immediately.
        $quantity = max(1, $order->quantity);
        $result = null;

        for ($unit = 1; $unit <= $quantity; $unit++) {
            $externalId = $quantity === 1 ? $order->customIdentifier : $order->customIdentifier.'-'.$unit;

            try {
                $resp = $this->client->post('/orders', [
                    'external_id' => $externalId,
                    'payment' => ['funding_source_id' => 'balance'],
                    'reward' => $this->buildReward($order),
                ]);
            } catch (RequestException $e) {
                return new TopUpResult(
                    status: TransactionStatus::Failed,
                    providerStatus: 'FAILED',
                    message: $this->errorMessage($e),
                    raw: ['error' => $e->response->json() ?? $e->getMessage()],
                );
            }

            $result = $this->toResult($resp);

            if ($result->status === TransactionStatus::Failed) {
                return $result;
            }
        }

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildReward(GiftCardOrder $order): array
    {
        $isEmail = $order->deliverVia === 'email';
        $recipient = ['name' => $this->recipientName($order)];
        $recipient[$isEmail ? 'email' : 'phone'] = $order->recipient;

        return [
            'value' => ['denomination' => $order->unitPriceUsd, 'currency_code' => 'USD'],
            'products' => [$order->productId],
            'recipient' => $recipient,
            'delivery' => ['method' => $isEmail ? 'EMAIL' : 'PHONE'],
        ];
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return $this->toResult(
            $this->client->get('/orders/'.$providerTransactionId),
            $providerTransactionId,
        );
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $order = is_array($resp['order'] ?? null) ? $resp['order'] : [];
        $state = strtoupper((string) ($order['status'] ?? ''));
        $id = isset($order['id']) ? (string) $order['id'] : $fallbackId;

        $status = match (true) {
            in_array($state, self::SUCCESS_STATES, true) => TransactionStatus::Success,
            in_array($state, self::PENDING_STATES, true) => TransactionStatus::Processing,
            default => TransactionStatus::Failed,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: $id,
            providerStatus: $order['status'] ?? null,
            message: isset($resp['errors']) ? json_encode($resp['errors']) : null,
            raw: $resp,
        );
    }

    private function recipientName(GiftCardOrder $order): string
    {
        if (str_contains($order->recipient, '@')) {
            return ucfirst(strstr($order->recipient, '@', true) ?: 'Recipient');
        }

        return 'Recipient';
    }

    private function errorMessage(RequestException $e): string
    {
        $message = $e->response->json('errors.message');

        return is_string($message) && $message !== '' ? $message : $e->getMessage();
    }
}
