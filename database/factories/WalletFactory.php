<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
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
            'currency' => 'USD',
            'balance_minor' => 0,
            'status' => 'active',
        ];
    }

    /**
     * A wallet pre-funded with the given amount in minor units.
     */
    public function funded(int $balanceMinor): static
    {
        return $this->state(fn (): array => ['balance_minor' => $balanceMinor]);
    }
}
