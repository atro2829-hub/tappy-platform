<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Http\Requests\StoreApiKeyRequest;
use App\Http\Resources\ApiKeyResource;
use App\Http\Resources\WebhookEventResource;
use App\Jobs\DeliverWebhookJob;
use App\Models\ApiKey;
use App\Models\WebhookEndpoint;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperController extends Controller
{
    public function index(Request $request): Response
    {
        $apiKeys = $request->user()->apiKeys()
            ->whereNull('revoked_at')
            ->latest('id')
            ->get();

        // Webhook deliveries are scoped to the user via an indexed user_id
        // column (set when the event is recorded) — fast and bounded.
        $webhookEvents = $request->user()->webhookEvents()
            ->latest('id')
            ->limit(20)
            ->get();

        $txnTotal = $request->user()->transactions()->count();
        $txnSuccess = $request->user()->transactions()->where('status', TransactionStatus::Success)->count();

        $endpoint = $request->user()->webhookEndpointOrCreate();

        return Inertia::render('developers', [
            'apiKeys' => ApiKeyResource::collection($apiKeys),
            'webhookEvents' => WebhookEventResource::collection($webhookEvents),
            'webhook' => [
                'url' => $endpoint->url,
                'secret' => $endpoint->secret,
                'events' => $endpoint->events,
                'availableEvents' => WebhookEndpoint::AVAILABLE_EVENTS,
            ],
            'stats' => [
                'apiKeys' => $apiKeys->count(),
                'webhookEvents' => $request->user()->webhookEvents()->count(),
                'successRate' => $txnTotal > 0 ? round($txnSuccess / $txnTotal * 100, 1) : 100.0,
                'rateLimit' => '30 / min',
            ],
        ]);
    }

    /**
     * Save the webhook destination URL and event subscriptions.
     */
    public function updateWebhook(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'url' => ['nullable', 'url', 'max:255'],
            'events' => ['array'],
            'events.*' => [Rule::in(WebhookEndpoint::AVAILABLE_EVENTS)],
        ]);

        $request->user()->webhookEndpointOrCreate()->update([
            'url' => $validated['url'] ?? null,
            'events' => array_values($validated['events'] ?? []),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Webhook settings saved.']);
    }

    /**
     * Roll the HMAC signing secret. The old secret stops validating immediately.
     */
    public function rotateWebhookSecret(Request $request): RedirectResponse
    {
        $request->user()->webhookEndpointOrCreate()->update([
            'secret' => WebhookEndpoint::generateSecret(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Signing secret rotated.']);
    }

    public function store(StoreApiKeyRequest $request): RedirectResponse
    {
        $environment = $request->validated('environment', 'live');
        $secret = ApiKey::generateSecret($environment);

        $request->user()->apiKeys()->create([
            'name' => $request->validated('name'),
            'environment' => $environment,
            'prefix' => substr($secret, 0, ApiKey::PREFIX_LENGTH),
            'key_hash' => ApiKey::hashSecret($secret),
        ]);

        // Surface the plaintext exactly once so the page can reveal/copy it; it
        // is never persisted (only its sha256 hash is stored).
        Inertia::flash('newKey', $secret);

        return back();
    }

    public function destroy(Request $request, ApiKey $apiKey): RedirectResponse
    {
        abort_unless($apiKey->user_id === $request->user()->id, 403);

        $apiKey->update(['revoked_at' => now()]);

        return back();
    }

    /**
     * Send a real, signed `transaction.success` test event to the configured
     * endpoint so the developer can verify their integration end to end. The
     * attempt (delivered or failed) lands in their deliveries feed.
     */
    public function sendTestEvent(Request $request): RedirectResponse
    {
        $endpoint = $request->user()->webhookEndpointOrCreate();

        if (! $endpoint->isDeliverable()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Add an endpoint URL first so we have somewhere to send the test event.',
            ]);
        }

        $reference = $request->user()->transactions()->latest('id')->value('reference') ?? 'TXN-TEST';

        DeliverWebhookJob::dispatch($request->user()->id, (string) $endpoint->url, $endpoint->secret, 'transaction.success', [
            'reference' => $reference,
            'status' => 'success',
            'amount_usd' => Money::toDecimal(1000),
            'test' => true,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Test event sent to your endpoint.']);
    }
}
