<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

/**
 * Canonical content store for the public marketing homepage (the CMS).
 *
 * The shipped copy lives in {@see self::defaults()} and is the single source of
 * truth; an admin's edits are persisted under the {@see self::KEY} setting and
 * deep-merged over the defaults at read time. Because every field falls back to
 * its default, an untouched install renders exactly what shipped, and new fields
 * added in a future release appear automatically without a migration.
 */
final class LandingContent
{
    /** Settings key holding the landing-page content overrides. */
    public const KEY = 'landing';

    /** Disk folder for uploaded social-share images. */
    private const ASSET_DIR = 'landing';

    /**
     * Sections an admin may edit / reset individually. Order is display order.
     *
     * @var list<string>
     */
    public const SECTIONS = [
        'seo', 'nav', 'hero', 'copilot', 'products',
        'coverage', 'developers', 'pricing', 'security', 'faq', 'cta', 'footer',
    ];

    /**
     * The full merged content (defaults overlaid with stored admin edits), with
     * the social-share image resolved to a public URL for convenience.
     *
     * @return array<string, mixed>
     */
    public static function content(): array
    {
        $merged = self::merge(self::defaults(), self::stored());
        $merged['seo']['image'] = self::assetUrl($merged['seo']['image_path'] ?? null);

        return $merged;
    }

    /**
     * SEO / social-share metadata for the document head (server-rendered so
     * crawlers and social scrapers see it without executing JavaScript).
     *
     * @return array{title: string, description: string, image: ?string}
     */
    public static function seo(): array
    {
        $seo = self::content()['seo'];

        return [
            'title' => (string) $seo['title'],
            'description' => (string) $seo['description'],
            'image' => $seo['image'] ?? null,
        ];
    }

    /**
     * Persist edited content (the whole structure). The social-share image path
     * is managed separately by the controller and preserved here.
     *
     * @param  array<string, mixed>  $content
     */
    public static function save(array $content): void
    {
        Setting::put(self::KEY, $content);
    }

    /**
     * Reset one section back to its shipped defaults by dropping its override.
     * Resetting SEO also discards any uploaded social-share image.
     */
    public static function resetSection(string $section): void
    {
        $stored = self::stored();

        if ($section === 'seo') {
            self::deleteAsset($stored['seo']['image_path'] ?? null);
        }

        unset($stored[$section]);

        Setting::put(self::KEY, $stored);
    }

    /** The raw stored overrides (empty array when never edited). */
    public static function stored(): array
    {
        $stored = Setting::get(self::KEY, []);

        return is_array($stored) ? $stored : [];
    }

    /** The stored social-share image path, or null. */
    public static function imagePath(): ?string
    {
        $path = self::stored()['seo']['image_path'] ?? null;

        return is_string($path) ? $path : null;
    }

    /** Resolve a stored public-disk path to a URL. */
    public static function assetUrl(?string $path): ?string
    {
        return blank($path) ? null : Storage::disk('public')->url($path);
    }

    /** Delete a stored public-disk asset if present. */
    public static function deleteAsset(?string $path): void
    {
        if (filled($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public static function assetDir(): string
    {
        return self::ASSET_DIR;
    }

    /**
     * Deep-merge stored edits over defaults. Associative nodes merge key-by-key;
     * list nodes (e.g. FAQ items, pricing plans) are replaced wholesale so that
     * removing an item doesn't resurrect a default at the same index.
     */
    private static function merge(mixed $default, mixed $stored): mixed
    {
        if (is_array($default) && is_array($stored)) {
            if (array_is_list($default)) {
                return $stored;
            }

            $out = $default;
            foreach ($stored as $key => $value) {
                $out[$key] = array_key_exists($key, $default)
                    ? self::merge($default[$key], $value)
                    : $value;
            }

            return $out;
        }

        return $stored;
    }

    /**
     * The shipped marketing copy — mirrors the original hardcoded welcome page
     * exactly, so a fresh install is visually identical until an admin edits.
     *
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        $appName = SystemSettings::appName();

        return [
            'seo' => [
                'title' => $appName.' — Global Top-ups & Gift Cards',
                'description' => 'Launch your own digital recharge and rewards business — with wallet, reseller tools, bulk orders, API access and real-time transaction tracking.',
                'image_path' => null,
            ],
            'nav' => [
                'links' => [
                    ['label' => 'Copilot', 'anchor' => 'copilot'],
                    ['label' => 'Products', 'anchor' => 'products'],
                    ['label' => 'Developers', 'anchor' => 'developers'],
                    ['label' => 'Pricing', 'anchor' => 'pricing'],
                    ['label' => 'Security', 'anchor' => 'security'],
                    ['label' => 'FAQ', 'anchor' => 'faq'],
                ],
                'docs_label' => 'Docs',
                'sign_in_label' => 'Sign in',
                'start_label' => 'Start free',
                'dashboard_label' => 'Go to dashboard',
            ],
            'hero' => [
                'badge' => '800+ operators · 150+ countries',
                'title' => 'Global top-ups & gift cards from',
                'title_highlight' => 'one dashboard',
                'subheading' => 'Launch your own digital recharge and rewards business — with wallet, reseller tools, bulk orders, API access and real-time transaction tracking.',
                'primary_cta' => 'Start free',
                'secondary_cta' => 'View API docs',
                'badges' => ['No setup fees', 'Sandbox included', 'Settle in 150+ countries'],
                'preview' => [
                    'enabled' => true,
                    'label' => 'Preview · sample data',
                    'metrics' => [
                        ['label' => 'Wallet', 'value' => '$24,850', 'icon' => 'wallet', 'tone' => 'primary'],
                        ['label' => 'Sales today', 'value' => '$7,420', 'icon' => 'trendup', 'tone' => 'info'],
                        ['label' => 'Success', 'value' => '98.6%', 'icon' => 'checkcircle', 'tone' => 'success'],
                        ['label' => 'Margin', 'value' => '$1,128', 'icon' => 'percent', 'tone' => 'violet'],
                    ],
                ],
            ],
            'copilot' => [
                'enabled' => true,
                'badge' => 'New · TopUp Copilot',
                'title' => 'Recharge and buy gift cards by simply asking AI',
                'description' => 'Skip the forms. Type or speak in plain language — Copilot detects the operator, finds the best package, and prepares the transaction.',
                'description_strong' => 'You always confirm before any payment.',
                'tags' => ['Airtime', 'Data bundles', 'Gift cards', 'Transaction check', 'Recurring recharge'],
                'reassurance' => 'AI prepares the transaction — you always confirm before payment.',
                'primary_cta' => 'Try TopUp Copilot',
                'secondary_cta' => 'See AI demo',
                'steps' => [
                    ['title' => 'Ask naturally', 'desc' => 'Type or speak: "Send $10 airtime to my brother" or "Buy a $25 Amazon gift card".', 'icon' => 'send'],
                    ['title' => 'AI prepares it', 'desc' => 'Copilot detects the operator, finds the best package, and builds a clear confirmation card.', 'icon' => 'sparkles'],
                    ['title' => 'You confirm & pay', 'desc' => 'Review recipient, amount and fees, then confirm. Nothing is charged until you say so.', 'icon' => 'shieldcheck'],
                ],
            ],
            'products' => [
                'enabled' => true,
                'eyebrow' => 'Products',
                'title' => 'Everything your digital business needs',
                'desc' => 'Five revenue streams, one wallet, one API.',
                'items' => [
                    ['icon' => 'phone', 'label' => 'Airtime', 'desc' => 'Mobile top-up to 800+ operators'],
                    ['icon' => 'signal', 'label' => 'Data Bundles', 'desc' => 'Internet packages worldwide'],
                    ['icon' => 'gift', 'label' => 'Gift Cards', 'desc' => '4,000+ brands, instant delivery'],
                    ['icon' => 'layers', 'label' => 'Bulk Payouts', 'desc' => 'CSV uploads, mass distribution'],
                ],
            ],
            'coverage' => [
                'enabled' => true,
                'eyebrow' => 'Coverage',
                'title' => 'Reach customers in 150+ countries',
                'desc' => 'Auto-detect operators by phone number, display local currency and FX, and deliver in seconds.',
                'stats' => [
                    ['value' => '150+', 'label' => 'Countries'],
                    ['value' => '800+', 'label' => 'Operators'],
                    ['value' => '4,000+', 'label' => 'Gift card brands'],
                    ['value' => '190+', 'label' => 'Countries'],
                ],
                'more_label' => '+ 140 more countries',
            ],
            'developers' => [
                'enabled' => true,
                'eyebrow' => 'Developers',
                'title' => 'A clean API built for scale',
                'desc' => 'REST endpoints, idempotency keys, signed webhooks and a full sandbox. Ship in an afternoon.',
                'features' => [
                    ['icon' => 'fingerprint', 'label' => 'Idempotent by design — never double-charge'],
                    ['icon' => 'webhook', 'label' => 'Signed webhooks for async status updates'],
                    ['icon' => 'cpu', 'label' => 'Sandbox + production keys, instant switch'],
                ],
                'code' => [
                    'endpoint' => 'POST /v1/topups',
                    'request' => "curl https://api.tappy.io/v1/topups \\\n  -H \"Authorization: Bearer tpy_live_…\" \\\n  -H \"Idempotency-Key: TXN-20260605-4821\" \\\n  -d operator_id=341 \\\n  -d amount=10.00 \\\n  -d recipient=\"+2348035550142\"",
                    'response' => "{\n  \"id\": \"rly_8f2a9c4e1b\",\n  \"status\": \"SUCCESSFUL\",\n  \"delivered_amount\": \"15,800 NGN\"\n}",
                ],
            ],
            'pricing' => [
                'enabled' => true,
                'eyebrow' => 'Pricing',
                'title' => 'Simple, transparent commission',
                'desc' => 'You set the markup. We charge a flat platform fee — no monthly minimums.',
                'plans' => [
                    [
                        'name' => 'Starter',
                        'price' => '0%',
                        'unit' => 'platform fee',
                        'popular' => false,
                        'cta' => 'Start free',
                        'features' => ['Pay-as-you-go', '1% per transaction', 'Sandbox + 1 API key', 'Email support'],
                    ],
                    [
                        'name' => 'Business',
                        'price' => '0.8%',
                        'unit' => 'per transaction',
                        'popular' => true,
                        'cta' => 'Start 14-day trial',
                        'features' => ['Everything in Starter', 'Bulk CSV payouts', 'Unlimited API keys', 'Webhooks & reports', 'Priority support'],
                    ],
                    [
                        'name' => 'Enterprise',
                        'price' => 'Custom',
                        'unit' => 'volume pricing',
                        'popular' => false,
                        'cta' => 'Contact sales',
                        'features' => ['Custom commission', 'Dedicated FX rates', 'SLA & onboarding', 'IP allowlist & SSO'],
                    ],
                ],
            ],
            'security' => [
                'enabled' => true,
                'eyebrow' => 'Security & compliance',
                'title' => 'Built to be trusted with money',
                'desc' => 'Bank-grade controls protect every transaction and every wallet.',
                'features' => [
                    ['icon' => 'shield', 'title' => 'PCI-DSS aligned', 'desc' => 'Card data tokenized; we never store raw PANs.'],
                    ['icon' => 'lock', 'title' => '2FA & IP allowlists', 'desc' => 'Protect logins and API access by default.'],
                    ['icon' => 'fingerprint', 'title' => 'Idempotent payments', 'desc' => 'Double-clicks and retries never double-charge.'],
                    ['icon' => 'audit', 'title' => 'Full audit trail', 'desc' => 'Every sensitive action logged and retained.'],
                ],
            ],
            'faq' => [
                'enabled' => true,
                'eyebrow' => 'FAQ',
                'title' => 'Questions, answered',
                'items' => [
                    ['q' => 'How does the wallet work?', 'a' => 'You pre-fund a USD wallet. Every top-up or gift card debits it instantly, with an immutable ledger entry. Failed transactions are auto-refunded.'],
                    ['q' => 'Can I resell to my own customers?', 'a' => 'Yes — set your own markup per product and region. Resellers and agents get sub-accounts with their own wallets and reporting.'],
                    ['q' => 'What happens if a top-up fails?', 'a' => 'We create the transaction first, then call the provider. If it fails, your wallet is automatically refunded and a webhook fires. No money is ever lost.'],
                    ['q' => 'Is there a sandbox?', 'a' => 'Every account includes a full sandbox with test keys, so you can build and validate flows before going live — no real money required.'],
                ],
            ],
            'cta' => [
                'enabled' => true,
                'title' => 'Start selling globally today',
                'description' => 'Create a business account in minutes. Sandbox included, no card required.',
                'primary_cta' => 'Create business account',
                'secondary_cta' => 'Explore the dashboard',
            ],
            'footer' => [
                'tagline' => 'One dashboard to sell global airtime, data and gift cards.',
                'columns' => [
                    [
                        'heading' => 'Product',
                        'links' => [
                            ['label' => 'Airtime', 'href' => '#'],
                            ['label' => 'Gift cards', 'href' => '#'],
                            ['label' => 'Bulk payouts', 'href' => '#'],
                            ['label' => 'API', 'href' => '#'],
                        ],
                    ],
                    [
                        'heading' => 'Company',
                        'links' => [
                            ['label' => 'About', 'href' => '#'],
                            ['label' => 'Pricing', 'href' => '#'],
                            ['label' => 'Security', 'href' => '#'],
                            ['label' => 'Careers', 'href' => '#'],
                        ],
                    ],
                    [
                        'heading' => 'Resources',
                        'links' => [
                            ['label' => 'Docs', 'href' => '/documentation'],
                            ['label' => 'API status', 'href' => '#'],
                            ['label' => 'Support', 'href' => '#'],
                            ['label' => 'Changelog', 'href' => '#'],
                        ],
                    ],
                ],
                'legal' => 'Privacy · Terms · Cookies',
                'copyright' => '© 2026 {app}. All rights reserved.',
            ],
        ];
    }
}
