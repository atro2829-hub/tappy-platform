<?php

use App\Models\AiActivity;
use App\Models\Recipient;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Ai\Contracts\LlmProvider;
use Inertia\Testing\AssertableInertia as Assert;

it('drafts a real top-up action from a natural request', function () {
    $user = User::factory()->create();
    Recipient::factory()->create([
        'user_id' => $user->id, 'name' => 'Mum', 'country' => 'NG',
        'recipient' => '+2348035550142', 'rel' => ['mum', 'mother'],
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'recharge mum 5 dollars'])
        ->assertOk()
        ->json();

    expect($response['intent'])->toBe('topup')
        ->and($response['action'])->not->toBeNull()
        ->and($response['action']['type'])->toBe('topup')
        ->and($response['action']['recipientNumber'])->toBe('+2348035550142')
        ->and($response['action']['usd'])->toEqual(5.0);
});

it('infers the country from the currency for an unsaved number', function () {
    // No saved recipient + a ৳ amount must resolve to Bangladesh, not default
    // to "US" (which a live provider would reject, killing the draft).
    $user = User::factory()->create();

    $action = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'recharge 01712345678 with 500 taka'])
        ->assertOk()
        ->json('action');

    expect($action)->not->toBeNull()
        ->and($action['type'])->toBe('topup')
        ->and($action['country'])->toBe('BD');
});

it('answers the wallet balance with real data', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(50000)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => "what's my wallet balance"])
        ->json();

    expect($response['intent'])->toBe('balance')
        ->and($response['reply'])->toContain('500.00');
});

function draftTopupAction(User $user): array
{
    Recipient::factory()->create([
        'user_id' => $user->id, 'name' => 'Mum', 'country' => 'NG',
        'recipient' => '+2348035550142', 'rel' => ['mum', 'mother'],
    ]);

    return test()->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'recharge mum 5 dollars'])
        ->json('action');
}

it('executes a confirmed top-up as a real transaction', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $action = draftTopupAction($user);

    $response = $this->actingAs($user)
        ->postJson(route('copilot.execute'), ['action' => $action])
        ->assertOk()
        ->json();

    expect($response['reference'])->toStartWith('TXN-')
        ->and(Transaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('ignores client-tampered amounts and charges only the server-side draft', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $action = draftTopupAction($user);
    $action['usd'] = 999.0; // attacker bumps the amount client-side

    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => $action])->assertOk();

    // The real charge reflects the $5 draft, not the tampered $999.
    $txn = Transaction::query()->where('user_id', $user->id)->sole();
    expect($txn->amount_usd_minor)->toBe(500);
});

it('does not double-charge when the same draft is executed twice', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $action = draftTopupAction($user);

    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => $action])->assertOk();
    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => $action])->assertOk();

    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('rejects an execute with no matching server-side draft', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->postJson(route('copilot.execute'), ['action' => ['type' => 'topup', 'activityId' => 999999, 'usd' => 5.0]])
        ->assertStatus(422);

    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(0);
});

it('cannot execute another user\'s draft', function () {
    $owner = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $owner->id]);
    $action = draftTopupAction($owner);

    $attacker = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $attacker->id]);

    $this->actingAs($attacker)
        ->postJson(route('copilot.execute'), ['action' => $action])
        ->assertStatus(422);

    expect(Transaction::query()->where('user_id', $attacker->id)->count())->toBe(0);
});

it('drafts and executes a gift card as a real transaction', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $action = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'buy a $25 Amazon gift card'])
        ->assertOk()
        ->json('action');

    expect($action['type'])->toBe('giftcard')
        ->and($action['brand'])->toBe('Amazon')
        ->and($action['denom'])->toEqual(25.0);

    $response = $this->actingAs($user)
        ->postJson(route('copilot.execute'), ['action' => $action])
        ->assertOk()
        ->json();

    expect($response['reference'])->toStartWith('TXN-');
    $txn = Transaction::query()->where('user_id', $user->id)->sole();
    expect($txn->type->value)->toBe('giftcard')
        ->and($txn->amount_usd_minor)->toBe(2500);
});

it('snaps a gift card amount to the nearest available denomination', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    // Amazon offers 10/25/50/100 — $30 snaps to $25.
    $action = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'get me a $30 amazon card'])
        ->json('action');

    expect($action['denom'])->toEqual(25.0);
});

it('does not double-charge a confirmed gift card', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $action = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'buy a $25 Amazon gift card'])
        ->json('action');

    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => $action])->assertOk();
    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => $action])->assertOk();

    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('logs each copilot turn to AI activity', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('copilot.ask'), ['message' => 'hello'])->assertOk();

    expect(AiActivity::query()->where('user_id', $user->id)->exists())->toBeTrue();
});

it('shows only the user\'s AI activity', function () {
    $user = User::factory()->create();
    AiActivity::factory()->count(3)->create(['user_id' => $user->id]);
    AiActivity::factory()->create();

    $this->actingAs($user)->get(route('ai-activity'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('ai-activity')->has('activity', 3)->has('stats'));
});

it('requires authentication', function () {
    $this->post(route('copilot.ask'), ['message' => 'hi'])->assertRedirect(route('login'));
});

it('falls back to the built-in engine when the configured provider returns nothing', function () {
    // Simulate a misconfigured/failing real provider (e.g. a rejected key) that
    // returns an empty string for every call.
    app()->instance(LlmProvider::class, new class implements LlmProvider
    {
        public function complete(string $system, array $messages): string
        {
            return '';
        }
    });

    $user = User::factory()->create();
    Recipient::factory()->create([
        'user_id' => $user->id, 'name' => 'Mum', 'country' => 'NG',
        'recipient' => '+2348035550142', 'rel' => ['mum', 'mother'],
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('copilot.ask'), ['message' => 'recharge mum 5 dollars'])
        ->assertOk()
        ->json();

    // Despite the dead provider, the deterministic engine still drafts the top-up.
    expect($response['intent'])->toBe('topup')
        ->and($response['action'])->not->toBeNull()
        ->and($response['action']['recipientNumber'])->toBe('+2348035550142');
});

it('streams the reply and draft over Server-Sent Events', function () {
    $user = User::factory()->create();
    Recipient::factory()->create([
        'user_id' => $user->id, 'name' => 'Mum', 'country' => 'NG',
        'recipient' => '+2348035550142', 'rel' => ['mum', 'mother'],
    ]);
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('copilot.stream'), ['message' => 'recharge mum 5 dollars']);

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/event-stream');

    $body = $response->streamedContent();
    expect($body)->toContain('event: chunk')
        ->toContain('event: action')
        ->toContain('event: done')
        ->toContain('"type":"topup"');

    // Streaming still logs the turn, exactly like ask().
    expect(AiActivity::query()->where('user_id', $user->id)->where('intent', 'topup')->exists())->toBeTrue();
});

it('sends prior conversation turns to the LLM for multi-turn context', function () {
    // Record what the provider receives so we can assert prior turns are sent.
    $recorder = new class implements LlmProvider
    {
        /** @var list<array<int, array{role: string, content: string}>> */
        public array $calls = [];

        public function complete(string $system, array $messages): string
        {
            $this->calls[] = $messages;

            return (string) json_encode(['intent' => 'chat', 'reply' => 'ok']);
        }
    };
    app()->instance(LlmProvider::class, $recorder);

    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('copilot.ask'), ['message' => 'first question'])->assertOk();
    $this->actingAs($user)->postJson(route('copilot.ask'), ['message' => 'follow up'])->assertOk();

    // The first call only carries its own user turn; the second replays the
    // first turn (user prompt + assistant reply) before the new message.
    expect($recorder->calls[0])->toHaveCount(1)
        ->and($recorder->calls[1])->toHaveCount(3)
        ->and($recorder->calls[1][0])->toBe(['role' => 'user', 'content' => 'first question'])
        ->and($recorder->calls[1][1])->toBe(['role' => 'assistant', 'content' => 'ok'])
        ->and($recorder->calls[1][2])->toBe(['role' => 'user', 'content' => 'follow up']);
});
