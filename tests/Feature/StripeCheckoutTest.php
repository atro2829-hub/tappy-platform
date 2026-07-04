<?php

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    config(['services.stripe.secret' => 'sk_test_x']);
});

it('starts a checkout session and redirects to Stripe', function () {
    Http::fake([
        'api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_test_123',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_123',
        ]),
    ]);

    $this->actingAs($this->user)->post(route('wallet.checkout'), ['amount' => 50])
        ->assertRedirect('https://checkout.stripe.com/c/pay/cs_test_123');

    expect(Payment::query()
        ->where('user_id', $this->user->id)
        ->where('reference', 'cs_test_123')
        ->where('status', 'pending')
        ->where('amount_minor', 5000)
        ->exists())->toBeTrue();
});

it('credits the wallet when returning from a paid session', function () {
    Payment::query()->create([
        'user_id' => $this->user->id, 'amount_minor' => 5000, 'currency' => 'USD',
        'gateway' => 'stripe', 'reference' => 'cs_test_paid', 'status' => 'pending',
    ]);

    Http::fake([
        'api.stripe.com/v1/checkout/sessions/cs_test_paid' => Http::response([
            'id' => 'cs_test_paid', 'payment_status' => 'paid',
        ]),
    ]);

    $this->actingAs($this->user)->get(route('wallet', ['session_id' => 'cs_test_paid']))->assertOk();

    expect(Payment::query()->first()->status)->toBe('succeeded')
        ->and($this->user->wallet()->first()->balance_minor)->toBe(5000);
});

it('does not double-credit on a repeat return', function () {
    Payment::query()->create([
        'user_id' => $this->user->id, 'amount_minor' => 5000, 'currency' => 'USD',
        'gateway' => 'stripe', 'reference' => 'cs_dbl', 'status' => 'pending',
    ]);
    Http::fake([
        'api.stripe.com/v1/checkout/sessions/cs_dbl' => Http::response(['id' => 'cs_dbl', 'payment_status' => 'paid']),
    ]);

    $this->actingAs($this->user)->get(route('wallet', ['session_id' => 'cs_dbl']));
    $this->actingAs($this->user)->get(route('wallet', ['session_id' => 'cs_dbl']));

    expect($this->user->wallet()->first()->balance_minor)->toBe(5000);
});

it('credits via the webhook on checkout.session.completed', function () {
    Payment::query()->create([
        'user_id' => $this->user->id, 'amount_minor' => 7000, 'currency' => 'USD',
        'gateway' => 'stripe', 'reference' => 'cs_hook', 'status' => 'pending',
    ]);
    config(['services.stripe.webhook_secret' => null]);
    Http::fake([
        'api.stripe.com/v1/checkout/sessions/cs_hook' => Http::response(['id' => 'cs_hook', 'payment_status' => 'paid']),
    ]);

    $this->postJson(route('webhooks.stripe'), [
        'type' => 'checkout.session.completed',
        'data' => ['object' => ['id' => 'cs_hook']],
    ])->assertOk();

    expect($this->user->wallet()->first()->balance_minor)->toBe(7000);
});

it('rejects a webhook with a bad signature when a secret is configured', function () {
    config(['services.stripe.webhook_secret' => 'whsec_x']);

    $this->call('POST', route('webhooks.stripe'), [], [], [], ['HTTP_STRIPE-SIGNATURE' => 't=1,v1=bad'], '{"type":"checkout.session.completed"}')
        ->assertStatus(400);
});
