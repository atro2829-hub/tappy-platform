<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Jobs\DeliverWebhookJob;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;

/**
 * Emits signed webhook events to customers' configured endpoints. Delivery is
 * gated by the endpoint having a URL and a subscription to the event, then
 * handed to a queued job that signs and POSTs the payload.
 */
class WebhookDispatcher
{
    /**
     * Queue a single event for delivery, if the user has a deliverable endpoint
     * subscribed to it.
     *
     * @param  array<string, mixed>  $data
     */
    public function dispatch(User $user, string $event, array $data): void
    {
        $endpoint = $user->webhookEndpoint;

        if ($endpoint === null || ! $endpoint->isDeliverable() || ! $endpoint->isSubscribed($event)) {
            return;
        }

        DeliverWebhookJob::dispatch($user->id, (string) $endpoint->url, $endpoint->secret, $event, $data);
    }

    /**
     * Emit the event(s) for a transaction that just reached a new state.
     */
    public function transaction(Transaction $transaction): void
    {
        $event = match ($transaction->status) {
            TransactionStatus::Success => 'transaction.success',
            TransactionStatus::Processing, TransactionStatus::Review => 'transaction.pending',
            TransactionStatus::Refunded => 'transaction.refunded',
            TransactionStatus::Failed => 'transaction.failed',
            default => null,
        };

        $user = $transaction->user;

        if ($event === null || $user === null) {
            return;
        }

        $payload = $this->transactionPayload($transaction);

        $this->dispatch($user, $event, $payload);

        // A delivered gift card is also its own event.
        if ($transaction->status === TransactionStatus::Success && $transaction->type === TransactionType::GiftCard) {
            $this->dispatch($user, 'giftcard.delivered', $payload);
        }
    }

    /**
     * Emit a low-balance warning for a wallet that just dropped below its
     * configured auto-reload threshold.
     */
    public function lowBalance(User $user, int $balanceMinor): void
    {
        $this->dispatch($user, 'wallet.low_balance', [
            'balance_usd' => Money::toDecimal($balanceMinor),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transactionPayload(Transaction $transaction): array
    {
        return [
            'reference' => $transaction->reference,
            'type' => $transaction->type->value,
            'status' => $transaction->status->value,
            'amount_usd' => Money::toDecimal($transaction->amount_usd_minor),
            'country' => $transaction->country,
            'created_at' => $transaction->created_at?->toIso8601String(),
        ];
    }
}
