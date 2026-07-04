<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * A customer's outbound webhook endpoint: where signed event payloads are
 * POSTed, the HMAC signing secret, and which events they've subscribed to.
 */
#[Fillable(['user_id', 'url', 'secret', 'events'])]
class WebhookEndpoint extends Model
{
    /** Every event the platform can emit, in display order. */
    public const AVAILABLE_EVENTS = [
        'transaction.success',
        'transaction.failed',
        'transaction.pending',
        'transaction.refunded',
        'wallet.low_balance',
        'giftcard.delivered',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'events' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Generate a fresh signing secret. */
    public static function generateSecret(): string
    {
        return 'whsec_'.Str::random(40);
    }

    /** Whether this endpoint is subscribed to the given event. */
    public function isSubscribed(string $event): bool
    {
        return in_array($event, $this->events ?? [], true);
    }

    /** Whether deliveries can be attempted (a destination URL is set). */
    public function isDeliverable(): bool
    {
        return filled($this->url);
    }
}
