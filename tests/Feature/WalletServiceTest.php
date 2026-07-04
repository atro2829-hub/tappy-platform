<?php

use App\Enums\LedgerReason;
use App\Exceptions\InsufficientFundsException;
use App\Models\LedgerEntry;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;

beforeEach(function () {
    $this->wallets = app(WalletService::class);
});

it('credits a wallet and records a ledger entry with the new balance', function () {
    $wallet = Wallet::factory()->create(['balance_minor' => 0]);

    $entry = $this->wallets->credit($wallet, 5000, LedgerReason::Funding);

    expect($wallet->fresh()->balance_minor)->toBe(5000)
        ->and($entry->direction->value)->toBe('credit')
        ->and($entry->amount_minor)->toBe(5000)
        ->and($entry->balance_after_minor)->toBe(5000)
        ->and($wallet->ledgerEntries()->count())->toBe(1);
});

it('debits a wallet', function () {
    $wallet = Wallet::factory()->funded(5000)->create();

    $entry = $this->wallets->debit($wallet, 2000, LedgerReason::Purchase);

    expect($wallet->fresh()->balance_minor)->toBe(3000)
        ->and($entry->direction->value)->toBe('debit')
        ->and($entry->balance_after_minor)->toBe(3000);
});

it('refuses to overdraw and leaves the balance and ledger untouched', function () {
    $wallet = Wallet::factory()->funded(1000)->create();

    expect(fn () => $this->wallets->debit($wallet, 2000, LedgerReason::Purchase))
        ->toThrow(InsufficientFundsException::class);

    expect($wallet->fresh()->balance_minor)->toBe(1000)
        ->and($wallet->ledgerEntries()->count())->toBe(0);
});

it('applies an idempotent credit only once', function () {
    $wallet = Wallet::factory()->create(['balance_minor' => 0]);

    $first = $this->wallets->credit($wallet, 5000, LedgerReason::Funding, ['idempotencyKey' => 'fund-1']);
    $second = $this->wallets->credit($wallet, 5000, LedgerReason::Funding, ['idempotencyKey' => 'fund-1']);

    expect($second->id)->toBe($first->id)
        ->and($wallet->fresh()->balance_minor)->toBe(5000)
        ->and(LedgerEntry::count())->toBe(1);
});

it('refunds funds back to a wallet', function () {
    $wallet = Wallet::factory()->funded(3000)->create();

    $this->wallets->refund($wallet, 2000, ['description' => 'Top-up failed']);

    $entry = $wallet->ledgerEntries()->latest('id')->first();

    expect($wallet->fresh()->balance_minor)->toBe(5000)
        ->and($entry->reason->value)->toBe('refund');
});

it('rejects non-positive amounts', function () {
    $wallet = Wallet::factory()->create();

    expect(fn () => $this->wallets->credit($wallet, 0, LedgerReason::Funding))
        ->toThrow(InvalidArgumentException::class);
});

it('returns a single wallet per user via forUser', function () {
    $user = User::factory()->create();

    $a = $this->wallets->forUser($user);
    $b = $this->wallets->forUser($user);

    expect($a->id)->toBe($b->id)
        ->and(Wallet::where('user_id', $user->id)->count())->toBe(1);
});
