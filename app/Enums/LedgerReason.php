<?php

namespace App\Enums;

enum LedgerReason: string
{
    case Funding = 'funding';
    case Purchase = 'purchase';
    case Refund = 'refund';
    case Fee = 'fee';
    case Adjustment = 'adjustment';

    /**
     * Human-friendly label shown in the wallet ledger.
     */
    public function label(): string
    {
        return match ($this) {
            self::Funding => 'Wallet funding',
            self::Purchase => 'Purchase',
            self::Refund => 'Refund',
            self::Fee => 'Fee',
            self::Adjustment => 'Adjustment',
        };
    }
}
