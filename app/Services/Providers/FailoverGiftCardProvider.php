<?php

namespace App\Services\Providers;

use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Throwable;

/**
 * Routes gift-card reads across a primary provider and a fallback: the catalog
 * falls over to the fallback when the primary returns nothing (or errors),
 * widening brand coverage and surviving a primary outage.
 *
 * Orders and status lookups deliberately stay on the primary — never fail an
 * order over to another provider, since a primary that returned an error may
 * still have issued the card, and an order belongs to whoever processed it.
 */
final class FailoverGiftCardProvider implements GiftCardProvider
{
    public function __construct(
        private readonly GiftCardProvider $primary,
        private readonly GiftCardProvider $fallback,
    ) {}

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        $products = $this->attempt(fn (): array => $this->primary->listProducts($countryIso, $size));

        return $products !== []
            ? $products
            : $this->attempt(fn (): array => $this->fallback->listProducts($countryIso, $size));
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        return $this->primary->order($order);
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return $this->primary->getOrder($providerTransactionId);
    }

    /**
     * @param  callable(): list<array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}>  $resolver
     * @return list<array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}>
     */
    private function attempt(callable $resolver): array
    {
        try {
            return $resolver();
        } catch (Throwable) {
            return [];
        }
    }
}
