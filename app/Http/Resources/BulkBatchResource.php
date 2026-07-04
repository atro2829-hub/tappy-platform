<?php

namespace App\Http\Resources;

use App\Models\BulkBatch;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Maps a BulkBatch onto the shape the bulk-orders screen expects.
 *
 * Per-row validation is not tracked in-system, so `valid` mirrors the total row
 * count and `errors` reflects the (currently always 0) failed counter — honest,
 * not fabricated. Progress is derived from processed/total.
 *
 * @mixin BulkBatch
 */
class BulkBatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $progress = $this->total > 0
            ? (int) round($this->processed / $this->total * 100)
            : 0;

        return [
            'id' => 'BATCH-'.$this->id,
            'key' => $this->id,
            'name' => $this->name,
            'rows' => $this->total,
            'valid' => $this->total - $this->failed,
            'errors' => $this->failed,
            'status' => $this->status,
            'progress' => $progress,
            'cost' => Money::toDecimal($this->amount_usd_minor),
            'created' => $this->created_at?->diffForHumans() ?? 'Just now',
        ];
    }
}
