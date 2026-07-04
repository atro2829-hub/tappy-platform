<?php

namespace App\Models;

use Database\Factories\AuditLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'actor', 'action', 'description', 'ip_address', 'meta'])]
class AuditLog extends Model
{
    /** @use HasFactory<AuditLogFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
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
     * Record an audit entry. Safe to call with or without an actor.
     *
     * @param  array<string, mixed>  $meta
     */
    public static function record(string $action, string $description, ?User $actor = null, array $meta = [], ?string $ip = null): self
    {
        return static::create([
            'user_id' => $actor?->id,
            'actor' => $actor?->name ?? $actor?->email ?? 'System',
            'action' => $action,
            'description' => $description,
            'ip_address' => $ip,
            'meta' => $meta !== [] ? $meta : null,
        ]);
    }
}
