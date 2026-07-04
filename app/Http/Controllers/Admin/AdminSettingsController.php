<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\Providers\ProviderRegistry;
use App\Services\Providers\Tillo\TilloClient;
use App\Support\AiModels;
use App\Support\LandingContent;
use App\Support\SystemSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AdminSettingsController extends Controller
{
    /** Uploadable branding assets and their stored-path key. */
    private const ASSET_FIELDS = ['logo_light', 'logo_dark', 'favicon'];

    public function branding(): Response
    {
        return Inertia::render('settings/branding', [
            'branding' => SystemSettings::brandingShare(),
            'assetGuides' => SystemSettings::ASSET_GUIDES,
            'surfaces' => SystemSettings::SURFACES,
            'modes' => SystemSettings::MODES,
        ]);
    }

    public function integrations(): Response
    {
        return Inertia::render('settings/integrations', [
            'integrations' => SystemSettings::integrationsStatus(),
            'providers' => ProviderRegistry::forUi(),
            'aiProviders' => AiModels::LABELS,
            'aiModels' => AiModels::CATALOG,
        ]);
    }

    /**
     * Save the active provider per category (airtime/data, gift cards,
     * payments). Each choice must be a provider registered for that category.
     */
    public function updateProviders(Request $request): RedirectResponse
    {
        $rules = ['fallback' => ['sometimes', 'array']];
        $fallbackCategories = [];

        foreach (ProviderRegistry::forUi() as $category) {
            $ids = array_column($category['options'], 'id');
            $rules[$category['key']] = ['required', Rule::in($ids)];

            if ($category['supportsFallback']) {
                // A fallback is optional ('' = none) and must differ from the primary.
                $rules['fallback.'.$category['key']] = ['nullable', Rule::in([...$ids, '']), Rule::notIn([$request->input($category['key'])])];
                $fallbackCategories[] = $category['key'];
            }
        }

        $validated = $request->validate($rules);

        SystemSettings::saveProviderSelection($validated);
        SystemSettings::saveProviderFallback(array_intersect_key($validated['fallback'] ?? [], array_flip($fallbackCategories)));

        AuditLog::record('settings.providers', 'Updated active service providers', $request->user(), $validated, $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => 'Active providers updated.']);
    }

    /** The landing-page CMS editor, seeded with the current merged content. */
    public function landing(): Response
    {
        return Inertia::render('settings/landing', [
            'content' => LandingContent::content(),
        ]);
    }

    /**
     * Save the public homepage content. The body is one JSON envelope (the whole
     * editable structure) plus an optional social-share image upload, which is
     * managed server-side so the client never dictates the stored asset path.
     */
    public function updateLanding(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:200000'],
            'og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_og_image' => ['nullable', 'boolean'],
        ]);

        $decoded = json_decode($validated['content'], true);

        if (! is_array($decoded)) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Could not read the page content. Please try again.']);
        }

        // Keep only known sections; drop any client-supplied image path/url.
        $content = array_intersect_key($decoded, array_flip(LandingContent::SECTIONS));
        unset($content['seo']['image'], $content['seo']['image_path']);

        $existing = LandingContent::imagePath();

        if ($request->boolean('remove_og_image')) {
            LandingContent::deleteAsset($existing);
            $imagePath = null;
        } elseif ($request->file('og_image') instanceof UploadedFile) {
            LandingContent::deleteAsset($existing);
            $imagePath = $request->file('og_image')->store(LandingContent::assetDir(), 'public');
        } else {
            $imagePath = $existing;
        }

        $content['seo'] = is_array($content['seo'] ?? null) ? $content['seo'] : [];
        $content['seo']['image_path'] = $imagePath;

        LandingContent::save($content);

        AuditLog::record('settings.landing', 'Updated landing page content', $request->user(), [], $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => 'Landing page updated.']);
    }

    /** Reset a single landing section back to its shipped default. */
    public function resetLanding(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section' => ['required', Rule::in(LandingContent::SECTIONS)],
        ]);

        LandingContent::resetSection($validated['section']);

        AuditLog::record('settings.landing', "Reset landing section: {$validated['section']}", $request->user(), ['section' => $validated['section']], $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => ucfirst($validated['section']).' section reset to default.']);
    }

    /**
     * Save white-label branding: app name, per-surface display modes, homepage
     * toggle, and logo/favicon uploads (or removals).
     */
    public function updateBranding(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:60'],
            'homepage_enabled' => ['required', 'boolean'],
            'modes' => ['required', 'array'],
            'modes.*' => [Rule::in(SystemSettings::MODES)],
            'logo_light' => ['nullable', 'image', 'mimes:svg,png', 'max:1024'],
            'logo_dark' => ['nullable', 'image', 'mimes:svg,png', 'max:1024'],
            'favicon' => ['nullable', 'mimes:svg,png,ico', 'max:1024'],
            'remove' => ['nullable', 'array'],
            'remove.*' => [Rule::in(self::ASSET_FIELDS)],
        ]);

        $current = SystemSettings::branding();
        $payload = [
            'app_name' => $validated['app_name'],
            'homepage_enabled' => (bool) $validated['homepage_enabled'],
            'modes' => array_intersect_key($validated['modes'], array_flip(SystemSettings::SURFACES)),
        ];

        foreach (self::ASSET_FIELDS as $field) {
            if (in_array($field, $validated['remove'] ?? [], true)) {
                $this->deleteAsset($current[$field] ?? null);
                $payload[$field] = null;

                continue;
            }

            if ($request->file($field) instanceof UploadedFile) {
                $this->deleteAsset($current[$field] ?? null);
                $payload[$field] = $request->file($field)->store('branding', 'public');
            }
        }

        SystemSettings::saveBranding($payload);

        AuditLog::record('settings.branding', 'Updated branding settings', $request->user(), [], $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => 'Branding updated.']);
    }

    /**
     * Save one integration group's credentials. Blank secret fields keep the
     * existing stored value (the client never receives the secret to echo back).
     */
    public function updateIntegration(Request $request, string $group): RedirectResponse
    {
        abort_unless(in_array($group, SystemSettings::GROUPS, true), 404);

        $validated = $request->validate($this->integrationRules($group));

        SystemSettings::saveIntegration($group, $validated);

        AuditLog::record('settings.integration', "Updated {$group} integration", $request->user(), ['group' => $group], $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => ucfirst($group).' settings saved.']);
    }

    /**
     * Run a lightweight live connectivity check against the saved credentials
     * for one integration group, reporting the result as a toast.
     */
    public function testIntegration(Request $request, string $group): RedirectResponse
    {
        abort_unless(in_array($group, SystemSettings::GROUPS, true), 404);

        try {
            [$ok, $message] = $this->probe($group, SystemSettings::integration($group));
        } catch (Throwable $e) {
            report($e);
            [$ok, $message] = [false, 'Connection test failed: '.$e->getMessage()];
        }

        return back()->with('toast', ['type' => $ok ? 'success' : 'error', 'message' => $message]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function integrationRules(string $group): array
    {
        return match ($group) {
            'mail' => [
                'enabled' => ['required', 'boolean'],
                'host' => ['nullable', 'string', 'max:255'],
                'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
                'username' => ['nullable', 'string', 'max:255'],
                'password' => ['nullable', 'string', 'max:255'],
                'scheme' => ['nullable', Rule::in(['tls', 'ssl'])],
                'from_address' => ['nullable', 'email', 'max:255'],
                'from_name' => ['nullable', 'string', 'max:255'],
            ],
            'stripe' => [
                'enabled' => ['required', 'boolean'],
                'key' => ['nullable', 'string', 'max:255'],
                'secret' => ['nullable', 'string', 'max:255'],
                'webhook_secret' => ['nullable', 'string', 'max:255'],
            ],
            'reloadly' => [
                'enabled' => ['required', 'boolean'],
                'client_id' => ['nullable', 'string', 'max:255'],
                'client_secret' => ['nullable', 'string', 'max:255'],
                'sandbox' => ['required', 'boolean'],
                'webhook_secret' => ['nullable', 'string', 'max:255'],
            ],
            'dingconnect' => [
                'enabled' => ['required', 'boolean'],
                'api_key' => ['nullable', 'string', 'max:255'],
                'sandbox' => ['required', 'boolean'],
            ],
            'dtone' => [
                'enabled' => ['required', 'boolean'],
                'api_key' => ['nullable', 'string', 'max:255'],
                'api_secret' => ['nullable', 'string', 'max:255'],
                'sandbox' => ['required', 'boolean'],
            ],
            'tremendous' => [
                'enabled' => ['required', 'boolean'],
                'api_key' => ['nullable', 'string', 'max:255'],
                'sandbox' => ['required', 'boolean'],
            ],
            'tillo' => [
                'enabled' => ['required', 'boolean'],
                'api_key' => ['nullable', 'string', 'max:255'],
                'secret' => ['nullable', 'string', 'max:255'],
                'sector' => ['nullable', 'string', 'max:64'],
                'sandbox' => ['required', 'boolean'],
            ],
            'giftbit' => [
                'enabled' => ['required', 'boolean'],
                'api_key' => ['nullable', 'string', 'max:1024'],
                'sandbox' => ['required', 'boolean'],
            ],
            'tango' => [
                'enabled' => ['required', 'boolean'],
                'platform_name' => ['nullable', 'string', 'max:255'],
                'platform_key' => ['nullable', 'string', 'max:255'],
                'account_identifier' => ['nullable', 'string', 'max:255'],
                'customer_identifier' => ['nullable', 'string', 'max:255'],
                'sandbox' => ['required', 'boolean'],
            ],
            'aws' => [
                'enabled' => ['required', 'boolean'],
                'access_key_id' => ['nullable', 'string', 'max:255'],
                'secret_access_key' => ['nullable', 'string', 'max:255'],
                'region' => ['nullable', 'string', 'max:64'],
                'bucket' => ['nullable', 'string', 'max:255'],
                'url' => ['nullable', 'string', 'max:255'],
            ],
            'ai' => [
                'enabled' => ['required', 'boolean'],
                'driver' => ['required', Rule::in(AiModels::PROVIDERS)],
                'key' => ['nullable', 'string', 'max:255'],
                'model' => ['nullable', 'string', 'max:255'],
            ],
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probe(string $group, array $config): array
    {
        return match ($group) {
            'stripe' => $this->probeStripe($config),
            'reloadly' => $this->probeReloadly($config),
            'dingconnect' => $this->probeDingConnect($config),
            'dtone' => $this->probeDtOne($config),
            'tremendous' => $this->probeTremendous($config),
            'tillo' => $this->probeTillo($config),
            'giftbit' => $this->probeGiftbit($config),
            'tango' => $this->probeTango($config),
            'mail' => $this->probeMail($config),
            'aws' => $this->probeAws($config),
            'ai' => $this->probeAi($config),
            default => [false, 'Unknown integration.'],
        };
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeAi(array $config): array
    {
        if (blank($config['key'] ?? null)) {
            return [false, 'Add an API key first.'];
        }

        $key = (string) $config['key'];
        $driver = AiModels::isProvider($config['driver'] ?? '') ? (string) $config['driver'] : 'anthropic';
        $label = AiModels::LABELS[$driver] ?? ucfirst($driver);

        $response = match ($driver) {
            'anthropic' => Http::withHeaders(['x-api-key' => $key, 'anthropic-version' => '2023-06-01'])
                ->timeout(10)->get('https://api.anthropic.com/v1/models'),
            'openai' => Http::withToken($key)->timeout(10)->get('https://api.openai.com/v1/models'),
            'openrouter' => Http::withToken($key)->timeout(10)->get('https://openrouter.ai/api/v1/key'),
            'groq' => Http::withToken($key)->timeout(10)->get('https://api.groq.com/openai/v1/models'),
            default => Http::timeout(10)->get('https://generativelanguage.googleapis.com/v1beta/models?key='.$key),
        };

        return $response->successful()
            ? [true, $label.' authenticated.']
            : [false, $label.' rejected the key ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeStripe(array $config): array
    {
        if (blank($config['secret'] ?? null)) {
            return [false, 'Add a Stripe secret key first.'];
        }

        $response = Http::withToken((string) $config['secret'])
            ->timeout(10)
            ->get('https://api.stripe.com/v1/balance');

        return $response->successful()
            ? [true, 'Stripe connection succeeded.']
            : [false, 'Stripe rejected the key ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeReloadly(array $config): array
    {
        if (blank($config['client_id'] ?? null) || blank($config['client_secret'] ?? null)) {
            return [false, 'Add Reloadly client ID and secret first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);
        $audience = $sandbox ? 'https://topups-sandbox.reloadly.com' : 'https://topups.reloadly.com';

        $response = Http::asJson()->timeout(10)->post('https://auth.reloadly.com/oauth/token', [
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'grant_type' => 'client_credentials',
            'audience' => $audience,
        ]);

        return $response->successful() && filled($response->json('access_token'))
            ? [true, 'Reloadly authenticated ('.($sandbox ? 'sandbox' : 'live').').']
            : [false, 'Reloadly rejected these credentials ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeDingConnect(array $config): array
    {
        if (blank($config['api_key'] ?? null)) {
            return [false, 'Add a DingConnect API key first.'];
        }

        $response = Http::withHeaders(['api_key' => (string) $config['api_key']])
            ->acceptJson()
            ->timeout(10)
            ->get('https://api.dingconnect.com/api/V1/GetBalance');

        return $response->successful()
            ? [true, 'DingConnect authenticated.']
            : [false, 'DingConnect rejected the API key ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeDtOne(array $config): array
    {
        if (blank($config['api_key'] ?? null) || blank($config['api_secret'] ?? null)) {
            return [false, 'Add a DT One API key and secret first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);
        $base = $sandbox ? 'https://preprod-dvs-api.dtone.com/v1' : 'https://dvs-api.dtone.com/v1';

        $response = Http::withBasicAuth((string) $config['api_key'], (string) $config['api_secret'])
            ->acceptJson()
            ->timeout(10)
            ->get($base.'/balances');

        return $response->successful()
            ? [true, 'DT One authenticated ('.($sandbox ? 'preprod' : 'live').').']
            : [false, 'DT One rejected these credentials ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeTremendous(array $config): array
    {
        if (blank($config['api_key'] ?? null)) {
            return [false, 'Add a Tremendous API key first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);
        $base = $sandbox ? 'https://testflight.tremendous.com/api/v2' : 'https://api.tremendous.com/api/v2';

        $response = Http::withToken((string) $config['api_key'])
            ->acceptJson()
            ->timeout(10)
            ->get($base.'/organizations');

        return $response->successful()
            ? [true, 'Tremendous authenticated ('.($sandbox ? 'sandbox' : 'live').').']
            : [false, 'Tremendous rejected the API key ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeTillo(array $config): array
    {
        if (blank($config['api_key'] ?? null) || blank($config['secret'] ?? null)) {
            return [false, 'Add a Tillo API key and secret first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);

        try {
            // A signed brands call validates the API key + HMAC secret end-to-end.
            (new TilloClient((string) $config['api_key'], (string) $config['secret'], $sandbox))
                ->get('/brands', 'brands', [], ['detail' => 'false']);
        } catch (Throwable $e) {
            return [false, 'Tillo rejected these credentials: '.$e->getMessage()];
        }

        return [true, 'Tillo authenticated ('.($sandbox ? 'sandbox' : 'live').').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeGiftbit(array $config): array
    {
        if (blank($config['api_key'] ?? null)) {
            return [false, 'Add a Giftbit API key first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);
        $base = $sandbox ? 'https://api-testbed.giftbit.com/papi/v1' : 'https://api.giftbit.com/papi/v1';

        $response = Http::withToken((string) $config['api_key'])
            ->acceptJson()
            ->timeout(10)
            ->get($base.'/ping');

        return $response->successful()
            ? [true, 'Giftbit authenticated ('.($sandbox ? 'testbed' : 'live').').']
            : [false, 'Giftbit rejected the API key ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeTango(array $config): array
    {
        if (blank($config['platform_name'] ?? null) || blank($config['platform_key'] ?? null)) {
            return [false, 'Add a Tango platform name and key first.'];
        }

        $sandbox = (bool) ($config['sandbox'] ?? true);
        $base = $sandbox ? 'https://integration-api.tangocard.com/raas/v2' : 'https://api.tangocard.com/raas/v2';

        $response = Http::withBasicAuth((string) $config['platform_name'], (string) $config['platform_key'])
            ->acceptJson()
            ->timeout(15)
            ->get($base.'/catalogs');

        return $response->successful()
            ? [true, 'Tango authenticated ('.($sandbox ? 'sandbox' : 'live').').']
            : [false, 'Tango rejected these credentials ('.$response->status().').'];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeMail(array $config): array
    {
        if (blank($config['host'] ?? null)) {
            return [false, 'Add an SMTP host first.'];
        }

        $port = (int) ($config['port'] ?? 587);
        $connection = @fsockopen((string) $config['host'], $port, $errno, $errstr, 10);

        if ($connection === false) {
            return [false, "Could not reach {$config['host']}:{$port} ({$errstr})."];
        }

        fclose($connection);

        return [true, "Reached the SMTP server at {$config['host']}:{$port}."];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{0: bool, 1: string}
     */
    private function probeAws(array $config): array
    {
        if (blank($config['bucket'] ?? null)) {
            return [false, 'Add an S3 bucket first.'];
        }

        config([
            'filesystems.disks.s3.key' => $config['access_key_id'] ?? null,
            'filesystems.disks.s3.secret' => $config['secret_access_key'] ?? null,
            'filesystems.disks.s3.region' => $config['region'] ?? null,
            'filesystems.disks.s3.bucket' => $config['bucket'],
            'filesystems.disks.s3.url' => $config['url'] ?? null,
        ]);

        Storage::disk('s3')->exists('.tappy-healthcheck');

        return [true, 'Connected to bucket "'.$config['bucket'].'".'];
    }

    private function deleteAsset(?string $path): void
    {
        if (filled($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
