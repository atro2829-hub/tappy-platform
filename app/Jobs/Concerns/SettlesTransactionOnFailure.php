<?php

namespace App\Jobs\Concerns;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Services\Providers\Data\TopUpResult;
use App\Services\SettlementService;
use Throwable;

/**
 * Shared retry/timeout policy for the single-transaction delivery jobs, plus a
 * failed() hook that refunds the customer when every retry is exhausted — so a
 * hung provider or dead worker can never leave a wallet debited with nothing
 * delivered. Relies on the job exposing a public int $transactionId.
 */
trait SettlesTransactionOnFailure
{
    public int $tries = 3;

    public int $timeout = 60;

    /**
     * Wait progressively longer between retries.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    /**
     * Final failure after all retries — refund and mark the transaction failed.
     */
    public function failed(?Throwable $e): void
    {
        $transaction = Transaction::query()->find($this->transactionId);

        if ($transaction === null || $transaction->status->isTerminal()) {
            return;
        }

        app(SettlementService::class)->settle($transaction, new TopUpResult(
            status: TransactionStatus::Failed,
            providerTransactionId: $transaction->provider_transaction_id,
            providerStatus: 'job_failed',
            raw: ['error' => $e?->getMessage()],
        ));
    }
}
