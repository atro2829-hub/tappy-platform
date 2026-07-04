<?php

namespace App\Services;

/**
 * Validated inputs for a gift-card purchase (assembled by the controller).
 */
final readonly class GiftCardPurchaseInput
{
    public function __construct(
        public string $productId,
        public string $brand,
        public int $denomMinor,
        public int $quantity,
        public string $recipient,
        /** 'email' | 'sms' */
        public string $deliverVia,
        public string $countryIso,
        public ?string $message = null,
        public ?string $idempotencyKey = null,
    ) {}
}
