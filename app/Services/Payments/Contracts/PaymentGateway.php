<?php

namespace App\Services\Payments\Contracts;

use App\Services\Payments\Data\PaymentResult;

/**
 * Abstraction over a card/bank payment gateway used to fund the wallet.
 */
interface PaymentGateway
{
    /**
     * Charge the given amount (in minor units). Implementations should treat
     * any provided idempotency key in `$meta` as a de-duplication guard.
     *
     * @param  array<string, mixed>  $meta
     */
    public function charge(int $amountMinor, string $currency, array $meta = []): PaymentResult;
}
