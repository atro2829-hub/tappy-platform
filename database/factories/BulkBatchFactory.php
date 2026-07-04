<?php

namespace Database\Factories;

use App\Models\BulkBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BulkBatch>
 */
class BulkBatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $total = fake()->numberBetween(50, 1500);

        return [
            'user_id' => User::factory(),
            'name' => fake()->slug(2).'.csv',
            'type' => fake()->randomElement(['airtime', 'data', 'giftcard']),
            'total' => $total,
            'processed' => 0,
            'succeeded' => 0,
            'failed' => 0,
            'status' => 'queued',
            'amount_usd_minor' => $total * fake()->numberBetween(200, 800),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'processed' => $attributes['total'],
            'succeeded' => $attributes['total'],
            'failed' => 0,
        ]);
    }
}
