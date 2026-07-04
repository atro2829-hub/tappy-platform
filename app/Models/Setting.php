<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Simple key/value store for platform-level settings (JSON values).
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public $timestamps = true;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * Read a setting's value, returning $default when it has never been set.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return self::query()->where('key', $key)->first()?->value ?? $default;
    }

    /**
     * Create or update a setting.
     */
    public static function put(string $key, mixed $value): void
    {
        self::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
