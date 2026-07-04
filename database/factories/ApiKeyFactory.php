<?php

namespace Database\Factories;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApiKey>
 */
class ApiKeyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $secret = ApiKey::generateSecret();

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Production server', 'Sandbox testing', 'Mobile app backend']),
            'prefix' => substr($secret, 0, ApiKey::PREFIX_LENGTH),
            'key_hash' => ApiKey::hashSecret($secret),
            'last_used_at' => fake()->optional()->dateTimeBetween('-30 days'),
            'revoked_at' => null,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (): array => ['revoked_at' => now()]);
    }
}
