<?php

namespace App\Http\Resources;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Customer
 */
class CustomerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'contact' => $this->contact,
            'country' => $this->country ?? '',
            'tier' => $this->tier,
            'status' => $this->status,
            'last' => $this->updated_at?->diffForHumans() ?? 'New',
            // Real per-customer totals, attributed from the reseller's successful
            // transactions whose topped-up number matches this customer's contact
            // (computed in ResellerCustomerController@index).
            'orders' => $this->orders ?? 0,
            'volume' => $this->volume_usd ?? 0.0,
            'commission' => $this->commission_usd ?? 0.0,
        ];
    }
}
