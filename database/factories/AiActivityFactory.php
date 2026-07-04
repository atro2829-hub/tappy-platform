<?php

namespace Database\Factories;

use App\Models\AiActivity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiActivity>
 */
class AiActivityFactory extends Factory
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
            'prompt' => fake()->sentence(),
            'intent' => fake()->randomElement(['topup', 'giftcard', 'balance', 'status', 'chat']),
            'reply' => fake()->sentence(),
            'action' => null,
            'status' => 'answered',
        ];
    }
}
