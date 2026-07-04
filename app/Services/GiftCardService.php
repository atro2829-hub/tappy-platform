<?php

namespace App\Services;

use App\Enums\LedgerReason;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Jobs\ProcessGiftCardJob;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Providers\ProviderRegistry;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrates a gift-card purchase: capture funds (face value + fee), persist
 * the transaction, and queue delivery. Settlement/refund is shared via
 * {@see SettlementService}.
 */
class GiftCardService
{
    public function __construct(private readonly WalletService $wallets) {}

    /**
     * Processing fee in minor units, resolved from the active commission rule
     * (or the built-in 4% default when none is configured).
     */
    public function computeFeeMinor(int $faceValueMinor): int
    {
        return app(FeeCalculator::class)->for(TransactionType::GiftCard, $faceValueMinor);
    }

    /**
     * @throws InsufficientFundsException
     */
    public function purchase(User $user, GiftCardPurchaseInput $input): Transaction
    {
        if ($input->idempotencyKey !== null) {
            $existing = Transaction::query()->where('idempotency_key', $input->idempotencyKey)->first();

            if ($existing !== null) {
                return $existing;
            }
        }

        $wallet = $this->wallets->forUser($user);
        $faceMinor = $input->denomMinor * $input->quantity;
        $feeMinor = $this->computeFeeMinor($faceMinor);
        $totalMinor = $faceMinor + $feeMinor;

        $transaction = DB::transaction(function () use ($user, $wallet, $input, $faceMinor, $feeMinor, $totalMinor): Transaction {
            $transaction = Transaction::query()->create([
                'reference' => Transaction::generateReference(),
                'user_id' => $user->id,
                'type' => TransactionType::GiftCard,
                'status' => TransactionStatus::Pending,
                'country' => $input->countryIso,
                'operator_id' => $input->productId,
                'operator_name' => $input->brand,
                'recipient' => $input->recipient,
                'amount_usd_minor' => $faceMinor,
                'fee_minor' => $feeMinor,
                'local_currency' => 'USD',
                'provider' => ProviderRegistry::activeId('giftcard'),
                'idempotency_key' => $input->idempotencyKey,
                'meta' => [
                    'brand' => $input->brand,
                    'denom' => $input->denomMinor / 100,
                    'quantity' => $input->quantity,
                    'deliverVia' => $input->deliverVia,
                    'message' => $input->message,
                ],
            ]);

            $this->wallets->debit($wallet, $totalMinor, LedgerReason::Purchase, [
                'transactionId' => $transaction->id,
                'idempotencyKey' => "txn-{$transaction->id}-purchase",
                'description' => "Gift card {$input->brand} to {$input->recipient}",
            ]);

            // High-value transactions are held for admin review before delivery.
            if (app(RiskGate::class)->shouldHold($faceMinor)) {
                $transaction->markReview();
            } else {
                $transaction->markProcessing();
            }

            return $transaction;
        });

        if ($transaction->status === TransactionStatus::Processing) {
            ProcessGiftCardJob::dispatch($transaction->id);
        }

        return $transaction;
    }
}
