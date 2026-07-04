<?php

namespace App\Services\Providers;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;

/**
 * Deterministic, network-free gift-card provider for local dev and tests.
 *
 * Recipient or customIdentifier containing "fail" -> FAILED, "pending" ->
 * PROCESSING, anything else -> SUCCESSFUL.
 */
final class FakeGiftCardProvider implements GiftCardProvider
{
    /**
     * @var list<array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}>
     */
    private const PRODUCTS = [
        ['id' => '16627', 'brand' => 'Amazon', 'cat' => 'eCommerce', 'denoms' => [10, 25, 50, 100], 'countries' => ['US', 'GB', 'IN'], 'logo' => null],
        ['id' => '14', 'brand' => 'Netflix', 'cat' => 'Streaming', 'denoms' => [15, 25, 50], 'countries' => ['US', 'NG', 'KE'], 'logo' => null],
        ['id' => '23', 'brand' => 'Google Play', 'cat' => 'Gaming', 'denoms' => [10, 25, 50, 100], 'countries' => ['US', 'GB', 'IN', 'NG'], 'logo' => null],
        ['id' => '36', 'brand' => 'Steam', 'cat' => 'Gaming', 'denoms' => [20, 50, 100], 'countries' => ['US', 'GB'], 'logo' => null],
        ['id' => '47', 'brand' => 'Spotify', 'cat' => 'Streaming', 'denoms' => [10, 30, 60], 'countries' => ['US', 'GB', 'PH'], 'logo' => null],
        ['id' => '58', 'brand' => 'Apple', 'cat' => 'eCommerce', 'denoms' => [15, 25, 50, 100], 'countries' => ['US', 'GB', 'IN'], 'logo' => null],
        ['id' => '69', 'brand' => 'PlayStation', 'cat' => 'Gaming', 'denoms' => [10, 25, 50], 'countries' => ['US', 'GB'], 'logo' => null],
        ['id' => '70', 'brand' => 'Xbox', 'cat' => 'Gaming', 'denoms' => [15, 25, 50], 'countries' => ['US', 'GB'], 'logo' => null],
        ['id' => '81', 'brand' => 'Uber', 'cat' => 'Lifestyle', 'denoms' => [15, 25, 50], 'countries' => ['US', 'GB', 'KE'], 'logo' => null],
        ['id' => '92', 'brand' => 'Airbnb', 'cat' => 'Travel', 'denoms' => [25, 50, 100], 'countries' => ['US', 'GB'], 'logo' => null],
    ];

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        $products = self::PRODUCTS;

        if ($countryIso !== null) {
            $iso = strtoupper($countryIso);
            $products = array_values(array_filter(
                $products,
                fn (array $p): bool => in_array($iso, $p['countries'], true),
            ));
        }

        return array_slice($products, 0, $size);
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        $providerId = 'FAKE-GC-'.substr(md5($order->customIdentifier), 0, 10);
        $marker = strtolower($order->recipient.' '.$order->customIdentifier);

        if (str_contains($marker, 'fail')) {
            return new TopUpResult(TransactionStatus::Failed, $providerId, 'FAILED', 'Simulated gift-card failure.');
        }

        if (str_contains($marker, 'pending')) {
            return new TopUpResult(TransactionStatus::Processing, $providerId, 'PROCESSING', 'Simulated async delivery.');
        }

        return new TopUpResult(TransactionStatus::Success, $providerId, 'SUCCESSFUL', 'Simulated gift-card delivery.');
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return new TopUpResult(TransactionStatus::Success, $providerTransactionId, 'SUCCESSFUL');
    }
}
