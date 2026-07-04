<?php

namespace Database\Seeders;

use App\Models\CommissionRule;
use Illuminate\Database\Seeder;

class CommissionRuleSeeder extends Seeder
{
    /**
     * Seed the platform's default markup rules (idempotent).
     */
    public function run(): void
    {
        // Each rule's structured markup actually drives pricing (see FeeCalculator).
        // Seeded to match the platform's effective fees; edit to change pricing.
        $rules = [
            ['product' => 'Airtime', 'region' => 'Global', 'tier' => 'All', 'markup' => '1.5% + $0.20', 'markup_percent' => 1.5, 'markup_flat_minor' => 20, 'cap' => null, 'cap_minor' => null],
            ['product' => 'Data', 'region' => 'Global', 'tier' => 'All', 'markup' => '1.5% + $0.20', 'markup_percent' => 1.5, 'markup_flat_minor' => 20, 'cap' => null, 'cap_minor' => null],
            ['product' => 'Gift cards', 'region' => 'Global', 'tier' => 'All', 'markup' => '4.0%', 'markup_percent' => 4.0, 'markup_flat_minor' => 0, 'cap' => null, 'cap_minor' => null],
            ['product' => 'Utility', 'region' => 'Global', 'tier' => 'All', 'markup' => '$0.30 flat', 'markup_percent' => 0, 'markup_flat_minor' => 30, 'cap' => null, 'cap_minor' => null],
        ];

        foreach ($rules as $rule) {
            CommissionRule::query()->updateOrCreate(
                ['product' => $rule['product'], 'region' => $rule['region'], 'tier' => $rule['tier']],
                $rule + ['active' => true],
            );
        }
    }
}
