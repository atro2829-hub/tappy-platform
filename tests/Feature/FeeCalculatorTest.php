<?php

use App\Enums\TransactionType;
use App\Models\CommissionRule;
use App\Services\FeeCalculator;

it('falls back to built-in defaults when no rule is configured', function () {
    $calc = app(FeeCalculator::class);

    expect($calc->for(TransactionType::Airtime, 1000))->toBe(35)    // 1.5% (15) + 20
        ->and($calc->for(TransactionType::GiftCard, 1000))->toBe(40) // 4%
        ->and($calc->for(TransactionType::Utility, 1000))->toBe(30); // flat $0.30
});

it('prices the fee from a matching commission rule', function () {
    CommissionRule::factory()->create([
        'product' => 'Airtime', 'region' => 'Global', 'tier' => 'All', 'active' => true,
        'markup_percent' => 5.0, 'markup_flat_minor' => 0, 'cap_minor' => null,
    ]);

    expect(app(FeeCalculator::class)->for(TransactionType::Airtime, 1000))->toBe(50); // 5% of 1000
});

it('applies the rule cap', function () {
    CommissionRule::factory()->create([
        'product' => 'Gift cards', 'region' => 'Global', 'tier' => 'All', 'active' => true,
        'markup_percent' => 10.0, 'markup_flat_minor' => 0, 'cap_minor' => 50,
    ]);

    expect(app(FeeCalculator::class)->for(TransactionType::GiftCard, 1000))->toBe(50); // 100 capped to 50
});

it('ignores inactive rules and falls back to the default', function () {
    CommissionRule::factory()->create([
        'product' => 'Utility', 'region' => 'Global', 'tier' => 'All', 'active' => false,
        'markup_percent' => 9.0, 'markup_flat_minor' => 0,
    ]);

    expect(app(FeeCalculator::class)->for(TransactionType::Utility, 1000))->toBe(30);
});
