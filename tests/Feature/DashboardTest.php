<?php

use App\Enums\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\DashboardData;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

it('renders the dashboard with wallet, recent, recipients and metrics', function () {
    $user = User::factory()->create(['role' => Role::Reseller]);
    Wallet::factory()->funded(50000)->create(['user_id' => $user->id]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('wallet')
            ->has('recent')
            ->has('savedRecipients')
            ->has('metrics')
            ->has('userCount')
            ->where('wallet.balance', 500));
});

it('computes real metrics from the user\'s transactions', function () {
    $user = User::factory()->create();

    Transaction::factory()->count(3)->success()->create([
        'user_id' => $user->id,
        'amount_usd_minor' => 1000,
        'fee_minor' => 50,
        'country' => 'NG',
    ]);
    Transaction::factory()->processing()->create(['user_id' => $user->id]);

    $metrics = app(DashboardData::class)->for($user->fresh());

    expect($metrics['successCount'])->toBe(3)
        ->and($metrics['pendingCount'])->toBe(1)
        ->and($metrics['totalCount'])->toBe(4)
        ->and($metrics['todaySales'])->toBe(30.0)
        ->and($metrics['profitToday'])->toBe(1.5)
        ->and($metrics['countryPerf'])->toHaveCount(1)
        ->and($metrics['weekSales'])->toHaveCount(7)
        ->and($metrics['revenue30d'])->toHaveCount(30);
});

it('scopes metrics to the user, not other users', function () {
    $user = User::factory()->create();
    Transaction::factory()->success()->create(['user_id' => $user->id, 'amount_usd_minor' => 1000]);
    Transaction::factory()->success()->create(['amount_usd_minor' => 9999]);

    $metrics = app(DashboardData::class)->for($user->fresh());

    expect($metrics['successCount'])->toBe(1)
        ->and($metrics['todaySales'])->toBe(10.0);
});

it('aggregates platform-wide metrics for admins', function () {
    $admin = User::factory()->create(['role' => Role::Admin]);
    Transaction::factory()->success()->create(['amount_usd_minor' => 1000]);
    Transaction::factory()->success()->create(['amount_usd_minor' => 2000]);

    $metrics = app(DashboardData::class)->for($admin);

    expect($metrics['successCount'])->toBe(2)
        ->and($metrics['volume30d'])->toBe(30.0);
});

it('counts only Business and Reseller accounts in the admin KYC banner', function () {
    $admin = User::factory()->create(['role' => Role::Admin, 'kyc_status' => 'pending']);
    User::factory()->customer()->kycPending()->create();
    User::factory()->business()->kycPending()->create();

    $metrics = app(DashboardData::class)->for($admin);

    // Only the pending business counts — the admin and customer are ignored.
    expect($metrics['kycPending'])->toBe(1);
});
