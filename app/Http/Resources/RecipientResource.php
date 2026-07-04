<?php

namespace App\Http\Resources;

use App\Models\Recipient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Recipient
 */
class RecipientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'recipient' => $this->recipient,
            'country' => $this->country,
            'operator' => $this->operator ?? '—',
            'last' => $this->last_used_at?->diffForHumans() ?? 'Never',
            'fav' => $this->favorite,
            'rel' => $this->rel ?? [],
        ];
    }
}
