<?php

namespace App\Models;

use App\Enums\LedgerDirection;
use App\Enums\LedgerReason;
use Database\Factories\LedgerEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'wallet_id',
    'direction',
    'amount_minor',
    'balance_after_minor',
    'reason',
    'transaction_id',
    'idempotency_key',
    'description',
    'meta',
])]
class LedgerEntry extends Model
{
    /** @use HasFactory<LedgerEntryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'direction' => LedgerDirection::class,
            'reason' => LedgerReason::class,
            'amount_minor' => 'integer',
            'balance_after_minor' => 'integer',
            'meta' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Wallet, $this>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * The transaction that caused this ledger entry, if any.
     *
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
