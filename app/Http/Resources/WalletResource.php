<?php

namespace App\Http\Resources;

use App\Models\Wallet;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Wallet
 */
class WalletResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'currency' => $this->currency,
            'balance' => Money::toDecimal($this->balance_minor),
            'balanceMinor' => $this->balance_minor,
            'status' => $this->status,
        ];
    }
}
