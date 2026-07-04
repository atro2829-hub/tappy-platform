<?php

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Inertia\Testing\AssertableInertia as Assert;

it('reports an incomplete onboarding state for a fresh business', function () {
    $user = User::factory()->business()->create(['kyc_status' => 'pending']);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('onboarding.kycRequired', true)
            ->where('onboarding.kycApproved', false)
            ->where('onboarding.walletFunded', false)
            ->where('onboarding.hasTransaction', false)
            ->where('onboarding.complete', false));
});

it('marks onboarding complete once KYC, funding and a transaction exist', function () {
    $user = User::factory()->business()->create(['kyc_status' => 'approved']);
    Wallet::factory()->funded(10000)->create(['user_id' => $user->id]);
    Transaction::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('onboarding.walletFunded', true)
            ->where('onboarding.hasTransaction', true)
            ->where('onboarding.complete', true));
});

it('does not require a KYC step for a personal customer', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('onboarding.kycRequired', false));
});

it('has no onboarding checklist for admins', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('onboarding', null));
});
