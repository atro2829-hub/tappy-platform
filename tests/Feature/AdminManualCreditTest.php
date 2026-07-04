<?php

use App\Models\AuditLog;
use App\Models\LedgerEntry;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('lets an admin manually credit a user wallet', function () {
    $user = User::factory()->reseller()->create();
    Wallet::factory()->funded(5000)->create(['user_id' => $user->id]);

    $this->actingAs($this->admin)->post(route('admin.users.credit', $user), [
        'direction' => 'credit',
        'amount' => 25.50,
        'note' => 'Cash received — receipt #1234',
    ])->assertRedirect();

    $wallet = $user->wallet->fresh();
    expect($wallet->balance_minor)->toBe(5000 + 2550);

    $entry = LedgerEntry::query()->where('wallet_id', $wallet->id)->latest('id')->first();
    expect($entry->reason->value)->toBe('funding')
        ->and($entry->amount_minor)->toBe(2550)
        ->and($entry->meta['manual'] ?? null)->toBeTrue()
        ->and($entry->meta['admin_id'] ?? null)->toBe($this->admin->id);

    expect(AuditLog::query()->where('action', 'wallet.credited')->exists())->toBeTrue();
});

it('creates a wallet on the fly when the user has none', function () {
    $user = User::factory()->business()->create();

    $this->actingAs($this->admin)->post(route('admin.users.credit', $user), [
        'direction' => 'credit',
        'amount' => 10,
        'note' => 'Initial float',
    ])->assertRedirect();

    expect($user->fresh()->wallet->balance_minor)->toBe(1000);
});

it('lets an admin manually debit a user wallet', function () {
    $user = User::factory()->reseller()->create();
    Wallet::factory()->funded(5000)->create(['user_id' => $user->id]);

    $this->actingAs($this->admin)->post(route('admin.users.credit', $user), [
        'direction' => 'debit',
        'amount' => 20,
        'note' => 'Correction of duplicate top-up',
    ])->assertRedirect();

    expect($user->wallet->fresh()->balance_minor)->toBe(3000);

    $entry = LedgerEntry::query()->where('wallet_id', $user->wallet->id)->latest('id')->first();
    expect($entry->reason->value)->toBe('adjustment');
    expect(AuditLog::query()->where('action', 'wallet.debited')->exists())->toBeTrue();
});

it('refuses a debit that would overdraw the wallet', function () {
    $user = User::factory()->reseller()->create();
    Wallet::factory()->funded(1000)->create(['user_id' => $user->id]);

    $this->actingAs($this->admin)->post(route('admin.users.credit', $user), [
        'direction' => 'debit',
        'amount' => 50,
        'note' => 'Too much',
    ])->assertRedirect();

    // Balance untouched and no ledger entry written.
    expect($user->wallet->fresh()->balance_minor)->toBe(1000)
        ->and(LedgerEntry::query()->where('wallet_id', $user->wallet->id)->count())->toBe(0);
});

it('validates the adjustment payload', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->post(route('admin.users.credit', $user), [
        'direction' => 'sideways',
        'amount' => 0,
        'note' => '',
    ])->assertSessionHasErrors(['direction', 'amount', 'note']);
});

it('forbids non-admins from adjusting balances', function () {
    $reseller = User::factory()->reseller()->create();
    $target = User::factory()->create();

    $this->actingAs($reseller)->post(route('admin.users.credit', $target), [
        'direction' => 'credit',
        'amount' => 10,
        'note' => 'Nope',
    ])->assertForbidden();
});
