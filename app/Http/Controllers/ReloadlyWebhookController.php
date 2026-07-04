<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\WebhookEvent;
use App\Services\Providers\Data\TopUpResult;
use App\Services\SettlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Receives asynchronous transaction status callbacks from Reloadly and settles
 * the matching transaction. Idempotent: already-final transactions are left
 * untouched, and unknown events are acknowledged so the provider stops retrying.
 */
class ReloadlyWebhookController extends Controller
{
    public function __construct(private readonly SettlementService $settlement) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->json()->all() ?: $request->all();

        $reference = $payload['customIdentifier'] ?? null;
        $providerTransactionId = isset($payload['transactionId']) ? (string) $payload['transactionId'] : null;
        $status = $payload['status'] ?? null;

        $transaction = Transaction::query()
            ->when($reference !== null, fn ($query) => $query->where('reference', $reference))
            ->when(
                $reference === null && $providerTransactionId !== null,
                fn ($query) => $query->where('provider_transaction_id', $providerTransactionId),
            )
            ->first();

        $handled = $transaction !== null && $status !== null;

        if ($handled) {
            $this->settlement->settle($transaction, new TopUpResult(
                status: TopUpResult::statusFromProvider((string) $status),
                providerTransactionId: $providerTransactionId ?? $transaction->provider_transaction_id,
                providerStatus: (string) $status,
                raw: $payload,
            ));
        }

        $this->recordEvent($status, $handled, $payload, $transaction?->user_id);

        return response()->json(['received' => true]);
    }

    /**
     * Persist an audit row for the inbound webhook so it surfaces on the
     * developers page as a recent delivery (scoped to the owning user).
     *
     * @param  array<string, mixed>  $payload
     */
    private function recordEvent(?string $status, bool $handled, array $payload, ?int $userId): void
    {
        $event = $status !== null
            ? 'transaction.'.TopUpResult::statusFromProvider((string) $status)->value
            : 'transaction.unknown';

        WebhookEvent::query()->create([
            'user_id' => $userId,
            'event' => $event,
            'status' => $handled ? 'delivered' : 'ignored',
            'payload' => $payload,
            'received_at' => Carbon::now(),
        ]);
    }
}
