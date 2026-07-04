<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['bulk_batch_id', 'country', 'recipient', 'amount_usd_minor', 'status', 'transaction_id'])]
class BulkItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_usd_minor' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<BulkBatch, $this>
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(BulkBatch::class, 'bulk_batch_id');
    }
}
