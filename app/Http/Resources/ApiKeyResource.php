<?php

namespace App\Http\Resources;

use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ApiKey
 */
class ApiKeyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'prefix' => $this->prefix,
            // The plaintext is shown only once at creation time. For stored keys
            // we only have the hash, so we surface a fully masked value that the
            // page can display/copy without ever leaking the real secret.
            'secret' => $this->prefix.str_repeat('•', 16),
            'mode' => $this->isRevoked() ? 'revoked' : ($this->environment ?? 'live'),
            'created' => $this->created_at?->toDateString(),
            'lastUsed' => $this->last_used_at?->diffForHumans() ?? 'Never',
            'calls' => 0,
        ];
    }
}
