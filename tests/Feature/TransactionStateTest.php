<?php

use App\Enums\TransactionStatus;
use App\Exceptions\InvalidTransactionStatusException;
use App\Models\Transaction;

it('walks the happy path pending -> processing -> success and stamps processed_at', function () {
    $txn = Transaction::factory()->create(['status' => TransactionStatus::Pending]);

    $txn->markProcessing('prov-123');
    expect($txn->status)->toBe(TransactionStatus::Processing)
        ->and($txn->provider_transaction_id)->toBe('prov-123')
        ->and($txn->processed_at)->toBeNull();

    $txn->markSuccess('prov-123', 'SUCCESSFUL');
    expect($txn->fresh()->status)->toBe(TransactionStatus::Success)
        ->and($txn->fresh()->provider_status)->toBe('SUCCESSFUL')
        ->and($txn->fresh()->processed_at)->not->toBeNull();
});

it('refunds a failed transaction', function () {
    $txn = Transaction::factory()->processing()->create();

    $txn->markFailed('FAILED');
    expect($txn->status)->toBe(TransactionStatus::Failed);

    $txn->markRefunded();
    expect($txn->fresh()->status)->toBe(TransactionStatus::Refunded);
});

it('rejects an illegal transition', function () {
    $txn = Transaction::factory()->create(['status' => TransactionStatus::Refunded]);

    expect(fn () => $txn->markSuccess())
        ->toThrow(InvalidTransactionStatusException::class);
});

it('treats a self-transition as a harmless no-op', function () {
    $txn = Transaction::factory()->success()->create();

    $txn->transitionTo(TransactionStatus::Success);

    expect($txn->status)->toBe(TransactionStatus::Success);
});

it('reports legal next steps via canTransitionTo', function () {
    $txn = Transaction::factory()->create(['status' => TransactionStatus::Pending]);

    expect($txn->canTransitionTo(TransactionStatus::Processing))->toBeTrue()
        ->and($txn->canTransitionTo(TransactionStatus::Refunded))->toBeFalse();
});

it('computes the total charge as value plus fee', function () {
    $txn = Transaction::factory()->create(['amount_usd_minor' => 480, 'fee_minor' => 20]);

    expect($txn->totalChargeMinor())->toBe(500);
});
