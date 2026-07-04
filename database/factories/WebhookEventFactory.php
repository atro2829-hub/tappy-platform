<?php

namespace Database\Factories;

use App\Models\WebhookEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookEvent>
 */
class WebhookEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event' => fake()->randomElement([
                'transaction.success',
                'transaction.failed',
                'transaction.pending',
                'transaction.refunded',
            ]),
            'status' => fake()->randomElement(['delivered', 'failed']),
            'payload' => ['status' => 'SUCCESSFUL'],
            'received_at' => fake()->dateTimeBetween('-7 days'),
        ];
    }
}
