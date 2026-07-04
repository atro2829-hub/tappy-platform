<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
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
            'actor' => fake()->name(),
            'action' => fake()->randomElement(['auth.login', 'user.suspended', 'kyc.approved', 'wallet.funded']),
            'description' => fake()->sentence(),
            'ip_address' => fake()->ipv4(),
            'meta' => null,
        ];
    }
}
