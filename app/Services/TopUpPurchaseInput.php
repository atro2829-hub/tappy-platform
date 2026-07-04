<?php

namespace App\Services;

use App\Enums\TransactionType;

/**
 * Validated inputs for a top-up purchase (assembled by the controller).
 */
final readonly class TopUpPurchaseInput
{
    public function __construct(
        public string $countryIso,
        public string $recipientPhone,
        public int $amountUsdMinor,
        public string $operatorId,
        public string $operatorName,
        public TransactionType $type = TransactionType::Airtime,
        public ?int $localAmountMinor = null,
        public ?string $localCurrency = null,
        public ?string $recipientName = null,
        public ?string $idempotencyKey = null,
    ) {}
}
