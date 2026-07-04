<?php

namespace App\Http\Resources;

use App\Enums\LedgerDirection;
use App\Models\LedgerEntry;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LedgerEntry
 */
class LedgerEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sign = $this->direction === LedgerDirection::Credit ? 1 : -1;

        return [
            'id' => $this->id,
            'direction' => $this->direction->value,
            'reason' => $this->reason->value,
            'reasonLabel' => $this->reason->label(),
            'amount' => Money::toDecimal($this->amount_minor),
            'signedAmount' => $sign * Money::toDecimal($this->amount_minor),
            'balanceAfter' => Money::toDecimal($this->balance_after_minor),
            'description' => $this->description,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
