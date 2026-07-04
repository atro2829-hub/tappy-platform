<?php

namespace App\Services\Payments\Data;

/**
 * Provider-agnostic result of a gateway charge.
 */
final class PaymentResult
{
    public function __construct(
        public readonly bool $approved,
        public readonly string $reference,
        public readonly ?string $message = null,
    ) {}
}
