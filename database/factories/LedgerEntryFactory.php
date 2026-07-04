<?php

namespace Database\Factories;

use App\Enums\LedgerDirection;
use App\Enums\LedgerReason;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LedgerEntry>
 */
class LedgerEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(100, 50000);

        return [
            'wallet_id' => Wallet::factory(),
            'direction' => LedgerDirection::Credit,
            'amount_minor' => $amount,
            'balance_after_minor' => $amount,
            'reason' => LedgerReason::Funding,
            'transaction_id' => null,
            'idempotency_key' => null,
            'description' => null,
            'meta' => null,
        ];
    }
}
