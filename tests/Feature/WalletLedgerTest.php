<?php

use App\Enums\LedgerReason;
use App\Models\User;
use App\Services\WalletService;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = app(WalletService::class)->forUser($this->user);
});

function seedLedger(int $credits, int $refunds = 0): void
{
    $wallets = app(WalletService::class);
    $wallet = test()->wallet;

    for ($i = 0; $i < $credits; $i++) {
        $wallets->credit($wallet, 1000, LedgerReason::Funding, [
            'idempotencyKey' => "seed-credit-{$i}",
        ]);
    }

    for ($i = 0; $i < $refunds; $i++) {
        $wallets->credit($wallet, 500, LedgerReason::Refund, [
            'idempotencyKey' => "seed-refund-{$i}",
        ]);
    }
}

it('paginates the wallet ledger server-side with a true total', function () {
    seedLedger(20);

    $this->actingAs($this->user)->get(route('wallet'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('wallet')
            ->has('ledger', 15)
            ->where('ledgerPagination.total', 20)
            ->where('ledgerPagination.lastPage', 2));
});

it('filters the ledger by reason server-side', function () {
    seedLedger(5, 3);

    $this->actingAs($this->user)->get(route('wallet', ['reason' => 'refund']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('ledgerFilter', 'refund')
            ->where('ledgerPagination.total', 3));
});

it('returns the requested ledger page', function () {
    seedLedger(20);

    $this->actingAs($this->user)->get(route('wallet', ['ledgerPage' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('ledgerPagination.currentPage', 2)
            ->has('ledger', 5));
});
