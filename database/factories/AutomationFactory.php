<?php

namespace Database\Factories;

use App\Models\Automation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Automation>
 */
class AutomationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $freq = fake()->randomElement(['Monthly', 'Weekly', 'Daily']);
        $amount = fake()->numberBetween(100, 5000);

        return [
            'user_id' => User::factory(),
            'name' => fake()->firstName(),
            'type' => fake()->randomElement(['auto-reload', 'scheduled']),
            'enabled' => true,
            'trigger' => "Every {$freq}",
            'action' => 'Top up '.$amount,
            'config' => [
                'recipient' => '+'.fake()->numerify('############'),
                'country' => fake()->randomElement(['NG', 'KE', 'BD', 'IN', 'PH']),
                'operator' => fake()->randomElement(['MTN Nigeria', 'Safaricom', 'Grameenphone', 'Reliance Jio', 'Globe Telecom']),
                'amount' => $amount,
                'cur' => fake()->randomElement(['NGN', 'KES', 'BDT', 'INR', 'PHP']),
                'freq' => $freq,
                'next' => 'Jul 1, 2026',
                'reminder' => '1 day before',
            ],
            'last_run_at' => fake()->optional()->dateTimeBetween('-30 days'),
        ];
    }

    public function paused(): static
    {
        return $this->state(fn (): array => ['enabled' => false]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'config' => [...$attributes['config'], 'failReason' => 'Low wallet balance'],
        ]);
    }
}
