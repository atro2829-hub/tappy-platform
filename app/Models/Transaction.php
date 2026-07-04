<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InvalidTransactionStatusException;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

#[Fillable([
    'reference',
    'user_id',
    'type',
    'status',
    'country',
    'operator_id',
    'operator_name',
    'recipient',
    'recipient_name',
    'amount_usd_minor',
    'fee_minor',
    'local_amount_minor',
    'local_currency',
    'provider',
    'provider_transaction_id',
    'provider_status',
    'idempotency_key',
    'meta',
    'processed_at',
    'risk_resolved_at',
])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    /**
     * Legal status transitions for the lifecycle state machine.
     *
     * @var array<string, list<string>>
     */
    private const TRANSITIONS = [
        'pending' => ['processing', 'success', 'failed', 'review'],
        'processing' => ['success', 'failed', 'refunded', 'review'],
        'review' => ['success', 'failed', 'refunded'],
        'success' => ['refunded'],
        'failed' => ['refunded'],
        'refunded' => [],
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'status' => TransactionStatus::class,
            'amount_usd_minor' => 'integer',
            'fee_minor' => 'integer',
            'local_amount_minor' => 'integer',
            'meta' => 'array',
            'processed_at' => 'datetime',
            'risk_resolved_at' => 'datetime',
        ];
    }

    /**
     * Resolve route-model bindings by the public reference, not the id.
     */
    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<LedgerEntry, $this>
     */
    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * Total amount charged to the wallet for this transaction (value + fee).
     */
    public function totalChargeMinor(): int
    {
        return $this->amount_usd_minor + $this->fee_minor;
    }

    /**
     * Whether moving to the given status is a legal next step.
     */
    public function canTransitionTo(TransactionStatus $to): bool
    {
        if ($this->status === $to) {
            return true; // idempotent self-transition
        }

        return in_array($to->value, self::TRANSITIONS[$this->status->value] ?? [], true);
    }

    /**
     * Move the transaction to a new status, enforcing the state machine.
     *
     * Self-transitions are a no-op so webhook/job retries stay idempotent.
     *
     * @param  array<string, mixed>  $attributes  extra columns to persist with the change
     */
    public function transitionTo(TransactionStatus $to, array $attributes = []): void
    {
        if ($this->status === $to && $attributes === []) {
            return;
        }

        if (! $this->canTransitionTo($to)) {
            throw new InvalidTransactionStatusException(
                "Cannot move transaction {$this->reference} from {$this->status->value} to {$to->value}.",
            );
        }

        $this->fill($attributes);
        $this->status = $to;

        if ($to->isTerminal() && $this->processed_at === null) {
            $this->processed_at = Carbon::now();
        }

        $this->save();
    }

    public function markProcessing(?string $providerTransactionId = null): void
    {
        $this->transitionTo(TransactionStatus::Processing, array_filter([
            'provider_transaction_id' => $providerTransactionId,
        ]));
    }

    public function markSuccess(?string $providerTransactionId = null, ?string $providerStatus = null): void
    {
        $this->transitionTo(TransactionStatus::Success, array_filter([
            'provider_transaction_id' => $providerTransactionId,
            'provider_status' => $providerStatus,
        ]));
    }

    public function markFailed(?string $providerStatus = null): void
    {
        $this->transitionTo(TransactionStatus::Failed, array_filter([
            'provider_status' => $providerStatus,
        ]));
    }

    public function markRefunded(): void
    {
        $this->transitionTo(TransactionStatus::Refunded);
    }

    public function markReview(): void
    {
        $this->transitionTo(TransactionStatus::Review);
    }

    /**
     * Generate a unique public reference, e.g. TXN-20260606-9F3A.
     */
    public static function generateReference(): string
    {
        return 'TXN-'.Carbon::now()->format('Ymd').'-'.Str::upper(Str::random(4));
    }
}
