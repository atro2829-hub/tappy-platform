<?php

use App\Models\User;
use App\Services\Payments\FakePaymentGateway;
use App\Services\Payments\StripePaymentGateway;
use App\Services\Providers\DingConnect\DingConnectTopUpProvider;
use App\Services\Providers\DtOne\DtOneTopUpProvider;
use App\Services\Providers\FailoverTopUpProvider;
use App\Services\Providers\FakeGiftCardProvider;
use App\Services\Providers\FakeTopUpProvider;
use App\Services\Providers\Giftbit\GiftbitGiftCardProvider;
use App\Services\Providers\ProviderRegistry;
use App\Services\Providers\Reloadly\ReloadlyGiftCardProvider;
use App\Services\Providers\Reloadly\ReloadlyTopUpProvider;
use App\Services\Providers\Tango\TangoGiftCardProvider;
use App\Services\Providers\Tillo\TilloGiftCardProvider;
use App\Services\Providers\Tremendous\TremendousGiftCardProvider;
use App\Support\SystemSettings;

it('defaults every category to the fake driver', function () {
    config(['services.topup.driver' => 'fake', 'services.giftcard.driver' => null, 'services.payments.driver' => 'fake']);

    expect(ProviderRegistry::activeId('topup'))->toBe('fake')
        ->and(ProviderRegistry::activeId('giftcard'))->toBe('fake')
        ->and(ProviderRegistry::activeId('payment'))->toBe('fake')
        ->and(ProviderRegistry::make('topup'))->toBeInstanceOf(FakeTopUpProvider::class)
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(FakeGiftCardProvider::class)
        ->and(ProviderRegistry::make('payment'))->toBeInstanceOf(FakePaymentGateway::class);
});

it('builds the live adapter when a real driver is selected', function () {
    config([
        'services.topup.driver' => 'reloadly',
        'services.payments.driver' => 'stripe',
        'services.stripe.secret' => 'sk_test_x',
    ]);

    expect(ProviderRegistry::make('topup'))->toBeInstanceOf(ReloadlyTopUpProvider::class)
        ->and(ProviderRegistry::make('payment'))->toBeInstanceOf(StripePaymentGateway::class);
});

it('lets gift cards inherit the top-up driver until set independently', function () {
    config(['services.topup.driver' => 'reloadly', 'services.giftcard.driver' => null]);
    expect(ProviderRegistry::activeId('giftcard'))->toBe('reloadly')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(ReloadlyGiftCardProvider::class);

    // An explicit gift-card driver decouples it from top-ups.
    config(['services.giftcard.driver' => 'fake']);
    expect(ProviderRegistry::activeId('giftcard'))->toBe('fake')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(FakeGiftCardProvider::class);
});

it('clamps an unknown driver id to the fake provider', function () {
    config(['services.topup.driver' => 'no-such-provider']);

    expect(ProviderRegistry::activeId('topup'))->toBe('fake')
        ->and(ProviderRegistry::make('topup'))->toBeInstanceOf(FakeTopUpProvider::class);
});

it('exposes every category with its options and configured flags to the UI', function () {
    config([
        'services.topup.driver' => 'fake',
        'services.payments.driver' => 'fake',
        // Ensure no ambient .env credentials mark Reloadly as configured here.
        'services.reloadly.client_secret' => null,
    ]);

    $ui = collect(ProviderRegistry::forUi())->keyBy('key');

    expect($ui)->toHaveKeys(['topup', 'giftcard', 'payment']);

    $topup = $ui['topup'];
    expect(collect($topup['options'])->pluck('id'))->toContain('fake', 'reloadly')
        // The key-free fake driver is always "configured".
        ->and(collect($topup['options'])->firstWhere('id', 'fake')['configured'])->toBeTrue()
        // Reloadly needs credentials it doesn't have here.
        ->and(collect($topup['options'])->firstWhere('id', 'reloadly')['configured'])->toBeFalse();
});

it('marks a provider configured once its credentials are saved', function () {
    SystemSettings::saveIntegration('reloadly', [
        'enabled' => true,
        'client_id' => 'cid',
        'client_secret' => 'csecret',
        'sandbox' => true,
    ]);

    $topup = collect(ProviderRegistry::forUi())->firstWhere('key', 'topup');

    expect(collect($topup['options'])->firstWhere('id', 'reloadly')['configured'])->toBeTrue();
});

it('persists an admin provider selection and applies it as the active driver', function () {
    SystemSettings::saveProviderSelection([
        'topup' => 'reloadly',
        'giftcard' => 'fake',
        'payment' => 'stripe',
    ]);

    expect(SystemSettings::providerSelection())->toMatchArray([
        'topup' => 'reloadly',
        'giftcard' => 'fake',
        'payment' => 'stripe',
    ]);

    config(['services.topup.driver' => 'fake', 'services.giftcard.driver' => null, 'services.payments.driver' => 'fake']);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.topup.driver'))->toBe('reloadly')
        ->and(config('services.giftcard.driver'))->toBe('fake')
        ->and(config('services.payments.driver'))->toBe('stripe');
});

it('lets the explicit selection win over a credential group default', function () {
    // Reloadly enabled would otherwise default the top-up driver to reloadly...
    SystemSettings::saveIntegration('reloadly', [
        'enabled' => true,
        'client_id' => 'cid',
        'client_secret' => 'csecret',
        'sandbox' => true,
    ]);
    // ...but the admin explicitly pinned top-ups back to the fake driver.
    SystemSettings::saveProviderSelection(['topup' => 'fake']);

    config(['services.topup.driver' => 'fake']);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.topup.driver'))->toBe('fake');
});

it('ignores selection keys for unknown categories', function () {
    SystemSettings::saveProviderSelection(['topup' => 'reloadly', 'bogus' => 'whatever']);

    expect(SystemSettings::providerSelection())->toHaveKey('topup')
        ->and(SystemSettings::providerSelection())->not->toHaveKey('bogus');
});

it('saves the active providers through the admin endpoint', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.settings.providers'), [
        'topup' => 'reloadly',
        'giftcard' => 'fake',
        'payment' => 'stripe',
    ])->assertRedirect();

    expect(SystemSettings::providerSelection())->toMatchArray([
        'topup' => 'reloadly',
        'giftcard' => 'fake',
        'payment' => 'stripe',
    ]);
});

it('rejects an unregistered provider for a category', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.settings.providers'), [
        'topup' => 'stripe', // stripe is a payment provider, not a top-up one
        'giftcard' => 'fake',
        'payment' => 'stripe',
    ])->assertSessionHasErrors('topup');
});

it('forbids non-admins from changing providers', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)
        ->post(route('admin.settings.providers'), ['topup' => 'fake', 'giftcard' => 'fake', 'payment' => 'fake'])
        ->assertForbidden();
});

it('offers DingConnect as a selectable top-up provider', function () {
    config(['services.topup.driver' => 'fake']);

    $topup = collect(ProviderRegistry::forUi())->firstWhere('key', 'topup');

    expect(collect($topup['options'])->pluck('id'))->toContain('dingconnect');
});

it('builds the DingConnect adapter when selected and configured', function () {
    SystemSettings::saveIntegration('dingconnect', ['enabled' => true, 'api_key' => 'dk_live_x', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['topup' => 'dingconnect']);

    config(['services.topup.driver' => 'fake']);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.topup.driver'))->toBe('dingconnect')
        ->and(config('services.dingconnect.api_key'))->toBe('dk_live_x')
        ->and(ProviderRegistry::make('topup'))->toBeInstanceOf(DingConnectTopUpProvider::class);
});

it('offers Tremendous as a selectable gift-card provider', function () {
    $giftcard = collect(ProviderRegistry::forUi())->firstWhere('key', 'giftcard');

    expect(collect($giftcard['options'])->pluck('id'))->toContain('tremendous');
});

it('builds the Tremendous adapter when selected, independent of the top-up driver', function () {
    SystemSettings::saveIntegration('tremendous', ['enabled' => true, 'api_key' => 'tr_live_x', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['giftcard' => 'tremendous']);

    config(['services.topup.driver' => 'reloadly', 'services.giftcard.driver' => null]);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.giftcard.driver'))->toBe('tremendous')
        ->and(config('services.tremendous.api_key'))->toBe('tr_live_x')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(TremendousGiftCardProvider::class)
        // Top-ups stay on Reloadly — the two categories are decoupled.
        ->and(ProviderRegistry::activeId('topup'))->toBe('reloadly');
});

it('wraps the primary in a failover decorator when a distinct fallback is configured', function () {
    config(['services.topup.driver' => 'reloadly', 'services.topup.fallback_driver' => 'fake']);

    expect(ProviderRegistry::activeFallbackId('topup'))->toBe('fake')
        ->and(ProviderRegistry::make('topup'))->toBeInstanceOf(FailoverTopUpProvider::class);
});

it('ignores a fallback that equals the primary or is unknown', function () {
    config(['services.topup.driver' => 'reloadly', 'services.topup.fallback_driver' => 'reloadly']);
    expect(ProviderRegistry::activeFallbackId('topup'))->toBeNull();

    config(['services.topup.fallback_driver' => 'no-such']);
    expect(ProviderRegistry::activeFallbackId('topup'))->toBeNull();

    // No fallback configured -> plain primary, no decorator.
    config(['services.topup.fallback_driver' => null]);
    expect(ProviderRegistry::make('topup'))->toBeInstanceOf(ReloadlyTopUpProvider::class);
});

it('persists and applies a read-path fallback selection', function () {
    SystemSettings::saveProviderFallback(['topup' => 'fake', 'giftcard' => 'fake']);

    config(['services.topup.fallback_driver' => null, 'services.giftcard.fallback_driver' => null]);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.topup.fallback_driver'))->toBe('fake')
        ->and(config('services.giftcard.fallback_driver'))->toBe('fake');
});

it('saves provider primary and fallback through the admin endpoint', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.settings.providers'), [
        'topup' => 'reloadly',
        'giftcard' => 'reloadly',
        'payment' => 'stripe',
        'fallback' => ['topup' => 'fake', 'giftcard' => ''],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(SystemSettings::providerFallback())->toMatchArray(['topup' => 'fake', 'giftcard' => '']);
});

it('rejects a fallback that equals the primary', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.settings.providers'), [
        'topup' => 'reloadly',
        'giftcard' => 'reloadly',
        'payment' => 'stripe',
        'fallback' => ['topup' => 'reloadly'],
    ])->assertSessionHasErrors('fallback.topup');
});

it('builds the DT One adapter when selected and configured', function () {
    SystemSettings::saveIntegration('dtone', ['enabled' => true, 'api_key' => 'k', 'api_secret' => 'dt_secret', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['topup' => 'dtone']);

    config(['services.topup.driver' => 'fake']);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.topup.driver'))->toBe('dtone')
        ->and(config('services.dtone.api_secret'))->toBe('dt_secret')
        ->and(ProviderRegistry::make('topup'))->toBeInstanceOf(DtOneTopUpProvider::class);
});

it('builds the Tillo adapter when selected and configured', function () {
    SystemSettings::saveIntegration('tillo', ['enabled' => true, 'api_key' => 'k', 'secret' => 'tillo_secret', 'sector' => 'marketplace', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['giftcard' => 'tillo']);

    config(['services.topup.driver' => 'reloadly', 'services.giftcard.driver' => null]);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.giftcard.driver'))->toBe('tillo')
        ->and(config('services.tillo.secret'))->toBe('tillo_secret')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(TilloGiftCardProvider::class);
});

it('builds the Giftbit adapter when selected and configured', function () {
    SystemSettings::saveIntegration('giftbit', ['enabled' => true, 'api_key' => 'gb_secret', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['giftcard' => 'giftbit']);

    config(['services.topup.driver' => 'reloadly', 'services.giftcard.driver' => null]);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.giftcard.driver'))->toBe('giftbit')
        ->and(config('services.giftbit.api_key'))->toBe('gb_secret')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(GiftbitGiftCardProvider::class);
});

it('builds the Tango adapter when selected and configured', function () {
    SystemSettings::saveIntegration('tango', ['enabled' => true, 'platform_name' => 'p', 'platform_key' => 'tango_secret', 'account_identifier' => 'a', 'customer_identifier' => 'c', 'sandbox' => true]);
    SystemSettings::saveProviderSelection(['giftcard' => 'tango']);

    config(['services.topup.driver' => 'reloadly', 'services.giftcard.driver' => null]);
    SystemSettings::applyRuntimeConfig();

    expect(config('services.giftcard.driver'))->toBe('tango')
        ->and(config('services.tango.platform_key'))->toBe('tango_secret')
        ->and(ProviderRegistry::make('giftcard'))->toBeInstanceOf(TangoGiftCardProvider::class);
});

it('exposes the provider catalog to the integrations page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.settings.integrations'))
        ->assertInertia(fn ($page) => $page
            ->has('providers', 3)
            ->where('providers.0.key', 'topup'));
});
