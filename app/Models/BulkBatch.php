<?php

namespace App\Models;

use Database\Factories\BulkBatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'name',
    'type',
    'total',
    'processed',
    'succeeded',
    'failed',
    'status',
    'amount_usd_minor',
])]
class BulkBatch extends Model
{
    /** @use HasFactory<BulkBatchFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total' => 'integer',
            'processed' => 'integer',
            'succeeded' => 'integer',
            'failed' => 'integer',
            'amount_usd_minor' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<BulkItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(BulkItem::class);
    }
}
