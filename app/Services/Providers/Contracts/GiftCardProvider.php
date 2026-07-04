<?php

namespace App\Services\Providers\Contracts;

use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;

/**
 * Abstraction over a gift-card provider (Reloadly, or the in-memory fake).
 */
interface GiftCardProvider
{
    /**
     * List available gift-card products, normalized to:
     * ['id','brand','cat','denoms'(USD float[]),'countries'(iso[]),'logo'(?url)].
     *
     * @return list<array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}>
     */
    public function listProducts(?string $countryIso = null, int $size = 50): array;

    /**
     * Place a gift-card order. Implementations should treat `customIdentifier`
     * as an idempotency key so retries do not double-charge.
     */
    public function order(GiftCardOrder $order): TopUpResult;

    /**
     * Fetch the current state of a previously-placed order by its provider id.
     */
    public function getOrder(string $providerTransactionId): TopUpResult;
}
