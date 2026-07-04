<?php

namespace App\Models;

use Database\Factories\ApiKeyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'name', 'environment', 'prefix', 'key_hash', 'last_used_at', 'revoked_at'])]
class ApiKey extends Model
{
    /** @use HasFactory<ApiKeyFactory> */
    use HasFactory;

    /**
     * Number of leading characters of the plaintext key stored for display.
     */
    public const PREFIX_LENGTH = 12;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
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
     * Whether this key has been revoked and can no longer authenticate.
     */
    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    /**
     * Generate a fresh secret key, e.g. sk_live_<40 chars> (or sk_test_ for the
     * sandbox environment).
     */
    public static function generateSecret(string $environment = 'live'): string
    {
        $prefix = $environment === 'sandbox' ? 'sk_test_' : 'sk_live_';

        return $prefix.Str::random(40);
    }

    /**
     * Hash a plaintext key for at-rest storage and lookup.
     */
    public static function hashSecret(string $key): string
    {
        return hash('sha256', $key);
    }
}
