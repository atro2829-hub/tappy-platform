<?php

namespace App\Services\Providers\Data;

/**
 * An instruction to deliver a top-up through a provider.
 */
final readonly class TopUpOrder
{
    public function __construct(
        public string $operatorId,
        public float $amount,
        public bool $useLocalAmount,
        public string $recipientPhone,
        public string $countryIso,
        /** Idempotency key forwarded to the provider (Reloadly: customIdentifier). */
        public string $customIdentifier,
    ) {}
}
