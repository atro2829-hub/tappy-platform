<?php

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WebhookEvent;

function processingTxn(string $reference): Transaction
{
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);

    return Transaction::factory()->processing()->create([
        'user_id' => $user->id,
        'reference' => $reference,
        'amount_usd_minor' => 500,
        'fee_minor' => 33,
    ]);
}

it('settles a processing transaction to success', function () {
    $txn = processingTxn('TXN-WH-0001');

    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-WH-0001',
        'transactionId' => 9001,
        'status' => 'SUCCESSFUL',
    ])->assertOk()->assertJson(['received' => true]);

    expect($txn->fresh()->status)->toBe(TransactionStatus::Success)
        ->and($txn->fresh()->provider_transaction_id)->toBe('9001');
});

it('refunds the wallet when a processing transaction fails', function () {
    $txn = processingTxn('TXN-WH-0002');
    $wallet = $txn->user->wallet;

    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-WH-0002',
        'transactionId' => 9002,
        'status' => 'FAILED',
    ])->assertOk();

    expect($txn->fresh()->status)->toBe(TransactionStatus::Failed)
        ->and($wallet->fresh()->balance_minor)->toBe(100000 + 533); // refunded in full
});

it('leaves an already-final transaction untouched', function () {
    $user = User::factory()->create();
    $txn = Transaction::factory()->success()->create([
        'user_id' => $user->id,
        'reference' => 'TXN-WH-0003',
    ]);

    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-WH-0003',
        'status' => 'FAILED',
    ])->assertOk();

    expect($txn->fresh()->status)->toBe(TransactionStatus::Success);
});

it('refunds a successful transaction when the provider later reverses it', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    $txn = Transaction::factory()->success()->create([
        'user_id' => $user->id,
        'reference' => 'TXN-WH-REV-1',
        'amount_usd_minor' => 500,
        'fee_minor' => 33,
    ]);

    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-WH-REV-1',
        'status' => 'REFUNDED',
    ])->assertOk();

    expect($txn->fresh()->status)->toBe(TransactionStatus::Refunded)
        ->and($user->wallet->fresh()->balance_minor)->toBe(100000 + 533);
});

it('does not refund twice when a reversal webhook is replayed', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    Transaction::factory()->success()->create([
        'user_id' => $user->id,
        'reference' => 'TXN-WH-REV-2',
        'amount_usd_minor' => 500,
        'fee_minor' => 33,
    ]);

    $payload = ['customIdentifier' => 'TXN-WH-REV-2', 'status' => 'REFUNDED'];
    $this->postJson(route('webhooks.reloadly'), $payload)->assertOk();
    $this->postJson(route('webhooks.reloadly'), $payload)->assertOk();

    expect($user->wallet->fresh()->balance_minor)->toBe(100000 + 533); // single refund only
});

it('acknowledges an unknown transaction without error', function () {
    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-UNKNOWN',
        'status' => 'SUCCESSFUL',
    ])->assertOk()->assertJson(['received' => true]);
});

it('rejects a webhook with a bad signature when a secret is configured', function () {
    config()->set('services.reloadly.webhook_secret', 'shh');

    $this->postJson(route('webhooks.reloadly'), ['status' => 'SUCCESSFUL'], [
        'X-Reloadly-Signature' => 'wrong',
    ])->assertForbidden();
});

it('accepts a webhook with a valid signature', function () {
    config()->set('services.reloadly.webhook_secret', 'shh');

    $payload = ['customIdentifier' => 'TXN-UNKNOWN', 'status' => 'SUCCESSFUL'];
    $signature = hash_hmac('sha256', json_encode($payload), 'shh');

    $this->postJson(route('webhooks.reloadly'), $payload, [
        'X-Reloadly-Signature' => $signature,
    ])->assertOk();
});

it('records a delivered webhook event when a transaction is settled', function () {
    processingTxn('TXN-WH-EVT-1');

    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-WH-EVT-1',
        'transactionId' => 9101,
        'status' => 'SUCCESSFUL',
    ])->assertOk();

    $event = WebhookEvent::query()->sole();

    expect($event->event)->toBe('transaction.success')
        ->and($event->status)->toBe('delivered')
        ->and($event->received_at)->not->toBeNull();
});

it('records an ignored webhook event for an unknown transaction', function () {
    $this->postJson(route('webhooks.reloadly'), [
        'customIdentifier' => 'TXN-UNKNOWN',
        'status' => 'FAILED',
    ])->assertOk();

    $event = WebhookEvent::query()->sole();

    expect($event->event)->toBe('transaction.failed')
        ->and($event->status)->toBe('ignored');
});
