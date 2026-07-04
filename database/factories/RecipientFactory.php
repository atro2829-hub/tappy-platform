<?php

namespace Database\Factories;

use App\Models\Recipient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recipient>
 */
class RecipientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->firstName(),
            'country' => fake()->randomElement(['NG', 'KE', 'GH', 'BD', 'IN', 'PH', 'US']),
            'recipient' => '+'.fake()->numerify('############'),
            'operator' => fake()->randomElement(['MTN', 'Airtel', 'Glo', 'Safaricom', 'Grameenphone', 'Jio']),
            'operator_id' => (string) fake()->numberBetween(100, 999),
            'favorite' => fake()->boolean(20),
            'rel' => [],
            'last_used_at' => fake()->optional()->dateTimeBetween('-30 days'),
        ];
    }

    public function favorite(): static
    {
        return $this->state(fn (): array => ['favorite' => true]);
    }
}
