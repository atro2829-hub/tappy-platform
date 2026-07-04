<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAutomationRequest;
use App\Http\Requests\UpdateAutomationRequest;
use App\Http\Resources\AutomationResource;
use App\Models\Automation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AutomationController extends Controller
{
    /**
     * Display fields that are folded into the model's `config` JSON rather than
     * stored as first-class columns.
     *
     * @var list<string>
     */
    private const CONFIG_KEYS = ['recipient', 'country', 'operator', 'amount', 'cur', 'freq', 'next', 'reminder'];

    public function index(Request $request): Response
    {
        // Per-user list with derived "upcoming"/"failed" sub-sections that need
        // the full set; bounded in practice, so it isn't paginated.
        $automations = $request->user()->automations()
            ->orderByDesc('enabled')
            ->latest('id')
            ->limit(200)
            ->get();

        return Inertia::render('automations', [
            'automations' => AutomationResource::collection($automations),
        ]);
    }

    public function store(StoreAutomationRequest $request): RedirectResponse
    {
        $request->user()->automations()->create($this->payload($request->validated()));

        return back();
    }

    public function update(UpdateAutomationRequest $request, Automation $automation): RedirectResponse
    {
        abort_unless($automation->user_id === $request->user()->id, 403);

        $automation->update($this->payload($request->validated(), $automation));

        return back();
    }

    public function destroy(Request $request, Automation $automation): RedirectResponse
    {
        abort_unless($automation->user_id === $request->user()->id, 403);

        $automation->delete();

        return back();
    }

    /**
     * Split validated input into model columns, merging the display-only fields
     * into the `config` JSON (preserving any existing config on update).
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function payload(array $validated, ?Automation $automation = null): array
    {
        $config = $automation?->config ?? [];

        foreach (self::CONFIG_KEYS as $key) {
            if (array_key_exists($key, $validated)) {
                $config[$key] = $validated[$key];
                unset($validated[$key]);
            }
        }

        if ($config !== []) {
            $validated['config'] = $config;
        }

        return $validated;
    }
}
