<?php

namespace App\Http\Resources;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Ticket
 */
class TicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->id,
            'id' => $this->reference,
            'subject' => $this->subject,
            'body' => $this->body,
            'from' => $this->user?->business_name ?? $this->user?->name ?? $this->user?->email ?? '—',
            'txn' => $this->txn ?? '—',
            'priority' => $this->priority,
            'status' => $this->status,
            'updated' => $this->updated_at?->diffForHumans() ?? '—',
            'replies' => $this->whenLoaded('replies', fn () => $this->replies->map(fn ($reply) => [
                'id' => $reply->id,
                'author' => $reply->author,
                'body' => $reply->body,
                'at' => $reply->created_at?->diffForHumans() ?? '—',
            ])),
        ];
    }
}
