<?php

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Jobs\ProcessTopUpJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\TopUpPurchaseInput;
use App\Services\TopUpService;
use Illuminate\Support\Facades\Queue;

function purchaseInput(array $overrides = []): TopUpPurchaseInput
{
    return new TopUpPurchaseInput(
        countryIso: $overrides['countryIso'] ?? 'NG',
        recipientPhone: $overrides['recipientPhone'] ?? '+2348012345678',
        amountUsdMinor: $overrides['amountUsdMinor'] ?? 500,
        operatorId: $overrides['operatorId'] ?? '341',
        operatorName: $overrides['operatorName'] ?? 'MTN Nigeria',
        type: $overrides['type'] ?? TransactionType::Airtime,
        idempotencyKey: $overrides['idempotencyKey'] ?? null,
    );
}

beforeEach(function () {
    $this->service = app(TopUpService::class);
    $this->user = User::factory()->create();
    // Fund the wallet with $1,000.00.
    $this->wallet = Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);
});

it('computes the net processing fee (1.5% + 20)', function () {
    expect($this->service->computeFeeMinor(1000))->toBe(35);
});

it('completes a successful top-up and captures funds', function () {
    // fee = round(500 * 0.015) + 20 = 8 + 20 = 28; total = 528
    $txn = $this->service->purchase($this->user, purchaseInput(['amountUsdMinor' => 500]));

    expect($txn->fresh()->status)->toBe(TransactionStatus::Success)
        ->and($txn->fresh()->fee_minor)->toBe(28)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100000 - 528)
        ->and($txn->fresh()->provider_transaction_id)->toStartWith('FAKE-');
});

it('refunds the wallet in full when the provider fails', function () {
    $txn = $this->service->purchase($this->user, purchaseInput([
        'recipientPhone' => '+23480120000', // ends 0000 -> fake driver fails
        'amountUsdMinor' => 500,
    ]));

    expect($txn->fresh()->status)->toBe(TransactionStatus::Failed)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100000) // made whole
        ->and($txn->ledgerEntries()->count())->toBe(2); // purchase debit + refund credit
});

it('leaves an async top-up in processing without refunding', function () {
    $txn = $this->service->purchase($this->user, purchaseInput([
        'recipientPhone' => '+23480129999', // ends 9999 -> fake driver returns processing
        'amountUsdMinor' => 500,
    ]));

    expect($txn->fresh()->status)->toBe(TransactionStatus::Processing)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100000 - 528)
        ->and($txn->fresh()->provider_transaction_id)->toStartWith('FAKE-');
});

it('refuses a purchase the wallet cannot afford and persists nothing', function () {
    $this->wallet->update(['balance_minor' => 100]); // $1.00

    expect(fn () => $this->service->purchase($this->user, purchaseInput(['amountUsdMinor' => 500])))
        ->toThrow(InsufficientFundsException::class);

    expect(Transaction::count())->toBe(0)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100);
});

it('is idempotent for a repeated purchase', function () {
    $first = $this->service->purchase($this->user, purchaseInput(['idempotencyKey' => 'buy-1']));
    $second = $this->service->purchase($this->user, purchaseInput(['idempotencyKey' => 'buy-1']));

    expect($second->id)->toBe($first->id)
        ->and(Transaction::count())->toBe(1);
});

it('queues delivery as a job', function () {
    Queue::fake();

    $txn = $this->service->purchase($this->user, purchaseInput());

    Queue::assertPushed(ProcessTopUpJob::class, fn ($job) => $job->transactionId === $txn->id);
    expect($txn->fresh()->status)->toBe(TransactionStatus::Processing);
});
