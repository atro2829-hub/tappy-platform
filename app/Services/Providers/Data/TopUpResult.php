<?php

namespace App\Services\Providers\Data;

use App\Enums\TransactionStatus;

/**
 * The outcome of sending a top-up (or polling its status).
 */
final readonly class TopUpResult
{
    /**
     * @param  array<string, mixed>  $raw  the provider's raw payload, for auditing
     */
    public function __construct(
        public TransactionStatus $status,
        public ?string $providerTransactionId = null,
        public ?string $providerStatus = null,
        public ?string $message = null,
        public array $raw = [],
    ) {}

    /**
     * Map a provider's textual status onto our transaction lifecycle.
     */
    public static function statusFromProvider(?string $providerStatus): TransactionStatus
    {
        return match (strtoupper((string) $providerStatus)) {
            'SUCCESSFUL', 'SUCCESS', 'COMPLETED' => TransactionStatus::Success,
            'PROCESSING', 'PENDING' => TransactionStatus::Processing,
            'REFUNDED' => TransactionStatus::Refunded,
            default => TransactionStatus::Failed,
        };
    }
}
