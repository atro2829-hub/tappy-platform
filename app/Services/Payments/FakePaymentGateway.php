<?php

namespace App\Services\Payments;

use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Payments\Data\PaymentResult;
use Illuminate\Support\Str;

/**
 * Deterministic, network-free gateway for local/dev funding. Approves every
 * charge instantly (no real money moves). Swap for a real gateway (e.g. Stripe)
 * in production by binding it behind config('services.payments.driver').
 */
final class FakePaymentGateway implements PaymentGateway
{
    public function charge(int $amountMinor, string $currency, array $meta = []): PaymentResult
    {
        return new PaymentResult(
            approved: true,
            reference: 'FAKE-PAY-'.strtoupper(Str::random(12)),
        );
    }
}
