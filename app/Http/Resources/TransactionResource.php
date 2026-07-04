<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->reference,
            'reference' => $this->reference,
            'type' => $this->type->value,
            'typeLabel' => $this->type->label(),
            'status' => $this->status->value,
            'country' => $this->country,
            'operator' => $this->operator_name,
            'recipient' => $this->recipient,
            'recipientName' => $this->recipient_name,
            'amountUsd' => Money::toDecimal($this->amount_usd_minor),
            'feeUsd' => Money::toDecimal($this->fee_minor),
            'totalUsd' => Money::toDecimal($this->totalChargeMinor()),
            'localAmount' => $this->local_amount_minor !== null
                ? Money::toDecimal($this->local_amount_minor)
                : null,
            'localCurrency' => $this->local_currency,
            'providerStatus' => $this->provider_status,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
