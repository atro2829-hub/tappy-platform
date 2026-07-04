<?php

namespace App\Services\Providers\Data;

/**
 * An instruction to deliver a gift card through a provider.
 */
final readonly class GiftCardOrder
{
    public function __construct(
        public string $productId,
        public int $quantity,
        public float $unitPriceUsd,
        public string $recipient,
        /** 'email' | 'sms' */
        public string $deliverVia,
        public string $countryIso,
        /** Idempotency key forwarded to the provider (Reloadly: customIdentifier). */
        public string $customIdentifier,
        public ?string $senderName = null,
        public ?string $message = null,
    ) {}
}
