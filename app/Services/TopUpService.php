<?php

namespace App\Services;

use App\Enums\LedgerReason;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Jobs\ProcessTopUpJob;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\ProviderRegistry;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrates an airtime/data top-up: capture funds, create the transaction,
 * and hand off to the provider asynchronously. Settlement (and refund-on-fail)
 * is handled by {@see SettlementService}, shared across product types.
 */
class TopUpService
{
    public function __construct(
        private readonly WalletService $wallets,
        private readonly TopUpProvider $provider,
    ) {}

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        return $this->provider->detectOperator($phone, $countryIso);
    }

    /**
     * Processing fee in minor units, resolved from the active commission rule
     * (or the built-in 1.5% + 20 default when none is configured) — matching the
     * checkout total.
     */
    public function computeFeeMinor(int $amountUsdMinor): int
    {
        return app(FeeCalculator::class)->for(TransactionType::Airtime, $amountUsdMinor);
    }

    /**
     * Begin a top-up: charge the wallet, persist the transaction, queue delivery.
     *
     * @throws InsufficientFundsException
     */
    public function purchase(User $user, TopUpPurchaseInput $input): Transaction
    {
        // Idempotency: a repeated request returns the original transaction.
        if ($input->idempotencyKey !== null) {
            $existing = Transaction::query()->where('idempotency_key', $input->idempotencyKey)->first();

            if ($existing !== null) {
                return $existing;
            }
        }

        $wallet = $this->wallets->forUser($user);
        $feeMinor = $this->computeFeeMinor($input->amountUsdMinor);
        $totalMinor = $input->amountUsdMinor + $feeMinor;

        $transaction = DB::transaction(function () use ($user, $wallet, $input, $feeMinor, $totalMinor): Transaction {
            $transaction = Transaction::query()->create([
                'reference' => Transaction::generateReference(),
                'user_id' => $user->id,
                'type' => $input->type,
                'status' => TransactionStatus::Pending,
                'country' => $input->countryIso,
                'operator_id' => $input->operatorId,
                'operator_name' => $input->operatorName,
                'recipient' => $input->recipientPhone,
                'recipient_name' => $input->recipientName,
                'amount_usd_minor' => $input->amountUsdMinor,
                'fee_minor' => $feeMinor,
                'local_amount_minor' => $input->localAmountMinor,
                'local_currency' => $input->localCurrency,
                'provider' => ProviderRegistry::activeId('topup'),
                'idempotency_key' => $input->idempotencyKey,
            ]);

            // Capture funds up front; InsufficientFundsException rolls everything back.
            $this->wallets->debit($wallet, $totalMinor, LedgerReason::Purchase, [
                'transactionId' => $transaction->id,
                'idempotencyKey' => "txn-{$transaction->id}-purchase",
                'description' => "Top-up {$input->recipientPhone}",
            ]);

            // High-value transactions are held for admin review before delivery.
            if (app(RiskGate::class)->shouldHold($input->amountUsdMinor)) {
                $transaction->markReview();
            } else {
                $transaction->markProcessing();
            }

            return $transaction;
        });

        if ($transaction->status === TransactionStatus::Processing) {
            ProcessTopUpJob::dispatch($transaction->id);
        }

        return $transaction;
    }
}
