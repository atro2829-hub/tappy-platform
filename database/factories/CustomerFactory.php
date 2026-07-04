<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reseller_id' => User::factory()->reseller(),
            'name' => fake()->company(),
            'contact' => '+'.fake()->numerify('############'),
            'tier' => fake()->randomElement(['Standard', 'Agent']),
            'status' => fake()->randomElement(['active', 'pending', 'suspended']),
            'country' => fake()->randomElement(['NG', 'KE', 'GH', 'BD', 'IN', 'PH']),
        ];
    }

    public function agent(): static
    {
        return $this->state(fn (): array => ['tier' => 'Agent']);
    }

    public function active(): static
    {
        return $this->state(fn (): array => ['status' => 'active']);
    }
}
