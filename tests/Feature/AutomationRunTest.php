<?php

use App\Models\Automation;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

function dueAutomation(User $user, array $overrides = []): Automation
{
    return Automation::factory()->create(array_merge([
        'user_id' => $user->id,
        'enabled' => true,
        'last_run_at' => null,
        'config' => ['recipient' => '+2348035550142', 'country' => 'NG', 'amount' => 5, 'cur' => 'USD', 'freq' => 'Daily'],
    ], $overrides));
}

it('runs a due automation as a real top-up', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    dueAutomation($user);

    $this->artisan('automations:run')->assertSuccessful();

    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(1)
        ->and(Automation::query()->first()->last_run_at)->not->toBeNull();
});

it('skips disabled automations', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    dueAutomation($user, ['enabled' => false]);

    $this->artisan('automations:run')->assertSuccessful();

    expect(Transaction::query()->count())->toBe(0);
});

it('does not re-run before the interval elapses', function () {
    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    dueAutomation($user, ['last_run_at' => now()->subHours(2)]);

    $this->artisan('automations:run')->assertSuccessful();

    expect(Transaction::query()->count())->toBe(0);
});

it('records a failReason when the wallet has no funds', function () {
    $user = User::factory()->create();
    dueAutomation($user);

    $this->artisan('automations:run')->assertSuccessful();

    expect(Transaction::query()->count())->toBe(0)
        ->and(Automation::query()->first()->config['failReason'] ?? null)->not->toBeNull();
});
