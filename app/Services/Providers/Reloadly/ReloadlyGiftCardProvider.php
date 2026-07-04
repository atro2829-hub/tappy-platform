<?php

namespace App\Services\Providers\Reloadly;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Reloadly-backed gift-card provider. Talks to the Reloadly Gift Cards API and
 * maps its responses into the provider-agnostic {@see TopUpResult}.
 */
class ReloadlyGiftCardProvider implements GiftCardProvider
{
    public function __construct(private readonly ReloadlyClient $client) {}

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        $path = $countryIso !== null
            ? '/countries/'.strtoupper($countryIso).'/products'
            : '/products';

        try {
            $resp = $this->client->get($path, ['size' => $size, 'page' => 1]);
        } catch (Throwable) {
            return [];
        }

        $items = $resp['content'] ?? (array_is_list($resp) ? $resp : []);

        return array_values(array_map(fn (array $p): array => $this->mapProduct($p), $items));
    }

    /**
     * @param  array<string, mixed>  $p
     * @return array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}
     */
    private function mapProduct(array $p): array
    {
        $denoms = [];

        if (! empty($p['fixedSenderDenominations'])) {
            $denoms = array_map('floatval', $p['fixedSenderDenominations']);
        } elseif (isset($p['minSenderDenomination'], $p['maxSenderDenomination'])) {
            $min = (float) $p['minSenderDenomination'];
            $max = (float) $p['maxSenderDenomination'];
            $denoms = $min < $max ? [$min, round(($min + $max) / 2, 2), $max] : [$min];
        }

        $iso = $p['country']['isoName'] ?? null;

        return [
            'id' => (string) ($p['productId'] ?? ''),
            'brand' => (string) ($p['productName'] ?? ($p['brand']['brandName'] ?? 'Gift card')),
            'cat' => (string) ($p['category']['name'] ?? 'Gift card'),
            'denoms' => array_values($denoms),
            'countries' => $iso ? [strtoupper((string) $iso)] : [],
            'logo' => $p['logoUrls'][0] ?? null,
        ];
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        try {
            $resp = $this->client->post('/orders', [
                'productId' => (int) $order->productId,
                'countryCode' => strtoupper($order->countryIso),
                'quantity' => $order->quantity,
                'unitPrice' => $order->unitPriceUsd,
                'customIdentifier' => $order->customIdentifier,
                'senderName' => $order->senderName ?? 'Tappy',
                'recipientEmail' => $order->deliverVia === 'email' ? $order->recipient : null,
            ]);
        } catch (RequestException $e) {
            return new TopUpResult(
                status: TransactionStatus::Failed,
                providerStatus: 'FAILED',
                message: $e->getMessage(),
                raw: ['error' => $e->response->json() ?? $e->getMessage()],
            );
        }

        return $this->toResult($resp);
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return $this->toResult(
            $this->client->get('/orders/transactions/'.$providerTransactionId),
            $providerTransactionId,
        );
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $status = (string) ($resp['status'] ?? 'FAILED');

        return new TopUpResult(
            status: TopUpResult::statusFromProvider($status),
            providerTransactionId: isset($resp['transactionId']) ? (string) $resp['transactionId'] : $fallbackId,
            providerStatus: $status,
            message: isset($resp['message']) ? (string) $resp['message'] : null,
            raw: $resp,
        );
    }
}
