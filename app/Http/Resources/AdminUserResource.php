<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'roleLabel' => $this->role->label(),
            'biz' => $this->business_name ?? '—',
            'country' => $this->country ?? '',
            'status' => $this->status,
            'kyc' => $this->kyc_status,
            'wallet' => $this->wallet ? Money::toDecimal($this->wallet->balance_minor) : 0.0,
        ];
    }
}
