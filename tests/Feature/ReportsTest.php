<?php

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ReportsData;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the reports page with report data', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('reports'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports')
            ->has('report.totalRevenue')
            ->has('report.productMix', 4)
            ->has('report.weekSales', 7)
            ->has('report.revenue30d', 30));
});

it('computes real revenue, margin and product mix', function () {
    $user = User::factory()->create();

    Transaction::factory()->count(2)->success()->create([
        'user_id' => $user->id,
        'type' => TransactionType::Airtime,
        'amount_usd_minor' => 1000,
        'fee_minor' => 50,
        'country' => 'NG',
    ]);
    Transaction::factory()->success()->create([
        'user_id' => $user->id,
        'type' => TransactionType::GiftCard,
        'amount_usd_minor' => 2000,
        'fee_minor' => 80,
        'country' => 'US',
    ]);
    Transaction::factory()->failed()->create(['user_id' => $user->id]);

    $report = app(ReportsData::class)->for($user->fresh());

    expect($report['totalRevenue'])->toBe(40.0)        // (1000*2 + 2000) = $40
        ->and($report['grossMargin'])->toBe(1.8)       // (50*2 + 80) = $1.80
        ->and($report['transactions'])->toBe(4)
        ->and($report['failureRate'])->toBe(25.0)      // 1 failed of 4
        ->and($report['topDestinations'])->toHaveCount(2);

    $airtime = collect($report['productMix'])->firstWhere('label', 'Airtime');
    $gift = collect($report['productMix'])->firstWhere('label', 'Gift cards');

    expect($airtime['value'])->toBe(50)->and($gift['value'])->toBe(50);
});

it('requires authentication', function () {
    $this->get(route('reports'))->assertRedirect(route('login'));
});
