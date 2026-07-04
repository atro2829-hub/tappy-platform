<?php

use App\Enums\TransactionStatus;
use App\Jobs\ProcessTopUpJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\TopUpPurchaseInput;
use App\Services\TopUpService;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    $this->user = User::factory()->create();
    Wallet::factory()->funded(20000000)->create(['user_id' => $this->user->id]);
});

function buyTopup(User $user, int $amountUsdMinor): Transaction
{
    return app(TopUpService::class)->purchase($user, new TopUpPurchaseInput(
        countryIso: 'NG',
        recipientPhone: '+2348035550142',
        amountUsdMinor: $amountUsdMinor,
        operatorId: '341',
        operatorName: 'MTN Nigeria',
    ));
}

it('holds a high-value top-up for review instead of delivering it', function () {
    Bus::fake();

    // $600 is above the default $500 threshold.
    $txn = buyTopup($this->user, 60000);

    expect($txn->status)->toBe(TransactionStatus::Review);
    Bus::assertNotDispatched(ProcessTopUpJob::class);
});

it('delivers a normal-value top-up immediately', function () {
    Bus::fake();

    $txn = buyTopup($this->user, 5000); // $50

    expect($txn->status)->toBe(TransactionStatus::Processing);
    Bus::assertDispatched(ProcessTopUpJob::class);
});

it('lets an admin approve a held transaction, queuing delivery', function () {
    Bus::fake();
    $txn = buyTopup($this->user, 60000);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->patch(route('admin.risk.approve', $txn))->assertRedirect();

    Bus::assertDispatched(ProcessTopUpJob::class);
});

it('lets an admin reject a held transaction, refunding the customer', function () {
    $txn = buyTopup($this->user, 60000);
    $balanceWhileHeld = $this->user->wallet->fresh()->balance_minor;

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->patch(route('admin.risk.reject', $txn))->assertRedirect();

    expect($txn->fresh()->status)->toBe(TransactionStatus::Refunded)
        ->and($this->user->wallet->fresh()->balance_minor)->toBe($balanceWhileHeld + $txn->fresh()->totalChargeMinor());
});

it('surfaces held transactions to the admin risk page', function () {
    buyTopup($this->user, 60000);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertInertia(fn ($page) => $page->has('holds', 1)->where('stats.held', 1));
});

it('forbids non-admins from approving or rejecting holds', function () {
    $txn = buyTopup($this->user, 60000);
    $other = User::factory()->reseller()->create();

    $this->actingAs($other)->patch(route('admin.risk.approve', $txn))->assertForbidden();
    $this->actingAs($other)->patch(route('admin.risk.reject', $txn))->assertForbidden();
});
