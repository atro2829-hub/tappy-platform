<?php

namespace App\Services\Providers;

use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Payments\FakePaymentGateway;
use App\Services\Payments\StripePaymentGateway;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\DingConnect\DingConnectClient;
use App\Services\Providers\DingConnect\DingConnectTopUpProvider;
use App\Services\Providers\DtOne\DtOneClient;
use App\Services\Providers\DtOne\DtOneTopUpProvider;
use App\Services\Providers\Giftbit\GiftbitClient;
use App\Services\Providers\Giftbit\GiftbitGiftCardProvider;
use App\Services\Providers\Reloadly\ReloadlyClient;
use App\Services\Providers\Reloadly\ReloadlyGiftCardProvider;
use App\Services\Providers\Reloadly\ReloadlyTopUpProvider;
use App\Services\Providers\Tango\TangoClient;
use App\Services\Providers\Tango\TangoGiftCardProvider;
use App\Services\Providers\Tillo\TilloClient;
use App\Services\Providers\Tillo\TilloGiftCardProvider;
use App\Services\Providers\Tremendous\TremendousClient;
use App\Services\Providers\Tremendous\TremendousGiftCardProvider;
use App\Support\SystemSettings;
use Closure;

/**
 * Single source of truth for the swappable service providers behind Tappy's
 * three provider categories — airtime/data top-ups, gift cards, and payment
 * gateways. Each category lists the providers that can fulfil it; the admin
 * picks the active one per category from System Settings → Integrations.
 *
 * Adding a provider is a one-liner in {@see self::providers()} plus its adapter
 * class — the container binding, the admin selector, and the "configured"
 * indicators all read this catalog.
 *
 * Provider ids and labels are operator-facing only and must never be surfaced
 * to end customers (white-label).
 */
final class ProviderRegistry
{
    /** Provider categories and their admin-facing label. */
    public const CATEGORIES = [
        'topup' => 'Airtime & data top-ups',
        'giftcard' => 'Gift cards',
        'payment' => 'Payments (wallet funding)',
    ];

    /** Categories that support a read-path fallback provider, and its config key. */
    public const FALLBACK_DRIVER_KEYS = [
        'topup' => 'services.topup.fallback_driver',
        'giftcard' => 'services.giftcard.fallback_driver',
    ];

    /**
     * Build the adapter bound to a category's active provider. Falls back to the
     * network-free "fake" driver when the selection is unknown. When a distinct
     * fallback provider is configured (top-ups / gift cards), the primary is
     * wrapped in a read-path failover decorator.
     */
    public static function make(string $category): TopUpProvider|GiftCardProvider|PaymentGateway
    {
        $primary = self::build($category, self::activeId($category));
        $fallbackId = self::activeFallbackId($category);

        if ($fallbackId === null) {
            return $primary;
        }

        $fallback = self::build($category, $fallbackId);

        return match ($category) {
            'topup' => new FailoverTopUpProvider($primary, $fallback),
            'giftcard' => new FailoverGiftCardProvider($primary, $fallback),
            default => $primary,
        };
    }

    /**
     * Instantiate one provider for a category by id (defaults to fake).
     */
    private static function build(string $category, string $id): TopUpProvider|GiftCardProvider|PaymentGateway
    {
        $providers = self::providers()[$category] ?? [];
        $factory = $providers[$id]['make'] ?? $providers['fake']['make'];

        return $factory();
    }

    /**
     * The active fallback provider id for a category, or null when none applies.
     * A fallback is ignored unless it's registered, configured, and different
     * from the primary.
     */
    public static function activeFallbackId(string $category): ?string
    {
        $key = self::FALLBACK_DRIVER_KEYS[$category] ?? null;

        if ($key === null) {
            return null;
        }

        $id = (string) config($key);

        if ($id === '' || $id === self::activeId($category) || ! isset(self::providers()[$category][$id])) {
            return null;
        }

        return $id;
    }

    /**
     * The active provider id for a category, read from runtime config and
     * clamped to a registered provider (falls back to "fake").
     */
    public static function activeId(string $category): string
    {
        $id = match ($category) {
            'topup' => (string) config('services.topup.driver', 'fake'),
            // Gift cards default to the top-up provider until set independently,
            // preserving the original single-driver behaviour (Reloadly does both).
            'giftcard' => (string) (config('services.giftcard.driver') ?: config('services.topup.driver', 'fake')),
            'payment' => (string) config('services.payments.driver', 'fake'),
            default => 'fake',
        };

        return isset(self::providers()[$category][$id]) ? $id : 'fake';
    }

    /** Whether an id is a registered provider for a category. */
    public static function isRegistered(string $category, string $id): bool
    {
        return isset(self::providers()[$category][$id]);
    }

    /**
     * The catalog shaped for the admin selector: each category with its options
     * (id, label, whether its credentials are configured) and the currently
     * active selection.
     *
     * @return list<array{key: string, label: string, selected: string, options: list<array{id: string, label: string, configured: bool}>, supportsFallback: bool, fallback: string}>
     */
    public static function forUi(): array
    {
        $status = SystemSettings::integrationsStatus();
        $out = [];

        foreach (self::CATEGORIES as $category => $label) {
            $options = [];

            foreach (self::providers()[$category] as $id => $def) {
                $options[] = [
                    'id' => $id,
                    'label' => $def['label'],
                    'configured' => self::isConfigured($def, $status),
                ];
            }

            $out[] = [
                'key' => $category,
                'label' => $label,
                'selected' => self::activeId($category),
                'options' => $options,
                'supportsFallback' => isset(self::FALLBACK_DRIVER_KEYS[$category]),
                'fallback' => self::activeFallbackId($category) ?? '',
            ];
        }

        return $out;
    }

    /**
     * The full provider catalog, keyed by category then provider id.
     *
     * `group` is the integration credential group the adapter reads (null for
     * the key-free fake driver); `requires` lists the secret fields that must be
     * configured for the provider to be selectable in good faith.
     *
     * @return array<string, array<string, array{label: string, group: string|null, requires: list<string>, make: Closure}>>
     */
    private static function providers(): array
    {
        return [
            'topup' => [
                'fake' => ['label' => 'Built-in simulator', 'group' => null, 'requires' => [], 'make' => fn (): TopUpProvider => new FakeTopUpProvider],
                'reloadly' => ['label' => 'Reloadly', 'group' => 'reloadly', 'requires' => ['client_secret'], 'make' => fn (): TopUpProvider => new ReloadlyTopUpProvider(ReloadlyClient::fromConfig('airtime'))],
                'dingconnect' => ['label' => 'DingConnect', 'group' => 'dingconnect', 'requires' => ['api_key'], 'make' => fn (): TopUpProvider => new DingConnectTopUpProvider(DingConnectClient::fromConfig())],
                'dtone' => ['label' => 'DT One', 'group' => 'dtone', 'requires' => ['api_secret'], 'make' => fn (): TopUpProvider => new DtOneTopUpProvider(DtOneClient::fromConfig())],
            ],
            'giftcard' => [
                'fake' => ['label' => 'Built-in simulator', 'group' => null, 'requires' => [], 'make' => fn (): GiftCardProvider => new FakeGiftCardProvider],
                'reloadly' => ['label' => 'Reloadly', 'group' => 'reloadly', 'requires' => ['client_secret'], 'make' => fn (): GiftCardProvider => new ReloadlyGiftCardProvider(ReloadlyClient::fromConfig('giftcards'))],
                'tremendous' => ['label' => 'Tremendous', 'group' => 'tremendous', 'requires' => ['api_key'], 'make' => fn (): GiftCardProvider => new TremendousGiftCardProvider(TremendousClient::fromConfig())],
                'tillo' => ['label' => 'Tillo', 'group' => 'tillo', 'requires' => ['secret'], 'make' => fn (): GiftCardProvider => new TilloGiftCardProvider(TilloClient::fromConfig(), (string) config('services.tillo.sector', 'marketplace'))],
                'giftbit' => ['label' => 'Giftbit', 'group' => 'giftbit', 'requires' => ['api_key'], 'make' => fn (): GiftCardProvider => new GiftbitGiftCardProvider(GiftbitClient::fromConfig())],
                'tango' => ['label' => 'Tango Card', 'group' => 'tango', 'requires' => ['platform_key'], 'make' => fn (): GiftCardProvider => new TangoGiftCardProvider(TangoClient::fromConfig(), (string) config('services.tango.account_identifier'), (string) config('services.tango.customer_identifier'))],
            ],
            'payment' => [
                'fake' => ['label' => 'Built-in simulator', 'group' => null, 'requires' => [], 'make' => fn (): PaymentGateway => new FakePaymentGateway],
                'stripe' => ['label' => 'Stripe', 'group' => 'stripe', 'requires' => ['secret'], 'make' => fn (): PaymentGateway => new StripePaymentGateway((string) config('services.stripe.secret'))],
            ],
        ];
    }

    /**
     * A provider is "configured" when it needs no credentials (fake) or every
     * required secret in its integration group is present (in the DB or .env).
     *
     * @param  array{group: string|null, requires: list<string>, ...}  $def
     * @param  array<string, array<string, mixed>>  $status
     */
    private static function isConfigured(array $def, array $status): bool
    {
        if ($def['group'] === null) {
            return true;
        }

        $secrets = $status[$def['group']]['secrets'] ?? [];

        foreach ($def['requires'] as $field) {
            if (($secrets[$field] ?? false) !== true) {
                return false;
            }
        }

        return true;
    }
}
