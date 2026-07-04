<?php

namespace App\Http\Resources;

use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin WebhookEvent
 */
class WebhookEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $delivered = $this->status === 'delivered';

        return [
            'id' => 'evt_'.$this->id,
            'type' => $this->event,
            'status' => $this->status,
            'code' => $delivered ? 200 : 503,
            'time' => ($this->received_at ?? $this->created_at)?->format('H:i:s'),
            'attempts' => 1,
        ];
    }
}
