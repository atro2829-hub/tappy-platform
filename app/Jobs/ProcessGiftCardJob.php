<?php

namespace App\Jobs;

use App\Jobs\Concerns\SettlesTransactionOnFailure;
use App\Models\Transaction;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\SettlementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Places the gift-card order through the provider and settles the transaction.
 * Re-entrant: terminal transactions are skipped; the provider receives the
 * transaction reference as an idempotency key. On final failure the customer is
 * refunded (see {@see SettlesTransactionOnFailure}).
 */
class ProcessGiftCardJob implements ShouldQueue
{
    use Queueable, SettlesTransactionOnFailure;

    public function __construct(public int $transactionId) {}

    public function handle(GiftCardProvider $provider, SettlementService $settlement): void
    {
        $transaction = Transaction::query()->find($this->transactionId);

        if ($transaction === null || $transaction->status->isTerminal()) {
            return;
        }

        $meta = $transaction->meta ?? [];

        $result = $provider->order(new GiftCardOrder(
            productId: (string) $transaction->operator_id,
            quantity: (int) ($meta['quantity'] ?? 1),
            unitPriceUsd: (float) ($meta['denom'] ?? 0),
            recipient: (string) $transaction->recipient,
            deliverVia: (string) ($meta['deliverVia'] ?? 'email'),
            countryIso: (string) $transaction->country,
            customIdentifier: $transaction->reference,
            senderName: 'Tappy',
            message: $meta['message'] ?? null,
        ));

        $settlement->settle($transaction, $result);
    }
}
