<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Success = 'success';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case Review = 'review';

    /**
     * Human-friendly label shown in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Processing => 'Processing',
            self::Success => 'Success',
            self::Failed => 'Failed',
            self::Refunded => 'Refunded',
            self::Review => 'Manual Review',
        };
    }

    /**
     * Whether the transaction has reached a final, immutable state.
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Success, self::Failed, self::Refunded], true);
    }

    /**
     * Whether funds have been captured from the wallet for this state.
     */
    public function holdsFunds(): bool
    {
        return in_array($this, [self::Processing, self::Success, self::Review], true);
    }
}
