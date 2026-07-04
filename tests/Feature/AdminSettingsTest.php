<?php

use App\Models\Setting;
use App\Models\User;
use App\Support\SystemSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('renders the branding settings page for an admin', function () {
    $this->actingAs($this->admin)->get(route('admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/branding')
            ->has('branding.appName')
            ->has('assetGuides.logo_light')
            ->has('surfaces')
            ->has('modes'));
});

it('renders the integration settings page for an admin', function () {
    $this->actingAs($this->admin)->get(route('admin.settings.integrations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/integrations')
            ->has('integrations.stripe'));
});

it('forbids non-admins from system settings', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.settings'))->assertForbidden();
    $this->actingAs($reseller)->get(route('admin.settings.integrations'))->assertForbidden();
    $this->actingAs($reseller)->post(route('admin.settings.branding'))->assertForbidden();
    $this->actingAs($reseller)->post(route('admin.settings.integration', 'stripe'))->assertForbidden();
});

it('saves branding name, display modes and homepage toggle', function () {
    $this->actingAs($this->admin)->post(route('admin.settings.branding'), [
        'app_name' => 'PayHub',
        'homepage_enabled' => false,
        'modes' => [
            'dashboard' => 'logo',
            'auth' => 'logo_text',
            'homepage' => 'text',
            'footer' => 'logo_text',
        ],
    ])->assertRedirect();

    $branding = SystemSettings::branding();
    expect($branding['app_name'])->toBe('PayHub')
        ->and($branding['homepage_enabled'])->toBeFalse()
        ->and($branding['modes']['dashboard'])->toBe('logo')
        ->and($branding['modes']['homepage'])->toBe('text');
});

it('uploads and then removes a logo on the public disk', function () {
    Storage::fake('public');

    $this->actingAs($this->admin)->post(route('admin.settings.branding'), [
        'app_name' => 'Tappy',
        'homepage_enabled' => true,
        'modes' => SystemSettings::SURFACES === [] ? [] : [
            'dashboard' => 'logo_text',
            'auth' => 'logo_text',
            'homepage' => 'logo_text',
            'footer' => 'logo_text',
        ],
        'logo_light' => UploadedFile::fake()->image('logo.png', 160, 40),
    ])->assertRedirect();

    $stored = SystemSettings::branding()['logo_light'];
    expect($stored)->not->toBeNull();
    Storage::disk('public')->assertExists($stored);

    // Removing it deletes the file and clears the setting.
    $this->actingAs($this->admin)->post(route('admin.settings.branding'), [
        'app_name' => 'Tappy',
        'homepage_enabled' => true,
        'modes' => [
            'dashboard' => 'logo_text',
            'auth' => 'logo_text',
            'homepage' => 'logo_text',
            'footer' => 'logo_text',
        ],
        'remove' => ['logo_light'],
    ])->assertRedirect();

    expect(SystemSettings::branding()['logo_light'])->toBeNull();
    Storage::disk('public')->assertMissing($stored);
});

it('redirects the homepage to sign in when disabled', function () {
    SystemSettings::saveBranding(['homepage_enabled' => false]);

    $this->get('/')->assertRedirect(route('login'));
});

it('serves the marketing homepage when enabled', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

it('encrypts integration secrets at rest and never leaks them to the client', function () {
    $this->actingAs($this->admin)->post(route('admin.settings.integration', 'stripe'), [
        'enabled' => true,
        'key' => 'pk_test_123',
        'secret' => 'sk_test_supersecret',
        'webhook_secret' => 'whsec_abc',
    ])->assertRedirect();

    // Stored secret is ciphertext, not the plaintext value.
    $raw = Setting::get(SystemSettings::INTEGRATIONS_KEY)['stripe'];
    expect($raw['secret'])->not->toBe('sk_test_supersecret')
        ->and(Crypt::decryptString($raw['secret']))->toBe('sk_test_supersecret')
        ->and($raw['key'])->toBe('pk_test_123');

    // The client status exposes only a "configured" boolean for secrets.
    $this->actingAs($this->admin)->get(route('admin.settings.integrations'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('integrations.stripe.enabled', true)
            ->where('integrations.stripe.values.key', 'pk_test_123')
            ->where('integrations.stripe.secrets.secret', true)
            ->missing('integrations.stripe.values.secret'));
});

it('reflects .env credentials in the integration status even without a UI save', function () {
    config([
        'services.topup.driver' => 'reloadly',
        'services.reloadly.client_id' => 'env-client-id',
        'services.reloadly.client_secret' => 'env-secret',
        'services.reloadly.sandbox' => true,
    ]);

    $status = SystemSettings::integrationsStatus()['reloadly'];

    expect($status['enabled'])->toBeTrue()
        ->and($status['values']['client_id'])->toBe('env-client-id')
        ->and($status['secrets']['client_secret'])->toBeTrue();
});

it('never blanks an env credential when a UI save omits the secret', function () {
    config(['services.stripe.secret' => 'sk_env_secret', 'services.payments.driver' => 'fake']);

    // Admin enables Stripe but only fills the publishable key, leaving the
    // secret blank because it's already configured via the environment.
    SystemSettings::saveIntegration('stripe', ['enabled' => true, 'key' => 'pk_ui', 'secret' => '']);

    SystemSettings::applyRuntimeConfig();

    expect(config('services.payments.driver'))->toBe('stripe')
        ->and(config('services.stripe.secret'))->toBe('sk_env_secret')
        ->and(config('services.stripe.key'))->toBe('pk_ui');
});

it('keeps an existing secret when the field is submitted blank', function () {
    SystemSettings::saveIntegration('stripe', ['enabled' => true, 'secret' => 'sk_live_keep']);

    $this->actingAs($this->admin)->post(route('admin.settings.integration', 'stripe'), [
        'enabled' => true,
        'key' => 'pk_live_new',
        'secret' => '',
    ])->assertRedirect();

    expect(SystemSettings::integration('stripe')['secret'])->toBe('sk_live_keep')
        ->and(SystemSettings::integration('stripe')['key'])->toBe('pk_live_new');
});

it('overrides runtime config only for enabled integrations', function () {
    config(['services.payments.driver' => 'fake']);

    SystemSettings::applyRuntimeConfig();
    expect(config('services.payments.driver'))->toBe('fake');

    SystemSettings::saveIntegration('stripe', [
        'enabled' => true,
        'secret' => 'sk_live_x',
    ]);

    SystemSettings::applyRuntimeConfig();
    expect(config('services.payments.driver'))->toBe('stripe')
        ->and(config('services.stripe.secret'))->toBe('sk_live_x');
});

it('reports a successful Stripe connection test', function () {
    Http::fake(['api.stripe.com/*' => Http::response(['object' => 'balance'], 200)]);

    SystemSettings::saveIntegration('stripe', ['enabled' => true, 'secret' => 'sk_test_ok']);

    $this->actingAs($this->admin)->post(route('admin.settings.integration.test', 'stripe'))
        ->assertSessionHas('toast.type', 'success');
});

it('reports a failed Stripe connection test', function () {
    Http::fake(['api.stripe.com/*' => Http::response(['error' => 'bad key'], 401)]);

    SystemSettings::saveIntegration('stripe', ['enabled' => true, 'secret' => 'sk_test_bad']);

    $this->actingAs($this->admin)->post(route('admin.settings.integration.test', 'stripe'))
        ->assertSessionHas('toast.type', 'error');
});

it('reports a successful Reloadly connection test', function () {
    Http::fake(['auth.reloadly.com/*' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200)]);

    SystemSettings::saveIntegration('reloadly', [
        'enabled' => true,
        'client_id' => 'cid',
        'client_secret' => 'csecret',
        'sandbox' => true,
    ]);

    $this->actingAs($this->admin)->post(route('admin.settings.integration.test', 'reloadly'))
        ->assertSessionHas('toast.type', 'success');
});

it('saves and encrypts the AI key and overrides the driver', function () {
    config(['services.ai.driver' => 'fake']);

    SystemSettings::saveIntegration('ai', [
        'enabled' => true,
        'driver' => 'anthropic',
        'key' => 'sk-ant-secret',
        'model' => 'claude-3-5-haiku-latest',
    ]);

    $raw = Setting::get(SystemSettings::INTEGRATIONS_KEY)['ai'];
    expect($raw['key'])->not->toBe('sk-ant-secret')
        ->and(Crypt::decryptString($raw['key']))->toBe('sk-ant-secret');

    SystemSettings::applyRuntimeConfig();

    expect(config('services.ai.driver'))->toBe('anthropic')
        ->and(config('services.anthropic.key'))->toBe('sk-ant-secret')
        ->and(config('services.anthropic.model'))->toBe('claude-3-5-haiku-latest');
});

it('reflects the env AI provider in the integration status', function () {
    config([
        'services.ai.driver' => 'openrouter',
        'services.openrouter.key' => 'or-key',
        'services.openrouter.model' => 'anthropic/claude-3.5-haiku',
    ]);

    $status = SystemSettings::integrationsStatus()['ai'];

    expect($status['enabled'])->toBeTrue()
        ->and($status['values']['driver'])->toBe('openrouter')
        ->and($status['values']['model'])->toBe('anthropic/claude-3.5-haiku')
        ->and($status['secrets']['key'])->toBeTrue();
});

it('reports a successful AI connection test', function () {
    Http::fake(['api.anthropic.com/*' => Http::response(['data' => []], 200)]);

    SystemSettings::saveIntegration('ai', ['enabled' => true, 'driver' => 'anthropic', 'key' => 'sk-ok']);

    $this->actingAs($this->admin)->post(route('admin.settings.integration.test', 'ai'))
        ->assertSessionHas('toast.type', 'success');
});

it('overrides the runtime config for each AI provider', function (string $driver, string $model) {
    config(['services.ai.driver' => 'fake']);

    SystemSettings::saveIntegration('ai', [
        'enabled' => true,
        'driver' => $driver,
        'key' => 'key-'.$driver,
        'model' => $model,
    ]);

    SystemSettings::applyRuntimeConfig();

    expect(config('services.ai.driver'))->toBe($driver)
        ->and(config("services.{$driver}.key"))->toBe('key-'.$driver)
        ->and(config("services.{$driver}.model"))->toBe($model);
})->with([
    'openai' => ['openai', 'gpt-4o-mini'],
    'groq' => ['groq', 'llama-3.3-70b-versatile'],
    'gemini' => ['gemini', 'gemini-1.5-flash'],
]);

it('probes each AI provider against its own endpoint', function (string $driver, string $host) {
    Http::fake([$host.'/*' => Http::response(['data' => []], 200)]);

    SystemSettings::saveIntegration('ai', ['enabled' => true, 'driver' => $driver, 'key' => 'sk-ok']);

    $this->actingAs($this->admin)->post(route('admin.settings.integration.test', 'ai'))
        ->assertSessionHas('toast.type', 'success');

    Http::assertSent(fn ($request) => str_contains($request->url(), $host));
})->with([
    'openai' => ['openai', 'api.openai.com'],
    'openrouter' => ['openrouter', 'openrouter.ai'],
    'groq' => ['groq', 'api.groq.com'],
    'gemini' => ['gemini', 'generativelanguage.googleapis.com'],
]);

it('exposes the AI provider labels and model catalog to the integrations page', function () {
    $this->actingAs($this->admin)->get(route('admin.settings.integrations'))
        ->assertInertia(fn ($page) => $page
            ->where('aiProviders.openrouter', 'OpenRouter')
            ->where('aiProviders.gemini', 'Google Gemini')
            ->has('aiModels.anthropic')
            ->has('aiModels.openrouter')
            ->where('aiModels.openrouter.0.free', true),
        );
});

it('rejects an unknown integration group', function () {
    $this->actingAs($this->admin)->post(route('admin.settings.integration', 'paypal'))->assertNotFound();
});

it('surfaces a saved-settings toast through the Inertia flash channel', function () {
    // Saving flashes a toast via back()->with('toast', …) and redirects.
    $this->actingAs($this->admin)
        ->post(route('admin.settings.integration', 'ai'), ['enabled' => false, 'driver' => 'anthropic'])
        ->assertRedirect();

    // The next Inertia request must carry that toast in its flash payload
    // (proves the session→Inertia bridge in HandleInertiaRequests works).
    $this->actingAs($this->admin)
        ->get(route('admin.settings.integrations'))
        ->assertInertia(fn (Assert $page) => $page
            ->hasFlash('toast.message', 'Ai settings saved.')
            ->hasFlash('toast.type', 'success'));
});
