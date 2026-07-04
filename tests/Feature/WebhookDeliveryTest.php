<?php

use App\Enums\LedgerReason;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookEvent;
use App\Services\Providers\Data\TopUpResult;
use App\Services\SettlementService;
use App\Services\WalletService;
use App\Services\WebhookDispatcher;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

/**
 * @param  list<string>  $events
 */
function configureWebhook(User $user, array $events = WebhookEndpoint::AVAILABLE_EVENTS, ?string $url = 'https://hook.test/in'): WebhookEndpoint
{
    return $user->webhookEndpoint()->create([
        'url' => $url,
        'secret' => 'whsec_testsecret',
        'events' => $events,
    ]);
}

it('exposes the webhook endpoint config to the developer page', function () {
    $this->actingAs($this->user)->get(route('developers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('webhook.secret')
            ->has('webhook.availableEvents', 6)
            ->where('webhook.url', null));
});

it('saves the webhook url and event subscriptions', function () {
    $this->actingAs($this->user)->post(route('developers.webhook.update'), [
        'url' => 'https://hook.test/in',
        'events' => ['transaction.success', 'transaction.failed'],
    ])->assertRedirect();

    $endpoint = $this->user->webhookEndpoint;
    expect($endpoint->url)->toBe('https://hook.test/in')
        ->and($endpoint->events)->toBe(['transaction.success', 'transaction.failed']);
});

it('rejects unknown webhook events', function () {
    $this->actingAs($this->user)->post(route('developers.webhook.update'), [
        'events' => ['transaction.success', 'bogus.event'],
    ])->assertSessionHasErrors('events.1');
});

it('rotates the signing secret', function () {
    $original = $this->user->webhookEndpointOrCreate()->secret;

    $this->actingAs($this->user)->post(route('developers.webhook.rotate'))->assertRedirect();

    expect($this->user->webhookEndpoint->fresh()->secret)
        ->not->toBe($original)
        ->toStartWith('whsec_');
});

it('signs the delivered payload with the endpoint secret', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    configureWebhook($this->user);

    $txn = Transaction::factory()->success()->create(['user_id' => $this->user->id]);

    app(WebhookDispatcher::class)->transaction($txn);

    Http::assertSent(function ($request) {
        $expected = 'sha256='.hash_hmac('sha256', $request->body(), 'whsec_testsecret');
        $body = json_decode($request->body(), true);

        return $request->url() === 'https://hook.test/in'
            && ($request->header('X-Tappy-Signature')[0] ?? '') === $expected
            && $body['event'] === 'transaction.success';
    });

    expect(WebhookEvent::query()
        ->where('user_id', $this->user->id)
        ->where('event', 'transaction.success')
        ->where('status', 'delivered')
        ->exists())->toBeTrue();
});

it('also emits giftcard.delivered for a successful gift card', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    configureWebhook($this->user);

    $txn = Transaction::factory()->success()->create([
        'user_id' => $this->user->id,
        'type' => TransactionType::GiftCard,
    ]);

    app(WebhookDispatcher::class)->transaction($txn);

    expect(WebhookEvent::query()
        ->where('user_id', $this->user->id)
        ->where('event', 'giftcard.delivered')
        ->exists())->toBeTrue();
});

it('does not deliver events the endpoint is not subscribed to', function () {
    Http::fake();
    configureWebhook($this->user, events: ['transaction.failed']);

    $txn = Transaction::factory()->success()->create(['user_id' => $this->user->id]);

    app(WebhookDispatcher::class)->transaction($txn);

    Http::assertNothingSent();
});

it('does not deliver when no endpoint url is configured', function () {
    Http::fake();
    $this->user->webhookEndpointOrCreate();

    $txn = Transaction::factory()->success()->create(['user_id' => $this->user->id]);

    app(WebhookDispatcher::class)->transaction($txn);

    Http::assertNothingSent();
});

it('emits a webhook event when a transaction settles', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    configureWebhook($this->user);

    $txn = Transaction::factory()->processing()->create(['user_id' => $this->user->id]);

    app(SettlementService::class)->settle($txn, new TopUpResult(TransactionStatus::Processing, 'PT-2', 'PROCESSING'));

    expect(WebhookEvent::query()
        ->where('user_id', $this->user->id)
        ->where('event', 'transaction.pending')
        ->where('status', 'delivered')
        ->exists())->toBeTrue();
});

it('fires a low-balance webhook when a debit crosses the threshold', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    configureWebhook($this->user);

    $wallet = app(WalletService::class)->forUser($this->user);
    $wallet->update(['balance_minor' => 5000, 'auto_reload_threshold_minor' => 2000]);

    app(WalletService::class)->debit($wallet, 4000, LedgerReason::Purchase);

    expect(WebhookEvent::query()
        ->where('user_id', $this->user->id)
        ->where('event', 'wallet.low_balance')
        ->exists())->toBeTrue();
});

it('requires an endpoint url before sending a test event', function () {
    $this->user->webhookEndpointOrCreate();

    $this->actingAs($this->user)->post(route('developers.test-event'))
        ->assertSessionHas('toast.type', 'error');
});

it('delivers a signed test event to the configured endpoint', function () {
    Http::fake(['hook.test/*' => Http::response('', 200)]);
    configureWebhook($this->user);

    $this->actingAs($this->user)->post(route('developers.test-event'))
        ->assertSessionHas('toast.type', 'success');

    Http::assertSent(fn ($request) => $request->url() === 'https://hook.test/in');

    expect(WebhookEvent::query()
        ->where('user_id', $this->user->id)
        ->where('event', 'transaction.success')
        ->exists())->toBeTrue();
});
