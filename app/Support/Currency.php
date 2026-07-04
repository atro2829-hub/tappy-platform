<?php

namespace App\Support;

/**
 * Multi-currency support for Tappy platform.
 *
 * Base currency: YER (Yemeni Rial)
 * Additional supported: SAR (Saudi Riyal), USD (US Dollar)
 *
 * All internal amounts are stored as minor units (integer) in the base currency (YER).
 * Conversion to display currencies uses the rates defined in settings.
 */
final class Currency
{
    /**
     * Base currency of the platform.
     */
    public const BASE = 'YER';

    /**
     * All supported currencies.
     */
    public const SUPPORTED = ['YER', 'SAR', 'USD'];

    /**
     * Decimal places per currency (for display).
     */
    public const DECIMALS = [
        'YER' => 0,   // Yemeni Rial has no minor unit
        'SAR' => 2,   // Saudi Riyal: 2 decimals (halala)
        'USD' => 2,   // US Dollar: 2 decimals (cents)
    ];

    /**
     * Conversion rate from 1 unit of base currency (YER) to other currencies.
     * E.g., 1 YER = 0.037 SAR, 1 YER = 0.0099 USD
     */
    public const RATES = [
        'YER' => 1.0,
        'SAR' => 0.037,
        'USD' => 0.0099,
    ];

    /**
     * Currency symbols for display.
     */
    public const SYMBOLS = [
        'YER' => 'ر.ي',
        'SAR' => 'ر.س',
        'USD' => '$',
    ];

    /**
     * Get the base currency.
     */
    public static function base(): string
    {
        return env('BASE_CURRENCY', self::BASE);
    }

    /**
     * Get all supported currencies.
     */
    public static function supported(): array
    {
        $env = env('SUPPORTED_CURRENCIES');
        if ($env) {
            return array_map('trim', explode(',', $env));
        }
        return self::SUPPORTED;
    }

    /**
     * Get decimals for a currency.
     */
    public static function decimals(string $currency): int
    {
        return self::DECIMALS[$currency] ?? 2;
    }

    /**
     * Get conversion rate from base to target currency.
     */
    public static function rate(string $currency): float
    {
        if ($currency === self::base()) {
            return 1.0;
        }
        return self::RATES[$currency] ?? 1.0;
    }

    /**
     * Get currency symbol.
     */
    public static function symbol(string $currency): string
    {
        return self::SYMBOLS[$currency] ?? $currency;
    }

    /**
     * Convert a minor-unit amount from base currency to a target currency.
     * Returns minor units in the target currency.
     */
    public static function convert(int $baseMinor, string $toCurrency): int
    {
        if ($toCurrency === self::base()) {
            return $baseMinor;
        }

        $rate = self::rate($toCurrency);
        $baseDecimals = self::decimals(self::base());
        $targetDecimals = self::decimals($toCurrency);

        // Convert minor -> major in base, multiply by rate, convert back to minor in target
        $baseMajor = $baseMinor / pow(10, $baseDecimals);
        $targetMajor = $baseMajor * $rate;
        $targetMinor = (int) round($targetMajor * pow(10, $targetDecimals));

        return $targetMinor;
    }

    /**
     * Format a minor-unit amount as a human-readable string with symbol.
     */
    public static function format(int $minor, string $currency = null, bool $withSymbol = true): string
    {
        $currency = $currency ?? self::base();
        $decimals = self::decimals($currency);
        $major = $minor / pow(10, $decimals);

        $formatted = number_format($major, $decimals, '.', ',');

        if ($withSymbol) {
            return $formatted . ' ' . self::symbol($currency);
        }

        return $formatted;
    }

    /**
     * Convert a major decimal amount to minor units in the given currency.
     */
    public static function toMinor(float $amount, string $currency = null): int
    {
        $currency = $currency ?? self::base();
        $decimals = self::decimals($currency);
        return (int) round($amount * pow(10, $decimals));
    }

    /**
     * Convert minor units to a major decimal amount in the given currency.
     */
    public static function toDecimal(int $minor, string $currency = null): float
    {
        $currency = $currency ?? self::base();
        $decimals = self::decimals($currency);
        return $minor / pow(10, $decimals);
    }
}
