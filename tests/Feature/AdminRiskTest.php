<?php

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Services\RiskFlags;
use Inertia\Testing\AssertableInertia as Assert;

it('excludes resolved flags from the risk count, matching the page', function () {
    Transaction::factory()->create(['amount_usd_minor' => 50000, 'status' => TransactionStatus::Success]);
    Transaction::factory()->create([
        'amount_usd_minor' => 50000,
        'status' => TransactionStatus::Success,
        'risk_resolved_at' => now(),
    ]);

    // The badge/dashboard count and the page's "open" stat must agree: only the
    // unresolved flag counts.
    expect(app(RiskFlags::class)->openCount())->toBe(1);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertInertia(fn (Assert $page) => $page->where('stats.open', 1)->has('flags', 1));
});

it('honors configured rule thresholds in the risk count', function () {
    Transaction::factory()->create(['amount_usd_minor' => 30000, 'status' => TransactionStatus::Success]);

    // $300 is flagged at the default $200 threshold...
    expect(app(RiskFlags::class)->openCount())->toBe(1);

    // ...but not after the admin raises the large-amount threshold to $500.
    app(RiskFlags::class)->saveRules(['largeAmount' => 500, 'highAmount' => 800, 'flagFailed' => true, 'flagRefunded' => true]);

    expect(app(RiskFlags::class)->openCount())->toBe(0);
});

it('flags large and failed transactions for an admin', function () {
    $admin = User::factory()->admin()->create();
    Transaction::factory()->create(['amount_usd_minor' => 60000, 'status' => TransactionStatus::Success]);
    Transaction::factory()->failed()->create();
    Transaction::factory()->create(['amount_usd_minor' => 500, 'status' => TransactionStatus::Success]);

    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/risk')
            ->has('flags', 2)
            ->has('stats.open')
            ->has('stats.blocked'));
});

it('forbids non-admins from risk', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.risk'))->assertForbidden();
});

it('clears (resolves) a flag so it drops off the active list', function () {
    $admin = User::factory()->admin()->create();
    $txn = Transaction::factory()->create(['amount_usd_minor' => 60000, 'status' => TransactionStatus::Success]);

    $this->actingAs($admin)->patch(route('admin.risk.resolve', $txn))->assertRedirect();

    expect($txn->fresh()->risk_resolved_at)->not->toBeNull();

    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertInertia(fn (Assert $page) => $page->where('stats.open', 0)->has('flags', 0));
});

it('forbids non-admins from clearing a flag', function () {
    $reseller = User::factory()->reseller()->create();
    $txn = Transaction::factory()->create(['amount_usd_minor' => 60000, 'status' => TransactionStatus::Success]);

    $this->actingAs($reseller)->patch(route('admin.risk.resolve', $txn))->assertForbidden();
});

it('saves custom flag rules and applies them to the flag query', function () {
    $admin = User::factory()->admin()->create();
    Transaction::factory()->create(['amount_usd_minor' => 30000, 'status' => TransactionStatus::Success]); // $300

    // Default threshold is $200, so the $300 txn is flagged.
    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertInertia(fn (Assert $page) => $page->has('flags', 1)->where('rules.largeAmount', 200));

    // Raise the threshold above $300; the txn should no longer be flagged.
    $this->actingAs($admin)->patch(route('admin.risk.rules'), [
        'largeAmount' => 500,
        'highAmount' => 1000,
        'flagFailed' => false,
        'flagRefunded' => false,
    ])->assertRedirect();

    $this->actingAs($admin)->get(route('admin.risk'))
        ->assertInertia(fn (Assert $page) => $page->has('flags', 0)->where('rules.largeAmount', 500));
});

it('forbids non-admins from changing risk rules', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->patch(route('admin.risk.rules'), [
        'largeAmount' => 1, 'highAmount' => 2, 'flagFailed' => true, 'flagRefunded' => true,
    ])->assertForbidden();
});

it('validates the risk rules input', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->patch(route('admin.risk.rules'), [
        'largeAmount' => 'abc', 'highAmount' => -5,
    ])->assertSessionHasErrors(['largeAmount', 'highAmount', 'flagFailed', 'flagRefunded']);
});

it('requires authentication for risk', function () {
    $this->get(route('admin.risk'))->assertRedirect(route('login'));
});
