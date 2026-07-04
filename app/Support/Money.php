<?php

namespace App\Support;

/**
 * Conversions between human decimal amounts and integer minor units.
 *
 * The database always stores minor units (e.g. cents); the API and UI speak
 * decimals. Keep all rounding in one place.
 */
final class Money
{
    /**
     * Convert a decimal amount (e.g. 5.00) to minor units (e.g. 500).
     */
    public static function toMinor(int|float $amount): int
    {
        return (int) round($amount * 100);
    }

    /**
     * Convert minor units (e.g. 500) to a decimal amount (e.g. 5.0).
     */
    public static function toDecimal(int $minor): float
    {
        return $minor / 100;
    }
}
