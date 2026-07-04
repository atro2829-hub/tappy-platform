<?php

namespace App\Console\Commands;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\TopUpResult;
use App\Services\Providers\ProviderRegistry;
use App\Services\SettlementService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

/**
 * Resolves transactions stuck in pending/processing. Asynchronous providers
 * return "processing" on send and settle later, so this first RE-POLLS the
 * provider for the real outcome — a delivered order must never be refunded.
 * Only as a last resort, once a transaction has been unresolved past the hard
 * timeout (or can't be polled), is the wallet refunded.
 */
#[Signature('transactions:reconcile {--minutes=60 : Only touch transactions older than this} {--timeout-hours=24 : Refund still-unresolved transactions older than this}')]
#[Description('Re-poll stuck transactions against their provider and settle them; refund only after the hard timeout.')]
class ReconcileStuckTransactions extends Command
{
    public function handle(SettlementService $settlement, TopUpProvider $topUp, GiftCardProvider $giftCards): int
    {
        $cutoff = now()->subMinutes(max(1, (int) $this->option('minutes')));
        $hardCutoff = now()->subHours(max(1, (int) $this->option('timeout-hours')));

        $stuck = Transaction::query()
            ->whereIn('status', [TransactionStatus::Pending, TransactionStatus::Processing])
            ->where('created_at', '<', $cutoff)
            ->get();

        $resolved = 0;
        $refunded = 0;

        foreach ($stuck as $transaction) {
            $category = $this->pollableCategory($transaction->type);
            $pastHardTimeout = $transaction->created_at->lt($hardCutoff);

            // Re-poll the provider that actually processed this transaction.
            if ($category !== null
                && $transaction->status === TransactionStatus::Processing
                && filled($transaction->provider_transaction_id)
                && $transaction->provider === ProviderRegistry::activeId($category)) {
                $result = $this->poll($category, $transaction->provider_transaction_id, $topUp, $giftCards);

                if ($result !== null && $result->status !== TransactionStatus::Processing) {
                    $settlement->settle($transaction, $result);
                    $resolved++;

                    continue;
                }

                // Still processing (or the poll failed): wait unless it's overdue.
                if ($pastHardTimeout) {
                    $this->forceRefund($settlement, $transaction);
                    $refunded++;
                }

                continue;
            }

            // Not pollable through these contracts (utility, never dispatched, or
            // the provider was switched): refund once it's past the hard timeout.
            // Utilities have no re-poll path, so they fall back to the cutoff.
            if ($category === null || $pastHardTimeout) {
                $this->forceRefund($settlement, $transaction);
                $refunded++;
            }
        }

        $this->info("Reconciled {$stuck->count()} stuck transaction(s): {$resolved} settled from provider, {$refunded} refunded.");

        return self::SUCCESS;
    }

    /** The provider category that can re-poll this transaction type, or null. */
    private function pollableCategory(TransactionType $type): ?string
    {
        return match ($type) {
            TransactionType::Airtime, TransactionType::Data => 'topup',
            TransactionType::GiftCard => 'giftcard',
            TransactionType::Utility => null,
        };
    }

    private function poll(string $category, string $providerTransactionId, TopUpProvider $topUp, GiftCardProvider $giftCards): ?TopUpResult
    {
        try {
            return $category === 'giftcard'
                ? $giftCards->getOrder($providerTransactionId)
                : $topUp->getTransaction($providerTransactionId);
        } catch (Throwable) {
            return null;
        }
    }

    private function forceRefund(SettlementService $settlement, Transaction $transaction): void
    {
        $settlement->settle($transaction, new TopUpResult(
            status: TransactionStatus::Failed,
            providerTransactionId: $transaction->provider_transaction_id,
            providerStatus: 'reconciled_timeout',
            raw: ['reconciled_timeout_hours' => (int) $this->option('timeout-hours')],
        ));
    }
}
