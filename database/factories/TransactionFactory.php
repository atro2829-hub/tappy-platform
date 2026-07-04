<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(100, 5000);

        return [
            'reference' => 'TXN-'.Carbon::now()->format('Ymd').'-'.fake()->unique()->numerify('####'),
            'user_id' => User::factory(),
            'type' => TransactionType::Airtime,
            'status' => TransactionStatus::Pending,
            'country' => 'NG',
            'operator_id' => (string) fake()->numberBetween(100, 999),
            'operator_name' => 'MTN Nigeria',
            'recipient' => '+234'.fake()->numerify('##########'),
            'recipient_name' => null,
            'amount_usd_minor' => $amount,
            'fee_minor' => 20,
            'local_amount_minor' => fake()->numberBetween(10000, 500000),
            'local_currency' => 'NGN',
            'provider' => 'reloadly',
            'provider_transaction_id' => null,
            'provider_status' => null,
            'idempotency_key' => null,
            'meta' => null,
            'processed_at' => null,
        ];
    }

    public function processing(): static
    {
        return $this->state(fn (): array => ['status' => TransactionStatus::Processing]);
    }

    public function success(): static
    {
        return $this->state(fn (): array => [
            'status' => TransactionStatus::Success,
            'provider_transaction_id' => (string) fake()->numberBetween(1000000, 9999999),
            'processed_at' => Carbon::now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => [
            'status' => TransactionStatus::Failed,
            'processed_at' => Carbon::now(),
        ]);
    }
}
