<?php

use App\Enums\LedgerReason;
use App\Jobs\ProcessTopUpJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;

beforeEach(function () {
    $this->user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);
});

function processingTransaction(User $user): Transaction
{
    // Mirror a real capture: debit the wallet up-front, leave it processing.
    $txn = Transaction::factory()->processing()->create([
        'user_id' => $user->id,
        'amount_usd_minor' => 1000,
        'fee_minor' => 50,
    ]);

    app(WalletService::class)->debit($user->wallet, 1050, LedgerReason::Purchase, [
        'transactionId' => $txn->id,
        'idempotencyKey' => "txn-{$txn->id}-purchase",
    ]);

    return $txn;
}

it('refunds the wallet when a delivery job fails permanently', function () {
    $txn = processingTransaction($this->user);
    $balanceAfterDebit = $this->user->wallet->fresh()->balance_minor;

    (new ProcessTopUpJob($txn->id))->failed(new RuntimeException('provider down'));

    expect($txn->fresh()->status->value)->toBe('failed')
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($balanceAfterDebit + 1050);
});

it('does nothing when the failed transaction is already terminal', function () {
    $txn = Transaction::factory()->success()->create(['user_id' => $this->user->id]);
    $before = $this->user->wallet->fresh()->balance_minor;

    (new ProcessTopUpJob($txn->id))->failed(new RuntimeException('late failure'));

    expect($txn->fresh()->status->value)->toBe('success')
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($before);
});

it('configures retries and a timeout on the delivery job', function () {
    $job = new ProcessTopUpJob(1);

    expect($job->tries)->toBe(3)
        ->and($job->timeout)->toBe(60)
        ->and($job->backoff())->toBe([10, 30, 60]);
});

it('re-polls a stuck processing transaction and settles it from the provider', function () {
    config(['services.topup.driver' => 'fake']);

    $txn = processingTransaction($this->user);
    $txn->forceFill([
        'created_at' => now()->subHours(3),
        'provider' => 'fake',
        'provider_transaction_id' => 'FAKE-TX-1',
    ])->save();
    $balanceAfterDebit = $this->user->wallet->fresh()->balance_minor;

    $this->artisan('transactions:reconcile')->assertSuccessful();

    // The fake provider reports success on lookup — the order was delivered, so
    // it must be marked success, NOT blindly refunded.
    expect($txn->fresh()->status->value)->toBe('success')
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($balanceAfterDebit);
});

it('refunds a transaction stuck past the hard timeout', function () {
    $txn = processingTransaction($this->user);
    // No provider id to poll, and older than the 24h hard timeout.
    $txn->forceFill(['created_at' => now()->subHours(30)])->save();
    $balanceAfterDebit = $this->user->wallet->fresh()->balance_minor;

    $this->artisan('transactions:reconcile')->assertSuccessful();

    expect($txn->fresh()->status->value)->toBe('failed')
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($balanceAfterDebit + 1050);
});

it('does not refund a processing transaction before the hard timeout', function () {
    config(['services.topup.driver' => 'fake']);

    $txn = processingTransaction($this->user);
    // Provider was switched away (mismatch → not re-pollable) and only 3h old:
    // it must be left to settle, never refunded prematurely.
    $txn->forceFill(['created_at' => now()->subHours(3), 'provider' => 'reloadly'])->save();
    $balanceAfterDebit = $this->user->wallet->fresh()->balance_minor;

    $this->artisan('transactions:reconcile')->assertSuccessful();

    expect($txn->fresh()->status->value)->toBe('processing')
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($balanceAfterDebit);
});

it('leaves a recent processing transaction alone', function () {
    $txn = processingTransaction($this->user);

    $this->artisan('transactions:reconcile')->assertSuccessful();

    expect($txn->fresh()->status->value)->toBe('processing');
});
