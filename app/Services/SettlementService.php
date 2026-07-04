<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Notifications\TransactionFailedNotification;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Applies a provider result to a transaction — shared by every product type
 * (top-up, gift card, utility) and by the webhook handler.
 *
 * Idempotent: terminal transactions are left untouched. A failure or provider
 * refund returns the wallet to whole; success captures the funds already held.
 */
class SettlementService
{
    public function __construct(
        private readonly WalletService $wallets,
        private readonly WebhookDispatcher $webhooks,
    ) {}

    public function settle(Transaction $transaction, TopUpResult $result): void
    {
        if ($transaction->status === TransactionStatus::Refunded) {
            return;
        }

        // A provider can refund a transaction that already settled Success
        // (a late chargeback/reversal). Honour that even though Success is
        // otherwise terminal; the "txn-{id}-refund" key keeps it single-shot.
        $isPostSuccessRefund = $transaction->status === TransactionStatus::Success
            && $result->status === TransactionStatus::Refunded;

        if ($transaction->status->isTerminal() && ! $isPostSuccessRefund) {
            return;
        }

        match ($result->status) {
            TransactionStatus::Success => $transaction->markSuccess(
                $result->providerTransactionId,
                $result->providerStatus,
            ),
            TransactionStatus::Processing => $this->keepProcessing($transaction, $result),
            TransactionStatus::Refunded => $this->refundAndMark($transaction, TransactionStatus::Refunded, $result),
            default => $this->refundAndMark($transaction, TransactionStatus::Failed, $result),
        };

        // Notify the customer's webhook endpoint of the new state.
        $this->webhooks->transaction($transaction);
    }

    private function keepProcessing(Transaction $transaction, TopUpResult $result): void
    {
        $transaction->fill([
            'provider_transaction_id' => $result->providerTransactionId,
            'provider_status' => $result->providerStatus,
        ])->save();
    }

    private function refundAndMark(Transaction $transaction, TransactionStatus $finalStatus, TopUpResult $result): void
    {
        // Record the provider's reason so a failed payment is diagnosable
        // (otherwise only an opaque "FAILED" status is kept).
        Log::warning('Transaction settled as '.$finalStatus->value.' — wallet refunded', [
            'reference' => $transaction->reference,
            'type' => $transaction->type->value,
            'operator' => $transaction->operator_name,
            'providerStatus' => $result->providerStatus,
            'message' => $result->message,
        ]);

        DB::transaction(function () use ($transaction, $finalStatus, $result): void {
            $wallet = $this->wallets->forUser($transaction->user);

            $this->wallets->refund($wallet, $transaction->totalChargeMinor(), [
                'transactionId' => $transaction->id,
                'idempotencyKey' => "txn-{$transaction->id}-refund",
                'description' => "Refund for {$transaction->reference}",
            ]);

            $transaction->transitionTo($finalStatus, [
                'provider_transaction_id' => $result->providerTransactionId,
                'provider_status' => $result->providerStatus,
            ]);
        });

        // Tell the customer their money came back — they no longer have to guess.
        $transaction->user?->notify(new TransactionFailedNotification($transaction->fresh()));
    }
}
