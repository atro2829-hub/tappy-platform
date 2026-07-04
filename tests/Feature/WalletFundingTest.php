<?php

use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\Contracts\PaymentGateway;

it('captures a payment and credits the wallet when funding', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('wallet.fund'), ['amount' => 50])
        ->assertRedirect(route('wallet'));

    $payment = Payment::query()->where('user_id', $user->id)->first();

    expect($payment)->not->toBeNull()
        ->and($payment->amount_minor)->toBe(5000)
        ->and($payment->status)->toBe('succeeded')
        ->and($payment->gateway)->toBe('fake')
        ->and($user->wallet()->first()->balance_minor)->toBe(5000);
});

it('approves charges through the fake gateway', function () {
    $result = app(PaymentGateway::class)->charge(5000, 'USD');

    expect($result->approved)->toBeTrue()
        ->and($result->reference)->toStartWith('FAKE-PAY-');
});

it('requires authentication to fund', function () {
    $this->post(route('wallet.fund'), ['amount' => 50])->assertRedirect(route('login'));
});
