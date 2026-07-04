<?php

namespace App\Services\Providers\Tillo;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Tillo-backed gift-card provider (4,000+ brands). Maps the signed Tillo v2 API
 * onto Tappy's provider-agnostic shapes.
 *
 * The Tappy product id is the Tillo brand slug (e.g. "amazon"). Issuance is
 * synchronous: a 200 returns the card, so client_request_id is the idempotency
 * key. Orders draw on the pre-funded Tillo float.
 *
 * Status: built to the published v2 spec; live-sandbox verification pending
 * credentials.
 */
class TilloGiftCardProvider implements GiftCardProvider
{
    public function __construct(
        private readonly TilloClient $client,
        private readonly string $sector = 'marketplace',
    ) {}

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        try {
            $resp = $this->client->get('/brands', 'brands', [], ['detail' => 'true']);
        } catch (Throwable) {
            return [];
        }

        $brands = $resp['data']['brands'] ?? [];
        $brands = is_array($brands) ? array_values(array_filter($brands, 'is_array')) : [];

        $products = [];

        foreach ($brands as $brand) {
            $product = $this->mapBrand($brand);

            if ($countryIso !== null && $product['countries'] !== [] && ! in_array(strtoupper($countryIso), $product['countries'], true)) {
                continue;
            }

            $products[] = $product;

            if (count($products) >= $size) {
                break;
            }
        }

        return $products;
    }

    /**
     * @param  array<string, mixed>  $brand
     * @return array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}
     */
    private function mapBrand(array $brand): array
    {
        $countries = array_values(array_filter(array_map(
            fn ($c): string => strtoupper((string) $c),
            is_array($brand['countries'] ?? null) ? $brand['countries'] : [],
        )));

        return [
            'id' => (string) ($brand['brand'] ?? $brand['slug'] ?? ''),
            'brand' => (string) ($brand['name'] ?? $brand['brand'] ?? 'Gift card'),
            'cat' => (string) ($brand['category'] ?? ($brand['type'] ?? 'Gift card')),
            'denoms' => $this->denominations($brand),
            'countries' => $countries,
            'logo' => isset($brand['logo']) ? (string) $brand['logo'] : (isset($brand['image']) ? (string) $brand['image'] : null),
        ];
    }

    /**
     * @param  array<string, mixed>  $brand
     * @return list<float>
     */
    private function denominations(array $brand): array
    {
        $denominations = $brand['denominations'] ?? [];

        if (! is_array($denominations)) {
            return [];
        }

        // Fixed list of values.
        if (array_is_list($denominations)) {
            return array_values(array_map('floatval', $denominations));
        }

        // Variable range {from, to}.
        $from = (float) ($denominations['from'] ?? 0);
        $to = (float) ($denominations['to'] ?? $from);

        if ($from > 0 && $from < $to) {
            return [$from, round(($from + $to) / 2, 2), $to];
        }

        return $from > 0 ? [$from] : [];
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        // Tillo issues one card per request, so quantity > 1 becomes one issuance
        // per unit (each with its own client_request_id for idempotency). A
        // failure short-circuits; the result reflects the last issuance.
        $quantity = max(1, $order->quantity);
        $result = null;

        for ($unit = 1; $unit <= $quantity; $unit++) {
            $requestId = $quantity === 1 ? $order->customIdentifier : $order->customIdentifier.'-'.$unit;
            $result = $this->issueOne($order, $requestId);

            if ($result->status === TransactionStatus::Failed) {
                return $result;
            }
        }

        return $result;
    }

    private function issueOne(GiftCardOrder $order, string $requestId): TopUpResult
    {
        $currency = 'USD';
        // The amount must be byte-identical in the signature and the JSON body, so
        // serialize it once to a fixed 2dp string and reuse it for both.
        $amount = number_format($order->unitPriceUsd, 2, '.', '');

        try {
            // Tillo's issue signature is apiKey-POST-digital-issue-{crid}-{brand}-{currency}-{amount}-{ts}.
            $resp = $this->client->post('/digital/issue', 'digital-issue', [$requestId, $order->productId, $currency, $amount], [
                'client_request_id' => $requestId,
                'brand' => $order->productId,
                'face_value' => ['amount' => $amount, 'currency' => $currency],
                'delivery_method' => 'code',
                'fulfilment_by' => 'partner',
                'sector' => $this->sector,
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

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        // GET signatures sign only the brand (absent here), so the reference rides
        // as a query param and is not part of the signature parts.
        return $this->toResult(
            $this->client->get('/digital/order-status', 'digital-order-status', [], ['reference' => $providerTransactionId]),
            $providerTransactionId,
        );
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $data = is_array($resp['data'] ?? null) ? $resp['data'] : [];
        $reference = $data['reference'] ?? $data['code'] ?? $fallbackId;
        $state = strtoupper((string) ($resp['status'] ?? $data['status'] ?? 'success'));

        // order-status returns REQUESTED | PENDING | PROCESSING | SUCCESS | ERROR.
        $status = match ($state) {
            'SUCCESS', 'SUCCESSFUL', 'COMPLETE', 'COMPLETED', 'FULFILLED' => TransactionStatus::Success,
            'REQUESTED', 'PENDING', 'PROCESSING' => TransactionStatus::Processing,
            default => TransactionStatus::Failed,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: $reference !== null ? (string) $reference : null,
            providerStatus: (string) ($resp['status'] ?? $data['status'] ?? 'success'),
            message: isset($resp['message']) ? (string) $resp['message'] : null,
            raw: $resp,
        );
    }

    private function errorMessage(RequestException $e): string
    {
        $message = $e->response->json('message') ?? $e->response->json('errors.0.message');

        return is_string($message) && $message !== '' ? $message : $e->getMessage();
    }
}
