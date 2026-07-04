/**
 * Mock data for the Tappy screens, ported from the design prototype. This is
 * demo/sample data only — no backend yet — so screens render realistically.
 */
import type { IconName } from '@/components/ui/icon';

export interface Country {
    iso: string;
    name: string;
    cur: string;
    dial: string;
    /** Indicative rate, only present for reference; live rate comes from detection. */
    fx?: number;
}

export interface Operator {
    id: string;
    name: string;
    color: string;
    txt: string;
    min?: number;
    max?: number;
    type: 'range' | 'fixed';
    amounts?: number[];
    /** Live exchange rate + local currency from operator detection. */
    fx?: number;
    cur?: string;
}

/**
 * Supported destination countries (ISO code, name, currency, dialing code).
 * The mobile operator and live exchange rate are resolved per recipient via
 * operator detection, so no rate is bundled here.
 */
export const COUNTRIES: Country[] = [
    { iso: 'NG', name: 'Nigeria', cur: 'NGN', dial: '+234', fx: 1580 },
    { iso: 'GH', name: 'Ghana', cur: 'GHS', dial: '+233', fx: 15.3 },
    { iso: 'KE', name: 'Kenya', cur: 'KES', dial: '+254', fx: 129 },
    { iso: 'TZ', name: 'Tanzania', cur: 'TZS', dial: '+255' },
    { iso: 'UG', name: 'Uganda', cur: 'UGX', dial: '+256' },
    { iso: 'RW', name: 'Rwanda', cur: 'RWF', dial: '+250' },
    { iso: 'ET', name: 'Ethiopia', cur: 'ETB', dial: '+251' },
    { iso: 'ZA', name: 'South Africa', cur: 'ZAR', dial: '+27', fx: 18.6 },
    { iso: 'ZM', name: 'Zambia', cur: 'ZMW', dial: '+260' },
    { iso: 'ZW', name: 'Zimbabwe', cur: 'ZWL', dial: '+263' },
    { iso: 'CM', name: 'Cameroon', cur: 'XAF', dial: '+237' },
    { iso: 'CI', name: "Côte d'Ivoire", cur: 'XOF', dial: '+225' },
    { iso: 'SN', name: 'Senegal', cur: 'XOF', dial: '+221' },
    { iso: 'ML', name: 'Mali', cur: 'XOF', dial: '+223' },
    { iso: 'BF', name: 'Burkina Faso', cur: 'XOF', dial: '+226' },
    { iso: 'BJ', name: 'Benin', cur: 'XOF', dial: '+229' },
    { iso: 'TG', name: 'Togo', cur: 'XOF', dial: '+228' },
    { iso: 'GN', name: 'Guinea', cur: 'GNF', dial: '+224' },
    { iso: 'CD', name: 'DR Congo', cur: 'CDF', dial: '+243' },
    { iso: 'CG', name: 'Congo', cur: 'XAF', dial: '+242' },
    { iso: 'GA', name: 'Gabon', cur: 'XAF', dial: '+241' },
    { iso: 'AO', name: 'Angola', cur: 'AOA', dial: '+244' },
    { iso: 'MZ', name: 'Mozambique', cur: 'MZN', dial: '+258' },
    { iso: 'MW', name: 'Malawi', cur: 'MWK', dial: '+265' },
    { iso: 'BW', name: 'Botswana', cur: 'BWP', dial: '+267' },
    { iso: 'NA', name: 'Namibia', cur: 'NAD', dial: '+264' },
    { iso: 'MG', name: 'Madagascar', cur: 'MGA', dial: '+261' },
    { iso: 'MU', name: 'Mauritius', cur: 'MUR', dial: '+230' },
    { iso: 'EG', name: 'Egypt', cur: 'EGP', dial: '+20' },
    { iso: 'MA', name: 'Morocco', cur: 'MAD', dial: '+212' },
    { iso: 'DZ', name: 'Algeria', cur: 'DZD', dial: '+213' },
    { iso: 'TN', name: 'Tunisia', cur: 'TND', dial: '+216' },
    { iso: 'LY', name: 'Libya', cur: 'LYD', dial: '+218' },
    { iso: 'SL', name: 'Sierra Leone', cur: 'SLL', dial: '+232' },
    { iso: 'LR', name: 'Liberia', cur: 'LRD', dial: '+231' },
    { iso: 'GM', name: 'Gambia', cur: 'GMD', dial: '+220' },
    { iso: 'US', name: 'United States', cur: 'YER', dial: '+1', fx: 1 },
    { iso: 'CA', name: 'Canada', cur: 'CAD', dial: '+1' },
    { iso: 'MX', name: 'Mexico', cur: 'MXN', dial: '+52' },
    { iso: 'GT', name: 'Guatemala', cur: 'GTQ', dial: '+502' },
    { iso: 'SV', name: 'El Salvador', cur: 'YER', dial: '+503' },
    { iso: 'HN', name: 'Honduras', cur: 'HNL', dial: '+504' },
    { iso: 'NI', name: 'Nicaragua', cur: 'NIO', dial: '+505' },
    { iso: 'CR', name: 'Costa Rica', cur: 'CRC', dial: '+506' },
    { iso: 'PA', name: 'Panama', cur: 'PAB', dial: '+507' },
    { iso: 'DO', name: 'Dominican Republic', cur: 'DOP', dial: '+1' },
    { iso: 'JM', name: 'Jamaica', cur: 'JMD', dial: '+1' },
    { iso: 'HT', name: 'Haiti', cur: 'HTG', dial: '+509' },
    { iso: 'CO', name: 'Colombia', cur: 'COP', dial: '+57' },
    { iso: 'VE', name: 'Venezuela', cur: 'VES', dial: '+58' },
    { iso: 'EC', name: 'Ecuador', cur: 'YER', dial: '+593' },
    { iso: 'PE', name: 'Peru', cur: 'PEN', dial: '+51' },
    { iso: 'BO', name: 'Bolivia', cur: 'BOB', dial: '+591' },
    { iso: 'BR', name: 'Brazil', cur: 'BRL', dial: '+55' },
    { iso: 'AR', name: 'Argentina', cur: 'ARS', dial: '+54' },
    { iso: 'CL', name: 'Chile', cur: 'CLP', dial: '+56' },
    { iso: 'PY', name: 'Paraguay', cur: 'PYG', dial: '+595' },
    { iso: 'UY', name: 'Uruguay', cur: 'UYU', dial: '+598' },
    { iso: 'GB', name: 'United Kingdom', cur: 'GBP', dial: '+44', fx: 0.79 },
    { iso: 'IE', name: 'Ireland', cur: 'EUR', dial: '+353' },
    { iso: 'FR', name: 'France', cur: 'EUR', dial: '+33' },
    { iso: 'DE', name: 'Germany', cur: 'EUR', dial: '+49' },
    { iso: 'ES', name: 'Spain', cur: 'EUR', dial: '+34' },
    { iso: 'PT', name: 'Portugal', cur: 'EUR', dial: '+351' },
    { iso: 'IT', name: 'Italy', cur: 'EUR', dial: '+39' },
    { iso: 'NL', name: 'Netherlands', cur: 'EUR', dial: '+31' },
    { iso: 'BE', name: 'Belgium', cur: 'EUR', dial: '+32' },
    { iso: 'CH', name: 'Switzerland', cur: 'CHF', dial: '+41' },
    { iso: 'AT', name: 'Austria', cur: 'EUR', dial: '+43' },
    { iso: 'SE', name: 'Sweden', cur: 'SEK', dial: '+46' },
    { iso: 'NO', name: 'Norway', cur: 'NOK', dial: '+47' },
    { iso: 'DK', name: 'Denmark', cur: 'DKK', dial: '+45' },
    { iso: 'FI', name: 'Finland', cur: 'EUR', dial: '+358' },
    { iso: 'PL', name: 'Poland', cur: 'PLN', dial: '+48' },
    { iso: 'RO', name: 'Romania', cur: 'RON', dial: '+40' },
    { iso: 'GR', name: 'Greece', cur: 'EUR', dial: '+30' },
    { iso: 'UA', name: 'Ukraine', cur: 'UAH', dial: '+380' },
    { iso: 'RU', name: 'Russia', cur: 'RUB', dial: '+7' },
    { iso: 'TR', name: 'Turkey', cur: 'TRY', dial: '+90' },
    { iso: 'IN', name: 'India', cur: 'INR', dial: '+91', fx: 83.4 },
    { iso: 'PK', name: 'Pakistan', cur: 'PKR', dial: '+92' },
    { iso: 'BD', name: 'Bangladesh', cur: 'BDT', dial: '+880', fx: 117 },
    { iso: 'LK', name: 'Sri Lanka', cur: 'LKR', dial: '+94' },
    { iso: 'NP', name: 'Nepal', cur: 'NPR', dial: '+977' },
    { iso: 'AF', name: 'Afghanistan', cur: 'AFN', dial: '+93' },
    { iso: 'CN', name: 'China', cur: 'CNY', dial: '+86' },
    { iso: 'HK', name: 'Hong Kong', cur: 'HKD', dial: '+852' },
    { iso: 'TW', name: 'Taiwan', cur: 'TWD', dial: '+886' },
    { iso: 'JP', name: 'Japan', cur: 'JPY', dial: '+81' },
    { iso: 'KR', name: 'South Korea', cur: 'KRW', dial: '+82' },
    { iso: 'PH', name: 'Philippines', cur: 'PHP', dial: '+63', fx: 57.2 },
    { iso: 'ID', name: 'Indonesia', cur: 'IDR', dial: '+62' },
    { iso: 'MY', name: 'Malaysia', cur: 'MYR', dial: '+60' },
    { iso: 'SG', name: 'Singapore', cur: 'SGD', dial: '+65' },
    { iso: 'TH', name: 'Thailand', cur: 'THB', dial: '+66' },
    { iso: 'VN', name: 'Vietnam', cur: 'VND', dial: '+84' },
    { iso: 'KH', name: 'Cambodia', cur: 'KHR', dial: '+855' },
    { iso: 'MM', name: 'Myanmar', cur: 'MMK', dial: '+95' },
    { iso: 'LA', name: 'Laos', cur: 'LAK', dial: '+856' },
    { iso: 'AE', name: 'United Arab Emirates', cur: 'AED', dial: '+971' },
    { iso: 'SA', name: 'Saudi Arabia', cur: 'SAR', dial: '+966' },
    { iso: 'QA', name: 'Qatar', cur: 'QAR', dial: '+974' },
    { iso: 'KW', name: 'Kuwait', cur: 'KWD', dial: '+965' },
    { iso: 'BH', name: 'Bahrain', cur: 'BHD', dial: '+973' },
    { iso: 'OM', name: 'Oman', cur: 'OMR', dial: '+968' },
    { iso: 'JO', name: 'Jordan', cur: 'JOD', dial: '+962' },
    { iso: 'LB', name: 'Lebanon', cur: 'LBP', dial: '+961' },
    { iso: 'IL', name: 'Israel', cur: 'ILS', dial: '+972' },
    { iso: 'IQ', name: 'Iraq', cur: 'IQD', dial: '+964' },
    { iso: 'YE', name: 'Yemen', cur: 'YER', dial: '+967' },
    { iso: 'AU', name: 'Australia', cur: 'AUD', dial: '+61' },
    { iso: 'NZ', name: 'New Zealand', cur: 'NZD', dial: '+64' },
    { iso: 'FJ', name: 'Fiji', cur: 'FJD', dial: '+679' },
    { iso: 'PG', name: 'Papua New Guinea', cur: 'PGK', dial: '+675' },
];

export const OPERATORS: Record<string, Operator[]> = {
    NG: [
        {
            id: 'mtn-ng',
            name: 'MTN Nigeria',
            color: '#ffcb05',
            txt: '#000',
            min: 100,
            max: 50000,
            type: 'range',
        },
        {
            id: 'airtel-ng',
            name: 'Airtel Nigeria',
            color: '#ed1c24',
            txt: '#fff',
            min: 100,
            max: 50000,
            type: 'range',
        },
        {
            id: 'glo-ng',
            name: 'Glo Nigeria',
            color: '#00a651',
            txt: '#fff',
            min: 100,
            max: 50000,
            type: 'range',
        },
        {
            id: '9mobile-ng',
            name: '9mobile',
            color: '#006a4d',
            txt: '#fff',
            min: 100,
            max: 50000,
            type: 'range',
        },
    ],
    IN: [
        {
            id: 'jio-in',
            name: 'Reliance Jio',
            color: '#0a2885',
            txt: '#fff',
            type: 'fixed',
            amounts: [149, 199, 239, 299, 479, 666],
        },
        {
            id: 'airtel-in',
            name: 'Airtel India',
            color: '#ed1c24',
            txt: '#fff',
            type: 'fixed',
            amounts: [155, 209, 265, 359, 549, 719],
        },
        {
            id: 'vi-in',
            name: 'Vi (Vodafone Idea)',
            color: '#ed1c24',
            txt: '#fff',
            type: 'fixed',
            amounts: [179, 219, 269, 359, 475, 666],
        },
    ],
    KE: [
        {
            id: 'safaricom-ke',
            name: 'Safaricom',
            color: '#43a047',
            txt: '#fff',
            min: 5,
            max: 10000,
            type: 'range',
        },
        {
            id: 'airtel-ke',
            name: 'Airtel Kenya',
            color: '#ed1c24',
            txt: '#fff',
            min: 5,
            max: 10000,
            type: 'range',
        },
    ],
    PH: [
        {
            id: 'globe-ph',
            name: 'Globe Telecom',
            color: '#0c3da5',
            txt: '#fff',
            type: 'fixed',
            amounts: [50, 100, 200, 300, 500, 1000],
        },
        {
            id: 'smart-ph',
            name: 'Smart Communications',
            color: '#00873e',
            txt: '#fff',
            type: 'fixed',
            amounts: [50, 100, 200, 300, 500, 1000],
        },
    ],
    US: [
        {
            id: 'tmobile-us',
            name: 'T-Mobile US',
            color: '#e20074',
            txt: '#fff',
            type: 'fixed',
            amounts: [10, 20, 30, 40, 50, 100],
        },
    ],
    GB: [
        {
            id: 'vodafone-gb',
            name: 'Vodafone UK',
            color: '#e60000',
            txt: '#fff',
            type: 'fixed',
            amounts: [5, 10, 15, 20, 30, 50],
        },
    ],
    GH: [
        {
            id: 'mtn-gh',
            name: 'MTN Ghana',
            color: '#ffcb05',
            txt: '#000',
            min: 1,
            max: 1000,
            type: 'range',
        },
    ],
    ZA: [
        {
            id: 'vodacom-za',
            name: 'Vodacom',
            color: '#e60000',
            txt: '#fff',
            min: 5,
            max: 5000,
            type: 'range',
        },
    ],
    BD: [
        {
            id: 'gp-bd',
            name: 'Grameenphone',
            color: '#00a651',
            txt: '#fff',
            min: 10,
            max: 1000,
            type: 'range',
        },
        {
            id: 'robi-bd',
            name: 'Robi',
            color: '#e2231a',
            txt: '#fff',
            min: 10,
            max: 1000,
            type: 'range',
        },
        {
            id: 'banglalink-bd',
            name: 'Banglalink',
            color: '#f57f20',
            txt: '#fff',
            min: 10,
            max: 1000,
            type: 'range',
        },
        {
            id: 'airtel-bd',
            name: 'Airtel Bangladesh',
            color: '#ed1c24',
            txt: '#fff',
            min: 10,
            max: 1000,
            type: 'range',
        },
    ],
};

export interface GiftCard {
    id: string;
    brand: string;
    cat: string;
    color: string;
    countries: string[];
    denoms: number[];
    cur: string;
}

export const GIFTCARDS: GiftCard[] = [
    {
        id: 'amazon',
        brand: 'Amazon',
        cat: 'Shopping',
        color: '#ff9900',
        countries: ['US', 'GB', 'IN'],
        denoms: [10, 25, 50, 100],
        cur: 'YER',
    },
    {
        id: 'appstore',
        brand: 'App Store & iTunes',
        cat: 'Entertainment',
        color: '#0a84ff',
        countries: ['US', 'GB', 'NG'],
        denoms: [15, 25, 50, 100],
        cur: 'YER',
    },
    {
        id: 'googleplay',
        brand: 'Google Play',
        cat: 'Gaming',
        color: '#01875f',
        countries: ['US', 'IN', 'NG'],
        denoms: [10, 25, 50],
        cur: 'YER',
    },
    {
        id: 'netflix',
        brand: 'Netflix',
        cat: 'Streaming',
        color: '#e50914',
        countries: ['US', 'GB', 'PH'],
        denoms: [25, 50, 100],
        cur: 'YER',
    },
    {
        id: 'spotify',
        brand: 'Spotify',
        cat: 'Streaming',
        color: '#1db954',
        countries: ['US', 'GB'],
        denoms: [10, 30, 60],
        cur: 'YER',
    },
    {
        id: 'steam',
        brand: 'Steam',
        cat: 'Gaming',
        color: '#1b2838',
        countries: ['US', 'GB', 'IN'],
        denoms: [20, 50, 100],
        cur: 'YER',
    },
    {
        id: 'xbox',
        brand: 'Xbox',
        cat: 'Gaming',
        color: '#107c10',
        countries: ['US', 'GB'],
        denoms: [15, 25, 50],
        cur: 'YER',
    },
    {
        id: 'playstation',
        brand: 'PlayStation',
        cat: 'Gaming',
        color: '#003791',
        countries: ['US', 'GB', 'PH'],
        denoms: [10, 25, 50, 100],
        cur: 'YER',
    },
    {
        id: 'uber',
        brand: 'Uber',
        cat: 'Lifestyle',
        color: '#000000',
        countries: ['US', 'GB'],
        denoms: [15, 25, 50],
        cur: 'YER',
    },
    {
        id: 'visa',
        brand: 'Visa Prepaid',
        cat: 'Prepaid',
        color: '#1a1f71',
        countries: ['US'],
        denoms: [25, 50, 100, 200],
        cur: 'YER',
    },
    {
        id: 'razergold',
        brand: 'Razer Gold',
        cat: 'Gaming',
        color: '#44d62c',
        countries: ['US', 'PH', 'IN'],
        denoms: [10, 20, 50],
        cur: 'YER',
    },
    {
        id: 'nike',
        brand: 'Nike',
        cat: 'Shopping',
        color: '#111111',
        countries: ['US', 'GB'],
        denoms: [25, 50, 100],
        cur: 'YER',
    },
];

export const PRODUCTS: {
    id: string;
    label: string;
    icon: IconName;
    desc: string;
    route: string;
}[] = [
    {
        id: 'airtime',
        label: 'Airtime',
        icon: 'phone',
        desc: 'Mobile top-up to 800+ operators',
        route: '/topup',
    },
    {
        id: 'data',
        label: 'Data Bundles',
        icon: 'signal',
        desc: 'Internet packages worldwide',
        route: '/topup',
    },
    {
        id: 'giftcards',
        label: 'Gift Cards',
        icon: 'gift',
        desc: '4,000+ brands, instant delivery',
        route: '/giftcards',
    },
    {
        id: 'bulk',
        label: 'Bulk Payouts',
        icon: 'layers',
        desc: 'CSV uploads, mass distribution',
        route: '/bulk',
    },
];

export interface Txn {
    id: string;
    ref: string;
    name: string;
    recipient: string;
    type: string;
    icon: IconName;
    cat: string;
    country: string;
    cur: string;
    amountUSD: number;
    localAmount: number;
    fee: number;
    margin: number;
    status: string;
    date: Date;
    operator: string;
}

const NAMES = [
    'Adaeze Okafor',
    'Rahul Sharma',
    'Brian Otieno',
    'Maria Santos',
    'James Wilson',
    'Fatima Bello',
    'Priya Nair',
    'Grace Wanjiru',
    'John Reyes',
    'Emeka Nwosu',
    'Aisha Mohammed',
    'David Kim',
    'Joy Mensah',
    'Thabo Dlamini',
    'Lily Chen',
];
const TXN_TYPES: { t: string; icon: IconName; cat: string }[] = [
    { t: 'Airtime', icon: 'phone', cat: 'airtime' },
    { t: 'Data Bundle', icon: 'signal', cat: 'data' },
    { t: 'Gift Card', icon: 'gift', cat: 'giftcard' },
];

/**
 * Deterministic PRNG + fixed clock so the demo data is identical on the server
 * and the client (avoids Inertia SSR hydration mismatches) and stable across
 * reloads.
 */
function mulberry32(seed: number): () => number {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const BASE_TIME = Date.UTC(2026, 5, 5, 20, 0, 0);

export function genTxns(n: number, seed = 1337): Txn[] {
    const rng = mulberry32(seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
    const out: Txn[] = [];
    const statuses = [
        'success',
        'success',
        'success',
        'success',
        'pending',
        'failed',
        'refunded',
        'review',
    ];

    for (let i = 0; i < n; i++) {
        const c = pick(COUNTRIES);
        const ty = pick(TXN_TYPES);
        const st = pick(statuses);
        const usd = +(rng() * 95 + 5).toFixed(2);
        const d = new Date(BASE_TIME - i * 3.7e6 - rng() * 5e6);
        out.push({
            id:
                'TXN-' +
                d.toISOString().slice(0, 10).replace(/-/g, '') +
                '-' +
                (4821 - i).toString().padStart(4, '0'),
            ref: 'rly_' + (rng() + 1).toString(36).slice(2, 12),
            name: pick(NAMES),
            recipient: c.dial + ' ' + Math.floor(rng() * 9e8 + 1e8),
            type: ty.t,
            icon: ty.icon,
            cat: ty.cat,
            country: c.iso,
            cur: c.cur,
            amountUSD: usd,
            localAmount: +(usd * (c.fx ?? 1)).toFixed(2),
            fee: +(usd * 0.029 + 0.3).toFixed(2),
            margin: +(usd * 0.045).toFixed(2),
            status: st,
            date: d,
            operator: OPERATORS[c.iso]?.[0]?.name ?? 'Operator',
        });
    }

    return out;
}

export const TXNS = genTxns(48);

export interface LedgerEntry {
    id: string;
    k: string;
    label: string;
    icon: IconName;
    amount: number;
    balance: number;
    date: Date;
    ref: string;
}

function genLedger(n: number): LedgerEntry[] {
    const rng = mulberry32(4242);
    const out: LedgerEntry[] = [];
    let bal = 24850.0;
    const kinds: { k: string; label: string; icon: IconName }[] = [
        { k: 'debit', label: 'Airtime top-up', icon: 'phone' },
        { k: 'debit', label: 'Gift card purchase', icon: 'gift' },
        { k: 'credit', label: 'Wallet funding', icon: 'plus' },
        { k: 'refund', label: 'Auto-refund (failed txn)', icon: 'refresh' },
        { k: 'hold', label: 'Reserved (pending batch)', icon: 'lock' },
    ];

    for (let i = 0; i < n; i++) {
        const kk = kinds[Math.floor(rng() * kinds.length)];
        const amt = +(rng() * 600 + 20).toFixed(2);
        const signed = kk.k === 'credit' || kk.k === 'refund' ? amt : -amt;
        const d = new Date(BASE_TIME - i * 7.4e6);
        out.push({
            id: 'LMT-' + (9921 - i),
            ...kk,
            amount: signed,
            balance: bal,
            date: d,
            ref: TXNS[i % TXNS.length].id,
        });
        bal -= signed;
    }

    return out;
}

export const LEDGER = genLedger(20);

export const API_KEYS = [
    {
        id: 'k1',
        name: 'Production server',
        prefix: 'tpy_live_',
        secret: 'tpy_live_8f2a9c4e1b7d6035a8f1',
        mode: 'live',
        created: '2026-01-14',
        lastUsed: '3 min ago',
        calls: 184203,
    },
    {
        id: 'k2',
        name: 'Sandbox testing',
        prefix: 'tpy_test_',
        secret: 'tpy_test_a1b2c3d4e5f6g7h8i9j0',
        mode: 'test',
        created: '2026-02-02',
        lastUsed: '1 hour ago',
        calls: 9821,
    },
    {
        id: 'k3',
        name: 'Mobile app backend',
        prefix: 'tpy_live_',
        secret: 'tpy_live_z9y8x7w6v5u4t3s2r1q0',
        mode: 'live',
        created: '2026-03-21',
        lastUsed: '12 hours ago',
        calls: 42117,
    },
];

export const WEBHOOK_EVENTS = [
    {
        id: 'evt_1a2b3c',
        type: 'transaction.success',
        status: 'delivered',
        code: 200,
        time: '12:04:33',
        attempts: 1,
    },
    {
        id: 'evt_4d5e6f',
        type: 'transaction.failed',
        status: 'delivered',
        code: 200,
        time: '11:58:10',
        attempts: 1,
    },
    {
        id: 'evt_7g8h9i',
        type: 'transaction.pending',
        status: 'delivered',
        code: 200,
        time: '11:52:47',
        attempts: 2,
    },
    {
        id: 'evt_0j1k2l',
        type: 'wallet.low_balance',
        status: 'failed',
        code: 503,
        time: '11:40:02',
        attempts: 4,
    },
    {
        id: 'evt_3m4n5o',
        type: 'transaction.refunded',
        status: 'delivered',
        code: 200,
        time: '11:31:19',
        attempts: 1,
    },
    {
        id: 'evt_6p7q8r',
        type: 'giftcard.delivered',
        status: 'delivered',
        code: 200,
        time: '11:20:55',
        attempts: 1,
    },
];

export const KYC_QUEUE = [
    {
        id: 'kyc_1',
        biz: 'Naija Recharge Ltd',
        country: 'NG',
        type: 'Business',
        submitted: '2h ago',
        status: 'pending',
        docs: 3,
        contact: 'Emeka Nwosu',
    },
    {
        id: 'kyc_2',
        biz: 'Nairobi Digital Agents',
        country: 'KE',
        type: 'Reseller',
        submitted: '5h ago',
        status: 'pending',
        docs: 2,
        contact: 'Grace Wanjiru',
    },
    {
        id: 'kyc_3',
        biz: 'Manila TopUp Hub',
        country: 'PH',
        type: 'Business',
        submitted: '1d ago',
        status: 'review',
        docs: 4,
        contact: 'John Reyes',
    },
    {
        id: 'kyc_4',
        biz: 'Lagos Bills Co',
        country: 'NG',
        type: 'Business',
        submitted: '2d ago',
        status: 'approved',
        docs: 3,
        contact: 'Fatima Bello',
    },
];

export const BULK_JOBS = [
    {
        id: 'BATCH-2041',
        name: 'march_payroll_topup.csv',
        rows: 1240,
        valid: 1228,
        errors: 12,
        status: 'processing',
        progress: 64,
        cost: 6420.5,
        created: '8 min ago',
    },
    {
        id: 'BATCH-2038',
        name: 'agent_commissions.csv',
        rows: 320,
        valid: 320,
        errors: 0,
        status: 'success',
        progress: 100,
        cost: 1880.0,
        created: '2 hours ago',
    },
    {
        id: 'BATCH-2035',
        name: 'reseller_giftcards.csv',
        rows: 85,
        valid: 80,
        errors: 5,
        status: 'failed',
        progress: 100,
        cost: 4250.0,
        created: 'Yesterday',
    },
];

export interface Beneficiary {
    id: string;
    name: string;
    recipient: string;
    country: string;
    operator: string;
    last: string;
    fav: boolean;
    rel: string[];
}

export const BENEFICIARIES: Beneficiary[] = [
    {
        id: 'b5',
        name: 'Mother',
        recipient: '+880 1712 345678',
        country: 'BD',
        operator: 'Grameenphone',
        last: '5 days ago',
        fav: true,
        rel: ['mother', 'mom', 'mum', 'amma', 'maa'],
    },
    {
        id: 'b1',
        name: 'Mum',
        recipient: '+234 803 555 0142',
        country: 'NG',
        operator: 'MTN Nigeria',
        last: '2 days ago',
        fav: true,
        rel: ['mum', 'mom', 'mother'],
    },
    {
        id: 'b2',
        name: 'Rahul (brother)',
        recipient: '+91 98200 41122',
        country: 'IN',
        operator: 'Reliance Jio',
        last: '1 week ago',
        fav: true,
        rel: ['brother', 'rahul', 'bro'],
    },
    {
        id: 'b3',
        name: 'Brian — Nairobi',
        recipient: '+254 712 998 221',
        country: 'KE',
        operator: 'Safaricom',
        last: '3 weeks ago',
        fav: false,
        rel: ['brian'],
    },
    {
        id: 'b6',
        name: 'Driver',
        recipient: '+880 1819 553120',
        country: 'BD',
        operator: 'Banglalink',
        last: '2 weeks ago',
        fav: false,
        rel: ['driver'],
    },
    {
        id: 'b4',
        name: 'Maria PH',
        recipient: '+63 917 882 4410',
        country: 'PH',
        operator: 'Globe Telecom',
        last: '1 month ago',
        fav: false,
        rel: ['maria'],
    },
];

export interface DataPack {
    name: string;
    price: number;
    cur: string;
    best?: boolean;
    note?: string;
}

export const DATA_PACKS: Record<string, DataPack[]> = {
    BD: [
        { name: '1.5 GB · 7 days', price: 148, cur: 'BDT' },
        { name: '3 GB · 30 days', price: 297, cur: 'BDT' },
        { name: '5 GB · 30 days', price: 448, cur: 'BDT' },
        {
            name: '25 GB · 30 days',
            price: 498,
            cur: 'BDT',
            best: true,
            note: 'Best value under ৳500',
        },
    ],
    NG: [
        { name: '1.5 GB · 30 days', price: 1200, cur: 'NGN' },
        { name: '6 GB · 30 days', price: 2500, cur: 'NGN' },
        {
            name: '11 GB · 30 days',
            price: 4000,
            cur: 'NGN',
            best: true,
            note: 'Most popular',
        },
    ],
    IN: [
        { name: '1.5 GB/day · 28 days', price: 299, cur: 'INR' },
        {
            name: '2 GB/day · 28 days',
            price: 359,
            cur: 'INR',
            best: true,
            note: 'Best value',
        },
        { name: '2.5 GB/day · 56 days', price: 666, cur: 'INR' },
    ],
};

export const SCHEDULES = [
    {
        id: 'sch1',
        name: 'Mother',
        recipient: '+880 1712 •••678',
        country: 'BD',
        operator: 'Grameenphone',
        amount: 300,
        cur: 'BDT',
        freq: 'Monthly',
        next: 'Jul 1, 2026',
        status: 'active',
        reminder: '1 day before',
    },
    {
        id: 'sch2',
        name: 'Office line',
        recipient: '+234 803 •••142',
        country: 'NG',
        operator: 'MTN Nigeria',
        amount: 1000,
        cur: 'NGN',
        freq: 'Weekly',
        next: 'Jun 9, 2026',
        status: 'active',
        reminder: '2 hours before',
    },
    {
        id: 'sch4',
        name: 'Driver',
        recipient: '+880 1819 •••120',
        country: 'BD',
        operator: 'Banglalink',
        amount: 200,
        cur: 'BDT',
        freq: 'Monthly',
        next: 'Jun 6, 2026',
        status: 'failed',
        reminder: '1 day before',
        failReason: 'Low wallet balance',
    },
    {
        id: 'sch3',
        name: 'Brother',
        recipient: '+91 98200 •••22',
        country: 'IN',
        operator: 'Reliance Jio',
        amount: 299,
        cur: 'INR',
        freq: 'Monthly',
        next: '—',
        status: 'paused',
        reminder: '1 day before',
    },
];

const AI_TIMES = [
    '2 min ago',
    '38 min ago',
    '1 hour ago',
    '3 hours ago',
    'Yesterday 18:40',
    'Yesterday 09:12',
    'Jun 3, 14:05',
    'Jun 2, 20:31',
];

export interface AiActivity {
    id: string;
    command: string;
    action: string;
    icon: IconName;
    recipient: string;
    amount: number | null;
    status: string;
    confidence: string;
    voice: boolean;
    time: string;
}

export const AI_ACTIVITY: AiActivity[] = [
    {
        id: 'ai1',
        command: 'Recharge Mother with ৳300',
        action: 'Airtime',
        icon: 'phone',
        recipient: 'Mother · +880 1712 •••678',
        amount: 2.74,
        status: 'success',
        confidence: 'High',
        voice: false,
    },
    {
        id: 'ai2',
        command: 'Buy a $25 Amazon gift card',
        action: 'Gift Card',
        icon: 'gift',
        recipient: 'recipient@email.com',
        amount: 26.0,
        status: 'pending',
        confidence: 'High',
        voice: false,
    },
    {
        id: 'ai3',
        command: 'Best data pack under ৳500',
        action: 'Data Bundle',
        icon: 'signal',
        recipient: '+880 1712 •••678',
        amount: 4.26,
        status: 'success',
        confidence: 'High',
        voice: true,
    },
    {
        id: 'ai5',
        command: 'Send 10 dollars airtime to my brother',
        action: 'Airtime',
        icon: 'phone',
        recipient: 'Brother · +91 98200 •••22',
        amount: 10.51,
        status: 'failed',
        confidence: 'High',
        voice: true,
    },
    {
        id: 'ai6',
        command: 'Recharge my mother every month with ৳300',
        action: 'Schedule',
        icon: 'refresh',
        recipient: 'Mother · Monthly',
        amount: null,
        status: 'active',
        confidence: 'High',
        voice: false,
    },
    {
        id: 'ai7',
        command: 'Check my last failed transaction',
        action: 'Status check',
        icon: 'history',
        recipient: 'TXN-20260604-4788',
        amount: null,
        status: 'info',
        confidence: 'High',
        voice: false,
    },
    {
        id: 'ai8',
        command: 'Bulk top-up 1,240 numbers from CSV',
        action: 'Bulk',
        icon: 'layers',
        recipient: '1,228 valid rows',
        amount: 6420.5,
        status: 'success',
        confidence: 'High',
        voice: false,
    },
].map((a, i) => ({ ...a, time: AI_TIMES[i] }) as AiActivity);

export const AI_SUGGESTIONS: Record<string, string[]> = {
    customer: [
        'Recharge Mother with ৳300',
        'Buy a $25 Amazon gift card',
        'Best data pack under ৳500',
        'Check my last transaction',
    ],
    business: [
        'Recharge 01712345678 with ৳500',
        'Bulk top-up 200 numbers from CSV',
        'Buy 10 × $25 Amazon gift cards',
        'Why did 3 top-ups fail today?',
        'Set up weekly recharge for office line',
    ],
    reseller: [
        'Top up customer +880 1712 345678 ৳500',
        'Show my commission this month',
        'Bulk top-up my agents from CSV',
        'Which customer spent the most?',
        'Recharge Mother with ৳300',
    ],
    admin: [
        'Why did transactions fail today?',
        'Show high-risk users',
        'Summarize pending refunds',
        'Find repeated failed top-ups from same IP',
    ],
};

export const RESELLER_CUSTOMERS = [
    {
        id: 'rc1',
        name: 'Karim Store',
        contact: '+880 1712 998120',
        country: 'BD',
        tier: 'Agent',
        orders: 184,
        volume: 4820.5,
        commission: 241.02,
        status: 'active',
        last: '12 min ago',
    },
    {
        id: 'rc2',
        name: 'Lagos Mini Mart',
        contact: '+234 803 551207',
        country: 'NG',
        tier: 'Customer',
        orders: 92,
        volume: 2310.0,
        commission: 103.95,
        status: 'active',
        last: '1 hour ago',
    },
    {
        id: 'rc3',
        name: 'Nairobi Kiosk',
        contact: '+254 712 884550',
        country: 'KE',
        tier: 'Agent',
        orders: 311,
        volume: 8140.75,
        commission: 366.33,
        status: 'active',
        last: '3 hours ago',
    },
    {
        id: 'rc4',
        name: 'Dhaka Telecom Point',
        contact: '+880 1819 220114',
        country: 'BD',
        tier: 'Agent',
        orders: 56,
        volume: 1280.4,
        commission: 57.62,
        status: 'pending',
        last: 'Yesterday',
    },
    {
        id: 'rc5',
        name: 'Priya Nair',
        contact: '+91 98200 41122',
        country: 'IN',
        tier: 'Customer',
        orders: 23,
        volume: 540.1,
        commission: 18.9,
        status: 'active',
        last: '2 days ago',
    },
    {
        id: 'rc6',
        name: 'Manila Load Hub',
        contact: '+63 917 882 4410',
        country: 'PH',
        tier: 'Agent',
        orders: 140,
        volume: 3960.25,
        commission: 178.21,
        status: 'suspended',
        last: '1 week ago',
    },
];

export const RESELLER_EARNINGS = [
    { month: 'Jan', amount: 612 },
    { month: 'Feb', amount: 740 },
    { month: 'Mar', amount: 690 },
    { month: 'Apr', amount: 880 },
    { month: 'May', amount: 1024 },
    { month: 'Jun', amount: 966, dim: true },
];

export const RESELLER_PAYOUTS = [
    {
        id: 'PO-3021',
        period: 'May 2026',
        amount: 1024.4,
        method: 'Wallet credit',
        status: 'success',
        date: 'Jun 1, 2026',
    },
    {
        id: 'PO-3009',
        period: 'Apr 2026',
        amount: 880.1,
        method: 'Bank transfer',
        status: 'success',
        date: 'May 1, 2026',
    },
    {
        id: 'PO-2994',
        period: 'Mar 2026',
        amount: 690.55,
        method: 'Bank transfer',
        status: 'success',
        date: 'Apr 1, 2026',
    },
    {
        id: 'PO-3030',
        period: 'Jun 2026 (current)',
        amount: 966.2,
        method: 'Pending close',
        status: 'pending',
        date: '—',
    },
];

export const COUNTRY_PERF = [
    {
        iso: 'NG',
        name: 'Nigeria',
        volume: 184200,
        txns: 8421,
        share: 38,
        fx: 1580,
    },
    {
        iso: 'IN',
        name: 'India',
        volume: 122800,
        txns: 6210,
        share: 25,
        fx: 83.4,
    },
    { iso: 'KE', name: 'Kenya', volume: 78400, txns: 3980, share: 16, fx: 129 },
    {
        iso: 'PH',
        name: 'Philippines',
        volume: 54100,
        txns: 2740,
        share: 11,
        fx: 57.2,
    },
    {
        iso: 'US',
        name: 'United States',
        volume: 48900,
        txns: 1120,
        share: 10,
        fx: 1,
    },
];

export const REVENUE_30D = [
    42, 48, 45, 52, 61, 58, 64, 70, 66, 74, 80, 77, 85, 82, 90, 88, 95, 92, 101,
    98, 110, 105, 118, 122, 115, 128, 134, 130, 142, 151,
];

export const WEEK_SALES = [
    { label: 'Mon', value: 4200 },
    { label: 'Tue', value: 5100 },
    { label: 'Wed', value: 4800 },
    { label: 'Thu', value: 6200 },
    { label: 'Fri', value: 7400 },
    { label: 'Sat', value: 5900 },
    { label: 'Sun', value: 4100, dim: true },
];

export const TICKETS = [
    {
        id: 'TKT-1042',
        subject: 'Top-up delivered but customer says not received',
        status: 'pending',
        priority: 'high',
        txn: 'TXN-20260605-4810',
        updated: '20 min ago',
        from: 'Adaeze Okafor',
    },
    {
        id: 'TKT-1039',
        subject: 'Refund not reflected in wallet',
        status: 'review',
        priority: 'medium',
        txn: 'TXN-20260604-4788',
        updated: '2 hours ago',
        from: 'Rahul Sharma',
    },
    {
        id: 'TKT-1036',
        subject: 'Gift card code invalid',
        status: 'success',
        priority: 'low',
        txn: 'TXN-20260603-4771',
        updated: 'Yesterday',
        from: 'Maria Santos',
    },
];
