<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

/**
 * Central reader/writer for platform-level system settings: white-label
 * branding (app name, logos, favicon, per-surface display modes, homepage
 * toggle) and integration credentials (mail, Stripe, Reloadly, AWS).
 *
 * Branding is public and shared with every Inertia page. Integration secrets
 * are encrypted at rest and never leave the server in plaintext.
 */
final class SystemSettings
{
    /** Settings key holding the branding array. */
    public const BRANDING_KEY = 'branding';

    /** Settings key holding the integrations array (keyed by group). */
    public const INTEGRATIONS_KEY = 'integrations';

    /** Settings key holding the active provider id per provider category. */
    public const PROVIDERS_KEY = 'provider_selection';

    /** Settings key holding the read-path fallback provider id per category. */
    public const PROVIDERS_FALLBACK_KEY = 'provider_fallback';

    /** Provider categories and the runtime config key that selects each driver. */
    public const PROVIDER_DRIVER_KEYS = [
        'topup' => 'services.topup.driver',
        'giftcard' => 'services.giftcard.driver',
        'payment' => 'services.payments.driver',
    ];

    /** Categories that support a read-path fallback, and the config key for it. */
    public const PROVIDER_FALLBACK_KEYS = [
        'topup' => 'services.topup.fallback_driver',
        'giftcard' => 'services.giftcard.fallback_driver',
    ];

    /** Display surfaces that each pick their own logo mode. */
    public const SURFACES = ['dashboard', 'auth', 'homepage', 'footer'];

    /** Valid logo display modes. */
    public const MODES = ['logo_text', 'logo', 'text'];

    /** Integration groups the admin can configure from the UI. */
    public const GROUPS = ['mail', 'stripe', 'reloadly', 'dingconnect', 'dtone', 'tremendous', 'tillo', 'giftbit', 'tango', 'aws', 'ai'];

    /**
     * Secret fields per integration group — encrypted at rest and masked
     * (never returned in plaintext) to the client.
     *
     * @var array<string, list<string>>
     */
    public const SECRET_FIELDS = [
        'mail' => ['password'],
        'stripe' => ['secret', 'webhook_secret'],
        'reloadly' => ['client_secret', 'webhook_secret'],
        'dingconnect' => ['api_key'],
        'dtone' => ['api_secret'],
        'tremendous' => ['api_key'],
        'tillo' => ['secret'],
        'giftbit' => ['api_key'],
        'tango' => ['platform_key'],
        'aws' => ['secret_access_key'],
        'ai' => ['key'],
    ];

    /**
     * Recommended asset dimensions surfaced in the upload UI.
     *
     * @var array<string, array{label: string, hint: string, accept: string}>
     */
    public const ASSET_GUIDES = [
        'logo_light' => ['label' => 'Logo (light mode)', 'hint' => 'SVG or PNG · 160×40px · transparent background', 'accept' => 'image/svg+xml,image/png'],
        'logo_dark' => ['label' => 'Logo (dark mode)', 'hint' => 'SVG or PNG · 160×40px · transparent background', 'accept' => 'image/svg+xml,image/png'],
        'favicon' => ['label' => 'Favicon', 'hint' => 'PNG, SVG or ICO · 512×512px square', 'accept' => 'image/svg+xml,image/png,image/x-icon,image/vnd.microsoft.icon'],
    ];

    /**
     * The full branding config, merged over sensible defaults.
     *
     * @return array{app_name: string, logo_light: ?string, logo_dark: ?string, favicon: ?string, homepage_enabled: bool, modes: array<string, string>}
     */
    public static function branding(): array
    {
        $stored = Setting::get(self::BRANDING_KEY, []);
        $defaults = self::defaultBranding();

        if (! is_array($stored)) {
            $stored = [];
        }

        return [
            'app_name' => (string) ($stored['app_name'] ?? $defaults['app_name']),
            'logo_light' => $stored['logo_light'] ?? null,
            'logo_dark' => $stored['logo_dark'] ?? null,
            'favicon' => $stored['favicon'] ?? null,
            'homepage_enabled' => (bool) ($stored['homepage_enabled'] ?? $defaults['homepage_enabled']),
            'modes' => array_merge($defaults['modes'], is_array($stored['modes'] ?? null) ? $stored['modes'] : []),
        ];
    }

    /**
     * The branding payload shared with the client (camelCase, public URLs).
     *
     * @return array{appName: string, logoLight: ?string, logoDark: ?string, favicon: ?string, homepageEnabled: bool, modes: array<string, string>}
     */
    public static function brandingShare(): array
    {
        $branding = self::branding();

        return [
            'appName' => $branding['app_name'],
            'logoLight' => self::assetUrl($branding['logo_light']),
            'logoDark' => self::assetUrl($branding['logo_dark']),
            'favicon' => self::assetUrl($branding['favicon']),
            'homepageEnabled' => $branding['homepage_enabled'],
            'modes' => $branding['modes'],
        ];
    }

    /**
     * Persist branding changes, merging over what's already stored.
     *
     * @param  array<string, mixed>  $values
     */
    public static function saveBranding(array $values): void
    {
        Setting::put(self::BRANDING_KEY, array_merge(self::branding(), $values));
    }

    /** The configured app name (falls back to config). */
    public static function appName(): string
    {
        return self::branding()['app_name'];
    }

    /** Public URL for the configured favicon, or null when unset. */
    public static function faviconUrl(): ?string
    {
        return self::assetUrl(self::branding()['favicon']);
    }

    /** Whether the public marketing homepage is enabled. */
    public static function homepageEnabled(): bool
    {
        return self::branding()['homepage_enabled'];
    }

    /**
     * Decrypted integration config for a group (server-side use only).
     *
     * @return array<string, mixed>
     */
    public static function integration(string $group): array
    {
        $all = Setting::get(self::INTEGRATIONS_KEY, []);
        $stored = is_array($all) && is_array($all[$group] ?? null) ? $all[$group] : [];

        foreach (self::SECRET_FIELDS[$group] ?? [] as $field) {
            if (filled($stored[$field] ?? null)) {
                $stored[$field] = self::decrypt((string) $stored[$field]);
            }
        }

        return $stored;
    }

    /**
     * Client-safe integration status for every group: non-secret values are
     * returned as-is; secret values become a boolean "configured" flag.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function integrationsStatus(): array
    {
        $status = [];

        foreach (self::GROUPS as $group) {
            $stored = self::integration($group);
            $effective = self::effectiveConfig($group);
            $secrets = self::SECRET_FIELDS[$group];

            // Non-secret fields fall back to the live .env-derived config so the
            // form reflects what's actually active, not just UI-saved overrides.
            $public = [];
            foreach ($effective as $key => $value) {
                if ($key === 'enabled' || in_array($key, $secrets, true)) {
                    continue;
                }

                $public[$key] = $stored[$key] ?? $value;
            }

            // A secret counts as configured if it's set in the DB or the env.
            $configured = [];
            foreach ($secrets as $field) {
                $configured[$field] = filled($stored[$field] ?? null) || filled($effective[$field] ?? null);
            }

            $status[$group] = [
                'enabled' => array_key_exists('enabled', $stored)
                    ? (bool) $stored['enabled']
                    : (bool) ($effective['enabled'] ?? false),
                'values' => $public,
                'secrets' => $configured,
            ];
        }

        return $status;
    }

    /**
     * The effective config for a group, read from the live config repository
     * (which already reflects .env plus any DB overrides applied at boot).
     *
     * @return array<string, mixed>
     */
    private static function effectiveConfig(string $group): array
    {
        return match ($group) {
            'mail' => [
                'enabled' => config('mail.default') === 'smtp' && filled(config('mail.mailers.smtp.host')),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'password' => config('mail.mailers.smtp.password'),
                'scheme' => config('mail.mailers.smtp.scheme'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name'),
            ],
            'stripe' => [
                'enabled' => config('services.payments.driver') === 'stripe',
                'key' => config('services.stripe.key'),
                'secret' => config('services.stripe.secret'),
                'webhook_secret' => config('services.stripe.webhook_secret'),
            ],
            'reloadly' => [
                'enabled' => config('services.topup.driver') === 'reloadly',
                'client_id' => config('services.reloadly.client_id'),
                'client_secret' => config('services.reloadly.client_secret'),
                'sandbox' => (bool) config('services.reloadly.sandbox'),
                'webhook_secret' => config('services.reloadly.webhook_secret'),
            ],
            'dingconnect' => [
                'enabled' => config('services.topup.driver') === 'dingconnect',
                'api_key' => config('services.dingconnect.api_key'),
                'sandbox' => (bool) config('services.dingconnect.sandbox'),
            ],
            'dtone' => [
                'enabled' => config('services.topup.driver') === 'dtone',
                'api_key' => config('services.dtone.api_key'),
                'api_secret' => config('services.dtone.api_secret'),
                'sandbox' => (bool) config('services.dtone.sandbox'),
            ],
            'tremendous' => [
                'enabled' => config('services.giftcard.driver') === 'tremendous',
                'api_key' => config('services.tremendous.api_key'),
                'sandbox' => (bool) config('services.tremendous.sandbox'),
            ],
            'tillo' => [
                'enabled' => config('services.giftcard.driver') === 'tillo',
                'api_key' => config('services.tillo.api_key'),
                'secret' => config('services.tillo.secret'),
                'sector' => config('services.tillo.sector'),
                'sandbox' => (bool) config('services.tillo.sandbox'),
            ],
            'giftbit' => [
                'enabled' => config('services.giftcard.driver') === 'giftbit',
                'api_key' => config('services.giftbit.api_key'),
                'sandbox' => (bool) config('services.giftbit.sandbox'),
            ],
            'tango' => [
                'enabled' => config('services.giftcard.driver') === 'tango',
                'platform_name' => config('services.tango.platform_name'),
                'platform_key' => config('services.tango.platform_key'),
                'account_identifier' => config('services.tango.account_identifier'),
                'customer_identifier' => config('services.tango.customer_identifier'),
                'sandbox' => (bool) config('services.tango.sandbox'),
            ],
            'aws' => [
                'enabled' => config('filesystems.default') === 's3',
                'access_key_id' => config('filesystems.disks.s3.key'),
                'secret_access_key' => config('filesystems.disks.s3.secret'),
                'region' => config('filesystems.disks.s3.region'),
                'bucket' => config('filesystems.disks.s3.bucket'),
                'url' => config('filesystems.disks.s3.url'),
            ],
            'ai' => self::aiEffectiveConfig(),
            default => [],
        };
    }

    /**
     * The AI Copilot's effective config, resolved DB-first: a saved provider,
     * key or model is shown even while the integration is disabled or the .env
     * defaults are absent. The live config is only the fallback.
     *
     * @return array<string, mixed>
     */
    private static function aiEffectiveConfig(): array
    {
        $stored = self::integration('ai');

        $driver = AiModels::isProvider($stored['driver'] ?? '')
            ? (string) $stored['driver']
            : (AiModels::isProvider((string) config('services.ai.driver', 'fake'))
                ? (string) config('services.ai.driver')
                : 'anthropic');

        return [
            'enabled' => (bool) ($stored['enabled'] ?? AiModels::isProvider((string) config('services.ai.driver', 'fake'))),
            'driver' => $driver,
            'key' => $stored['key'] ?? config("services.{$driver}.key"),
            'model' => $stored['model'] ?? config("services.{$driver}.model"),
        ];
    }

    /**
     * Persist one integration group. Secret fields left blank in the payload
     * keep their existing encrypted value; non-blank ones are re-encrypted.
     *
     * @param  array<string, mixed>  $values
     */
    public static function saveIntegration(string $group, array $values): void
    {
        $existing = Setting::get(self::INTEGRATIONS_KEY, []);
        $existing = is_array($existing) ? $existing : [];
        $current = is_array($existing[$group] ?? null) ? $existing[$group] : [];

        foreach (self::SECRET_FIELDS[$group] ?? [] as $field) {
            if (array_key_exists($field, $values) && blank($values[$field])) {
                // Blank submission means "leave the stored secret untouched".
                unset($values[$field]);
            } elseif (filled($values[$field] ?? null)) {
                $values[$field] = Crypt::encryptString((string) $values[$field]);
            }
        }

        $existing[$group] = array_merge($current, $values);
        Setting::put(self::INTEGRATIONS_KEY, $existing);
    }

    /**
     * The admin-selected active provider id per category (empty until chosen).
     *
     * @return array<string, string>
     */
    public static function providerSelection(): array
    {
        $stored = Setting::get(self::PROVIDERS_KEY, []);

        return is_array($stored) ? array_map(fn ($v): string => (string) $v, $stored) : [];
    }

    /**
     * Persist the active provider id for one or more categories.
     *
     * @param  array<string, string>  $selection
     */
    public static function saveProviderSelection(array $selection): void
    {
        $selection = array_intersect_key($selection, self::PROVIDER_DRIVER_KEYS);

        Setting::put(self::PROVIDERS_KEY, array_merge(self::providerSelection(), $selection));
    }

    /**
     * The admin-selected read-path fallback provider id per category (empty
     * string means "no fallback").
     *
     * @return array<string, string>
     */
    public static function providerFallback(): array
    {
        $stored = Setting::get(self::PROVIDERS_FALLBACK_KEY, []);

        return is_array($stored) ? array_map(fn ($v): string => (string) $v, $stored) : [];
    }

    /**
     * Persist the read-path fallback provider id for one or more categories.
     *
     * @param  array<string, string>  $fallback
     */
    public static function saveProviderFallback(array $fallback): void
    {
        $fallback = array_intersect_key($fallback, self::PROVIDER_FALLBACK_KEYS);

        Setting::put(self::PROVIDERS_FALLBACK_KEY, array_merge(self::providerFallback(), $fallback));
    }

    /**
     * Override runtime config from stored integration settings. Only groups the
     * admin has explicitly enabled override the .env defaults, so an untouched
     * install keeps behaving exactly as its environment dictates.
     */
    public static function applyRuntimeConfig(): void
    {
        $mail = self::integration('mail');
        if ($mail['enabled'] ?? false) {
            self::override([
                'mail.mailers.smtp.host' => $mail['host'] ?? null,
                'mail.mailers.smtp.port' => $mail['port'] ?? null,
                'mail.mailers.smtp.username' => $mail['username'] ?? null,
                'mail.mailers.smtp.password' => $mail['password'] ?? null,
                'mail.mailers.smtp.scheme' => $mail['scheme'] ?? null,
                'mail.from.address' => $mail['from_address'] ?? null,
                'mail.from.name' => $mail['from_name'] ?? null,
            ]);

            if (filled($mail['host'] ?? null) || filled(config('mail.mailers.smtp.host'))) {
                config(['mail.default' => 'smtp']);
            }
        }

        $stripe = self::integration('stripe');
        if ($stripe['enabled'] ?? false) {
            self::override([
                'services.stripe.key' => $stripe['key'] ?? null,
                'services.stripe.secret' => $stripe['secret'] ?? null,
                'services.stripe.webhook_secret' => $stripe['webhook_secret'] ?? null,
            ]);

            if (filled($stripe['secret'] ?? null) || filled(config('services.stripe.secret'))) {
                config(['services.payments.driver' => 'stripe']);
            }
        }

        $reloadly = self::integration('reloadly');
        if ($reloadly['enabled'] ?? false) {
            self::override([
                'services.reloadly.client_id' => $reloadly['client_id'] ?? null,
                'services.reloadly.client_secret' => $reloadly['client_secret'] ?? null,
                'services.reloadly.webhook_secret' => $reloadly['webhook_secret'] ?? null,
            ]);
            config(['services.reloadly.sandbox' => (bool) ($reloadly['sandbox'] ?? config('services.reloadly.sandbox'))]);

            if (filled($reloadly['client_id'] ?? null) || filled(config('services.reloadly.client_id'))) {
                config(['services.topup.driver' => 'reloadly']);
            }
        }

        $dingconnect = self::integration('dingconnect');
        if ($dingconnect['enabled'] ?? false) {
            self::override([
                'services.dingconnect.api_key' => $dingconnect['api_key'] ?? null,
            ]);
            config(['services.dingconnect.sandbox' => (bool) ($dingconnect['sandbox'] ?? config('services.dingconnect.sandbox'))]);

            if (filled($dingconnect['api_key'] ?? null) || filled(config('services.dingconnect.api_key'))) {
                config(['services.topup.driver' => 'dingconnect']);
            }
        }

        $dtone = self::integration('dtone');
        if ($dtone['enabled'] ?? false) {
            self::override([
                'services.dtone.api_key' => $dtone['api_key'] ?? null,
                'services.dtone.api_secret' => $dtone['api_secret'] ?? null,
            ]);
            config(['services.dtone.sandbox' => (bool) ($dtone['sandbox'] ?? config('services.dtone.sandbox'))]);

            if (filled($dtone['api_secret'] ?? null) || filled(config('services.dtone.api_secret'))) {
                config(['services.topup.driver' => 'dtone']);
            }
        }

        $tremendous = self::integration('tremendous');
        if ($tremendous['enabled'] ?? false) {
            self::override([
                'services.tremendous.api_key' => $tremendous['api_key'] ?? null,
            ]);
            config(['services.tremendous.sandbox' => (bool) ($tremendous['sandbox'] ?? config('services.tremendous.sandbox'))]);

            if (filled($tremendous['api_key'] ?? null) || filled(config('services.tremendous.api_key'))) {
                config(['services.giftcard.driver' => 'tremendous']);
            }
        }

        $tillo = self::integration('tillo');
        if ($tillo['enabled'] ?? false) {
            self::override([
                'services.tillo.api_key' => $tillo['api_key'] ?? null,
                'services.tillo.secret' => $tillo['secret'] ?? null,
                'services.tillo.sector' => $tillo['sector'] ?? null,
            ]);
            config(['services.tillo.sandbox' => (bool) ($tillo['sandbox'] ?? config('services.tillo.sandbox'))]);

            if (filled($tillo['secret'] ?? null) || filled(config('services.tillo.secret'))) {
                config(['services.giftcard.driver' => 'tillo']);
            }
        }

        $giftbit = self::integration('giftbit');
        if ($giftbit['enabled'] ?? false) {
            self::override(['services.giftbit.api_key' => $giftbit['api_key'] ?? null]);
            config(['services.giftbit.sandbox' => (bool) ($giftbit['sandbox'] ?? config('services.giftbit.sandbox'))]);

            if (filled($giftbit['api_key'] ?? null) || filled(config('services.giftbit.api_key'))) {
                config(['services.giftcard.driver' => 'giftbit']);
            }
        }

        $tango = self::integration('tango');
        if ($tango['enabled'] ?? false) {
            self::override([
                'services.tango.platform_name' => $tango['platform_name'] ?? null,
                'services.tango.platform_key' => $tango['platform_key'] ?? null,
                'services.tango.account_identifier' => $tango['account_identifier'] ?? null,
                'services.tango.customer_identifier' => $tango['customer_identifier'] ?? null,
            ]);
            config(['services.tango.sandbox' => (bool) ($tango['sandbox'] ?? config('services.tango.sandbox'))]);

            if (filled($tango['platform_key'] ?? null) || filled(config('services.tango.platform_key'))) {
                config(['services.giftcard.driver' => 'tango']);
            }
        }

        $aws = self::integration('aws');
        if ($aws['enabled'] ?? false) {
            self::override([
                'filesystems.disks.s3.key' => $aws['access_key_id'] ?? null,
                'filesystems.disks.s3.secret' => $aws['secret_access_key'] ?? null,
                'filesystems.disks.s3.region' => $aws['region'] ?? null,
                'filesystems.disks.s3.bucket' => $aws['bucket'] ?? null,
                'filesystems.disks.s3.url' => $aws['url'] ?? null,
            ]);

            if (filled($aws['bucket'] ?? null) || filled(config('filesystems.disks.s3.bucket'))) {
                config(['filesystems.default' => 's3']);
            }
        }

        $ai = self::integration('ai');
        if ($ai['enabled'] ?? false) {
            $driver = AiModels::isProvider($ai['driver'] ?? '') ? (string) $ai['driver'] : 'anthropic';

            self::override([
                "services.{$driver}.key" => $ai['key'] ?? null,
                "services.{$driver}.model" => $ai['model'] ?? null,
            ]);

            if (filled($ai['key'] ?? null) || filled(config("services.{$driver}.key"))) {
                config(['services.ai.driver' => $driver]);
            }
        }

        // An explicit per-category provider choice wins over the credential
        // groups' enabled-based defaults applied above. Unknown ids are clamped
        // to the fake driver when the registry resolves them.
        foreach (self::providerSelection() as $category => $providerId) {
            if (filled($providerId) && isset(self::PROVIDER_DRIVER_KEYS[$category])) {
                config([self::PROVIDER_DRIVER_KEYS[$category] => $providerId]);
            }
        }

        // Read-path fallback per category (empty string clears it). The registry
        // ignores a fallback that equals the primary or isn't registered.
        foreach (self::providerFallback() as $category => $providerId) {
            if (isset(self::PROVIDER_FALLBACK_KEYS[$category])) {
                config([self::PROVIDER_FALLBACK_KEYS[$category] => $providerId !== '' ? $providerId : null]);
            }
        }

        $branding = self::branding();
        if (filled($branding['app_name'])) {
            config(['app.name' => $branding['app_name']]);
        }
    }

    /**
     * Apply config overrides, skipping blank values so a UI save never wipes a
     * credential that's still supplied by the environment.
     *
     * @param  array<string, mixed>  $map
     */
    private static function override(array $map): void
    {
        foreach ($map as $key => $value) {
            if (filled($value)) {
                config([$key => $value]);
            }
        }
    }

    /**
     * Default branding, used until an admin overrides it. The name defaults to
     * the product brand ("Tappy") — matching what shipped — rather than the
     * framework's app.name, which is unconfigured on a fresh install.
     */
    private static function defaultBranding(): array
    {
        $appName = (string) config('app.name', 'Tappy');

        return [
            'app_name' => in_array($appName, ['', 'Laravel'], true) ? 'Tappy' : $appName,
            'homepage_enabled' => true,
            'modes' => array_fill_keys(self::SURFACES, 'logo_text'),
        ];
    }

    /** Resolve a stored storage-relative path to a public URL. */
    private static function assetUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    /** Decrypt a stored secret, tolerating values written before encryption. */
    private static function decrypt(string $value): string
    {
        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            return $value;
        }
    }
}
