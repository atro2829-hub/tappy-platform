<?php

use App\Models\User;
use App\Models\Wallet;

it('saves auto-reload settings for the wallet', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('wallet.auto-reload'), [
        'enabled' => true,
        'threshold' => 100,
        'amount' => 500,
    ])->assertRedirect();

    $wallet = $user->wallet()->first();

    expect($wallet->auto_reload_enabled)->toBeTrue()
        ->and($wallet->auto_reload_threshold_minor)->toBe(10000)
        ->and($wallet->auto_reload_amount_minor)->toBe(50000);
});

it('requires a threshold and amount when enabling', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('wallet.auto-reload'), ['enabled' => true])
        ->assertSessionHasErrors(['threshold', 'amount']);
});

it('can disable auto-reload without amounts', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('wallet.auto-reload'), ['enabled' => false])
        ->assertRedirect();

    expect($user->wallet()->first()->auto_reload_enabled)->toBeFalse();
});

it('tops up a wallet that has fallen below its threshold', function () {
    $user = User::factory()->create();
    Wallet::factory()->create([
        'user_id' => $user->id,
        'balance_minor' => 5000, // $50, below threshold
        'auto_reload_enabled' => true,
        'auto_reload_threshold_minor' => 10000, // $100
        'auto_reload_amount_minor' => 50000, // $500
    ]);

    $this->artisan('wallet:auto-reload')->assertSuccessful();

    // $50 + $500 top-up = $550.
    expect($user->wallet()->first()->balance_minor)->toBe(55000);
});

it('leaves a healthy wallet untouched', function () {
    $user = User::factory()->create();
    Wallet::factory()->create([
        'user_id' => $user->id,
        'balance_minor' => 50000, // above threshold
        'auto_reload_enabled' => true,
        'auto_reload_threshold_minor' => 10000,
        'auto_reload_amount_minor' => 50000,
    ]);

    $this->artisan('wallet:auto-reload')->assertSuccessful();

    expect($user->wallet()->first()->balance_minor)->toBe(50000);
});

it('ignores wallets with auto-reload disabled', function () {
    $user = User::factory()->create();
    Wallet::factory()->create([
        'user_id' => $user->id,
        'balance_minor' => 100,
        'auto_reload_enabled' => false,
        'auto_reload_threshold_minor' => 10000,
        'auto_reload_amount_minor' => 50000,
    ]);

    $this->artisan('wallet:auto-reload')->assertSuccessful();

    expect($user->wallet()->first()->balance_minor)->toBe(100);
});

it('does not double-credit when the command runs twice in the same hour', function () {
    $user = User::factory()->create();
    Wallet::factory()->create([
        'user_id' => $user->id,
        'balance_minor' => 5000,
        'auto_reload_enabled' => true,
        'auto_reload_threshold_minor' => 10000,
        'auto_reload_amount_minor' => 50000,
    ]);

    $this->artisan('wallet:auto-reload')->assertSuccessful();
    // Force the wallet back below threshold to prove the idempotency key (not the
    // balance guard) is what prevents the second credit within the same hour.
    $user->wallet->update(['balance_minor' => 5000]);
    $this->artisan('wallet:auto-reload')->assertSuccessful();

    // Only one credit applied despite two runs in the same hour.
    expect($user->wallet->fresh()->balance_minor)->toBe(5000);
});

it('requires authentication to change auto-reload', function () {
    $this->patch(route('wallet.auto-reload'), ['enabled' => false])
        ->assertRedirect(route('login'));
});
