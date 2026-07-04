<?php

use App\Enums\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ResellerEarnings;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the earnings page with real earnings', function () {
    $reseller = User::factory()->create(['role' => Role::Reseller]);

    $this->actingAs($reseller)->get(route('reseller.earnings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reseller/earnings')
            ->has('earnings.commissionMtd')
            ->has('earnings.monthly', 6)
            ->has('earnings.payouts'));
});

it('computes commission from the reseller\'s own transaction fees', function () {
    $reseller = User::factory()->create(['role' => Role::Reseller]);

    Transaction::factory()->count(3)->success()->create([
        'user_id' => $reseller->id,
        'fee_minor' => 100,
    ]);
    Transaction::factory()->success()->create(['fee_minor' => 9999]);

    $earnings = app(ResellerEarnings::class)->for($reseller->fresh());

    expect($earnings['commissionMtd'])->toBe(3.0)
        ->and($earnings['lifetimeCommission'])->toBe(3.0)
        ->and($earnings['monthly'])->toHaveCount(6);
});

it('requires authentication for earnings', function () {
    $this->get(route('reseller.earnings'))->assertRedirect(route('login'));
});
