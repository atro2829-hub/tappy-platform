<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
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
            'reference' => 'TKT-'.fake()->unique()->numberBetween(1000, 9999),
            'subject' => fake()->randomElement([
                'Top-up not received', 'Refund request', 'Failed transaction',
                'Account verification', 'Gift card not delivered',
            ]),
            'body' => fake()->paragraph(),
            'txn' => 'TXN-'.fake()->numerify('########'),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'status' => fake()->randomElement(['open', 'pending', 'resolved']),
        ];
    }
}
