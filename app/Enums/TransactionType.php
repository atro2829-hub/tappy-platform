<?php

namespace App\Enums;

enum TransactionType: string
{
    case Airtime = 'airtime';
    case Data = 'data';
    case GiftCard = 'giftcard';
    case Utility = 'utility';

    /**
     * Human-friendly label shown in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Airtime => 'Airtime',
            self::Data => 'Data Bundle',
            self::GiftCard => 'Gift Card',
            self::Utility => 'Utility',
        };
    }
}
