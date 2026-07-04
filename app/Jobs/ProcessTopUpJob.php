<?php

namespace App\Jobs;

use App\Jobs\Concerns\SettlesTransactionOnFailure;
use App\Models\Transaction;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\SettlementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Delivers a top-up through the provider and settles the transaction.
 *
 * Re-entrant: terminal transactions are skipped, and the provider receives the
 * transaction reference as an idempotency key, so retries never double-send.
 * On final failure the customer is refunded (see {@see SettlesTransactionOnFailure}).
 */
class ProcessTopUpJob implements ShouldQueue
{
    use Queueable, SettlesTransactionOnFailure;

    public function __construct(public int $transactionId) {}

    public function handle(TopUpProvider $provider, SettlementService $settlement): void
    {
        $transaction = Transaction::query()->find($this->transactionId);

        if ($transaction === null || $transaction->status->isTerminal()) {
            return;
        }

        $result = $provider->sendTopUp(new TopUpOrder(
            operatorId: (string) $transaction->operator_id,
            amount: $transaction->amount_usd_minor / 100,
            useLocalAmount: false,
            recipientPhone: (string) $transaction->recipient,
            countryIso: (string) $transaction->country,
            customIdentifier: $transaction->reference,
        ));

        $settlement->settle($transaction, $result);
    }
}
