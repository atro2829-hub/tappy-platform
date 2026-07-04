<?php

namespace App\Jobs;

use App\Enums\TransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Models\BulkBatch;
use App\Models\BulkItem;
use App\Models\User;
use App\Services\TopUpPurchaseInput;
use App\Services\TopUpService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Sleep;

/**
 * Processes a queued bulk batch row-by-row: for each item it detects the
 * operator and places a real top-up via {@see TopUpService} (which captures
 * funds and queues delivery, with refund-on-failure handled downstream by the
 * settlement step). Items whose operator can't be resolved, or that can't be
 * charged (insufficient funds), are marked failed without aborting the batch.
 *
 * Scale-safe: items are streamed in id-chunks (bounded memory), only the still
 * `pending` rows are touched (so a retry resumes rather than restarts), per-item
 * idempotency keys ("bulk-{id}") prevent double-charging, and each provider call
 * is paced by `services.reloadly.bulk_delay_ms` so a large batch will not overwhelm
 * the provider. Final counts are tallied from the DB to reflect cumulative outcome.
 */
class ProcessBulkBatchJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 600;

    public function __construct(public int $batchId) {}

    /**
     * Mark the batch failed if the whole job exhausts its retries. Per-item
     * charges are idempotent ("bulk-{id}"), so a retry never double-charges.
     */
    public function failed(\Throwable $e): void
    {
        BulkBatch::query()->whereKey($this->batchId)->update(['status' => 'failed']);
    }

    public function handle(TopUpService $topUp): void
    {
        $batch = BulkBatch::query()->with('user')->find($this->batchId);

        if ($batch === null || in_array($batch->status, ['completed', 'failed'], true)) {
            return;
        }

        $batch->update(['status' => 'processing']);

        $type = $batch->type === 'data' ? TransactionType::Data : TransactionType::Airtime;
        $delayMs = (int) config('services.reloadly.bulk_delay_ms', 0);

        if ($batch->user !== null) {
            // Stream only the pending rows in id-chunks — bounded memory, and
            // resume-safe because finished rows drop out of the filter on retry.
            $batch->items()->where('status', 'pending')->chunkById(200, function ($items) use ($topUp, $batch, $type, $delayMs): void {
                foreach ($items as $item) {
                    if ($delayMs > 0) {
                        Sleep::usleep($delayMs * 1000);
                    }

                    $this->processItem($topUp, $batch->user, $item, $type);
                }
            });
        }

        // Tally from the DB so the batch reflects the cumulative outcome across
        // any retries, not just this run.
        $succeeded = $batch->items()->where('status', 'succeeded')->count();
        $failed = $batch->items()->where('status', 'failed')->count();

        $batch->update([
            // "failed" only when nothing went through; otherwise the batch
            // completed (per-row failures are reflected in the failed count).
            'status' => ($succeeded === 0 && $failed > 0) ? 'failed' : 'completed',
            'processed' => $succeeded + $failed,
            'succeeded' => $succeeded,
            'failed' => $failed,
        ]);
    }

    private function processItem(TopUpService $topUp, User $user, BulkItem $item, TransactionType $type): bool
    {
        $operator = $topUp->detectOperator($item->recipient, $item->country);

        if ($operator === null) {
            $item->update(['status' => 'failed']);

            return false;
        }

        try {
            $transaction = $topUp->purchase($user, new TopUpPurchaseInput(
                countryIso: $item->country,
                recipientPhone: $item->recipient,
                amountUsdMinor: $item->amount_usd_minor,
                operatorId: $operator->operatorId,
                operatorName: $operator->name,
                type: $type,
                idempotencyKey: "bulk-{$item->id}",
            ));
        } catch (InsufficientFundsException) {
            $item->update(['status' => 'failed']);

            return false;
        }

        $item->update(['status' => 'succeeded', 'transaction_id' => $transaction->id]);

        return true;
    }
}
