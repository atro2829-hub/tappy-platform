<?php

namespace App\Models;

use Database\Factories\CommissionRuleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A markup rule applied on top of provider cost, by product / region / tier.
 */
#[Fillable(['product', 'region', 'tier', 'markup', 'cap', 'active', 'markup_percent', 'markup_flat_minor', 'cap_minor'])]
class CommissionRule extends Model
{
    /** @use HasFactory<CommissionRuleFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'markup_percent' => 'float',
            'markup_flat_minor' => 'integer',
            'cap_minor' => 'integer',
        ];
    }
}
