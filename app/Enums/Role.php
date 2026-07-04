<?php

namespace App\Enums;

enum Role: string
{
    case Business = 'business';
    case Reseller = 'reseller';
    case Customer = 'customer';
    case Admin = 'admin';

    /**
     * Human-friendly label shown in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Business => 'Business',
            self::Reseller => 'Reseller',
            self::Customer => 'Customer',
            self::Admin => 'Super Admin',
        };
    }

    /**
     * Short descriptor shown beneath the role label.
     */
    public function description(): string
    {
        return match ($this) {
            self::Business => 'Business account',
            self::Reseller => 'Agent network',
            self::Customer => 'Personal account',
            self::Admin => 'Platform operator',
        };
    }
}
