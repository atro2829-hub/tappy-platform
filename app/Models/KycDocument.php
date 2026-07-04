<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single KYC document uploaded by a user, stored on the private disk. The
 * overall verification decision lives on the user's `kyc_status`.
 */
#[Fillable(['user_id', 'type', 'original_name', 'path', 'mime_type', 'size'])]
class KycDocument extends Model
{
    /**
     * The document types collected during verification, in display order.
     *
     * @var array<string, array{label: string, hint: string, required: bool}>
     */
    public const TYPES = [
        'identity' => [
            'label' => 'Government ID',
            'hint' => 'Passport, national ID or driver’s licence',
            'required' => true,
        ],
        'address' => [
            'label' => 'Proof of address',
            'hint' => 'Utility bill or bank statement from the last 3 months',
            'required' => true,
        ],
        'registration' => [
            'label' => 'Business registration',
            'hint' => 'Certificate of incorporation or business licence',
            'required' => false,
        ],
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /** Whether a type is one we collect. */
    public static function isValidType(string $type): bool
    {
        return array_key_exists($type, self::TYPES);
    }

    /** The human label for this document's type. */
    public function label(): string
    {
        return self::TYPES[$this->type]['label'] ?? ucfirst($this->type);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
