// Currency configuration for Tappy platform
// Base currency: YER (Yemeni Rial)
// Supported: YER, SAR (Saudi Riyal), USD (US Dollar)

const CURRENCY_SYMBOLS: Record<string, string> = {
    YER: 'ر.ي ',
    SAR: 'ر.س ',
    USD: '$',
    NGN: '₦',
    INR: '₹',
    KES: 'KSh ',
    PHP: '₱',
    GBP: '£',
    EUR: '€',
    GHS: 'GH₵',
    ZAR: 'R',
    BDT: '৳',
};

const CURRENCY_DECIMALS: Record<string, number> = {
    YER: 0,  // Yemeni Rial has no minor unit
    SAR: 2,  // Saudi Riyal (halala)
    USD: 2,
};

// Conversion rates from YER (base) to other currencies
const CURRENCY_RATES: Record<string, number> = {
    YER: 1.0,
    SAR: 0.037,
    USD: 0.0099,
};

export const BASE_CURRENCY = 'YER';
export const SUPPORTED_CURRENCIES = ['YER', 'SAR', 'USD'];

/** Format a money amount with the currency symbol, e.g. fmt(1234.5) -> "$1,234.50". */
export function fmt(n: number, cur: string = BASE_CURRENCY): string {
    const sym = CURRENCY_SYMBOLS[cur] ?? `${cur} `;
    const decimals = CURRENCY_DECIMALS[cur] ?? 2;

    const v = Math.abs(n).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return `${n < 0 ? '-' : ''}${sym}${v}`;
}

/** Format an integer with thousands separators. */
export function fmtInt(n: number): string {
    return n.toLocaleString('en-US');
}

/** Convert from base currency (YER) to target currency. */
export function convertFromBase(amountBase: number, toCurrency: string): number {
    if (toCurrency === BASE_CURRENCY) return amountBase;
    const rate = CURRENCY_RATES[toCurrency] ?? 1;
    return amountBase * rate;
}

/** Convert from a given currency to base currency (YER). */
export function convertToBase(amount: number, fromCurrency: string): number {
    if (fromCurrency === BASE_CURRENCY) return amount;
    const rate = CURRENCY_RATES[fromCurrency] ?? 1;
    if (rate === 0) return amount;
    return amount / rate;
}

/** Get currency decimals. */
export function currencyDecimals(cur: string): number {
    return CURRENCY_DECIMALS[cur] ?? 2;
}

/** Get currency symbol. */
export function currencySymbol(cur: string): string {
    return CURRENCY_SYMBOLS[cur] ?? cur;
}
