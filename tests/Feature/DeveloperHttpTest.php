<?php

use App\Models\ApiKey;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Http;
use Inertia\Support\SessionKey;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('renders the developers page with only the user\'s active keys and own webhook events', function () {
    ApiKey::factory()->count(2)->create(['user_id' => $this->user->id]);
    ApiKey::factory()->revoked()->create(['user_id' => $this->user->id]);
    ApiKey::factory()->create(); // another user's key

    // Two webhook deliveries for THIS user, one for someone else.
    WebhookEvent::factory()->count(2)->create(['user_id' => $this->user->id]);
    WebhookEvent::factory()->create(); // another user's (null/other) delivery

    $this->actingAs($this->user)->get(route('developers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('developers')
            ->has('apiKeys', 2)
            ->has('webhookEvents', 2)
            ->where('stats.webhookEvents', 2));
});

it('generates a key, returns the usable plaintext once, and stores only the hash', function () {
    $response = $this->actingAs($this->user)
        ->post(route('developers.keys.store'), ['name' => 'Production server'])
        ->assertRedirect();

    $key = ApiKey::query()->where('user_id', $this->user->id)->sole();

    expect($key->name)->toBe('Production server')
        ->and($key->prefix)->toStartWith('sk_live_');

    // The plaintext is flashed exactly once (Inertia v3 flash) for the UI to reveal/copy.
    $plain = $response->getSession()->get(SessionKey::FLASH_DATA)['newKey'] ?? null;

    expect($plain)->toBeString()
        ->and($plain)->toStartWith('sk_live_')
        // The stored hash matches the plaintext, and the plaintext is never persisted.
        ->and($key->key_hash)->toBe(hash('sha256', $plain))
        ->and($key->key_hash)->not->toBe($plain)
        ->and($key->getAttributes())->not->toContain($plain)
        ->and($key->prefix)->toBe(substr($plain, 0, ApiKey::PREFIX_LENGTH));
});

it('validates the api key store request', function () {
    $this->actingAs($this->user)->post(route('developers.keys.store'), ['name' => ''])
        ->assertSessionHasErrors(['name']);
});

it('creates a sandbox key with an sk_test_ prefix', function () {
    $response = $this->actingAs($this->user)
        ->post(route('developers.keys.store'), ['name' => 'Sandbox key', 'environment' => 'sandbox'])
        ->assertRedirect();

    $key = ApiKey::query()->where('user_id', $this->user->id)->sole();

    expect($key->environment)->toBe('sandbox')
        ->and($key->prefix)->toStartWith('sk_test_');

    $plain = $response->getSession()->get(SessionKey::FLASH_DATA)['newKey'] ?? null;
    expect($plain)->toStartWith('sk_test_');
});

it('rejects an invalid environment', function () {
    $this->actingAs($this->user)
        ->post(route('developers.keys.store'), ['name' => 'X', 'environment' => 'wizard'])
        ->assertSessionHasErrors(['environment']);
});

it('revokes a key without deleting the row', function () {
    $key = ApiKey::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->delete(route('developers.keys.destroy', $key))
        ->assertRedirect();

    expect($key->fresh()->revoked_at)->not->toBeNull()
        ->and(ApiKey::query()->find($key->id))->not->toBeNull();
});

it('forbids revoking another user\'s key', function () {
    $key = ApiKey::factory()->create();

    $this->actingAs($this->user)->delete(route('developers.keys.destroy', $key))
        ->assertForbidden();

    expect($key->fresh()->revoked_at)->toBeNull();
});

it('sends a signed test webhook event referencing the user\'s latest transaction', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    $this->user->webhookEndpoint()->create([
        'url' => 'https://hook.test/in',
        'secret' => 'whsec_test',
        'events' => WebhookEndpoint::AVAILABLE_EVENTS,
    ]);
    $txn = Transaction::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->post(route('developers.test-event'))->assertRedirect();

    $event = WebhookEvent::query()->latest('id')->first();

    expect($event)->not->toBeNull()
        ->and($event->event)->toBe('transaction.success')
        ->and($event->status)->toBe('delivered')
        ->and($event->payload['reference'])->toBe($txn->reference)
        ->and($event->payload['test'])->toBeTrue();
});

it('will not send a test event without a configured endpoint url', function () {
    $this->actingAs($this->user)->post(route('developers.test-event'))
        ->assertSessionHas('toast.type', 'error');

    expect(WebhookEvent::count())->toBe(0);
});

it('requires authentication', function () {
    $this->get(route('developers'))->assertRedirect(route('login'));
    $this->post(route('developers.keys.store'), ['name' => 'X'])->assertRedirect(route('login'));
});
