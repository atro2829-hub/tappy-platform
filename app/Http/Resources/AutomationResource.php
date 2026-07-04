<?php

namespace App\Http\Resources;

use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Maps an Automation onto the shape the automations screen expects. The rich
 * display fields (recipient, amount, frequency, next run, reminder) live in the
 * model's `config` JSON; status is derived from the `enabled` flag — except a
 * recorded `failReason` surfaces a failed run honestly.
 *
 * @mixin Automation
 */
class AutomationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $config = $this->config ?? [];
        $failReason = $config['failReason'] ?? null;

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'enabled' => $this->enabled,
            'trigger' => $this->trigger,
            'action' => $this->action,
            'recipient' => $config['recipient'] ?? '',
            'country' => $config['country'] ?? '',
            'operator' => $config['operator'] ?? '',
            'amount' => (float) ($config['amount'] ?? 0),
            'cur' => $config['cur'] ?? 'USD',
            'freq' => $config['freq'] ?? $this->trigger,
            // No scheduler runs these yet, so "next run" has no real source; show
            // the stored hint or an honest em dash rather than fabricating a date.
            'next' => $config['next'] ?? '—',
            'reminder' => $config['reminder'] ?? '1 day before',
            'status' => $failReason !== null
                ? 'failed'
                : ($this->enabled ? 'active' : 'paused'),
            'failReason' => $failReason,
            'lastRun' => $this->last_run_at?->diffForHumans() ?? 'Never',
            'lastRunAt' => $this->last_run_at?->toIso8601String(),
        ];
    }
}
