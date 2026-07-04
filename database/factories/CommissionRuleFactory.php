<?php

namespace Database\Factories;

use App\Models\CommissionRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommissionRule>
 */
class CommissionRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product' => fake()->randomElement(['Airtime', 'Gift cards', 'Data', 'Utility']),
            'region' => fake()->randomElement(['Africa', 'Asia', 'Global']),
            'tier' => fake()->randomElement(['Business', 'Reseller', 'All']),
            'markup' => fake()->randomElement(['4.5%', '3.8%', '6.0%', '2.5%']),
            'cap' => fake()->randomElement([null, '$1.00', '$2.00']),
            'markup_percent' => fake()->randomFloat(1, 1, 6),
            'markup_flat_minor' => fake()->randomElement([0, 20, 30]),
            'cap_minor' => null,
            'active' => true,
        ];
    }
}
