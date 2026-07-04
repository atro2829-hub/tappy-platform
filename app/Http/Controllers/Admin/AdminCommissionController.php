<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommissionRuleRequest;
use App\Http\Requests\UpdateCommissionRuleRequest;
use App\Models\CommissionRule;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminCommissionController extends Controller
{
    public function index(): Response
    {
        $rules = CommissionRule::query()
            ->where('active', true)
            ->get()
            ->map(fn (CommissionRule $rule): array => [
                'id' => $rule->id,
                'product' => $rule->product,
                'region' => $rule->region,
                'tier' => $rule->tier,
                'markup' => $rule->markup,
                'cap' => $rule->cap ?? '—',
                'markupPercent' => $rule->markup_percent,
                'markupFlat' => Money::toDecimal($rule->markup_flat_minor),
                'capValue' => $rule->cap_minor !== null ? Money::toDecimal($rule->cap_minor) : null,
            ]);

        $marginMinor = (int) Transaction::query()
            ->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('fee_minor');

        $resellerPayoutMinor = (int) Transaction::query()
            ->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('user_id', User::query()->where('role', Role::Reseller)->select('id'))
            ->sum('fee_minor');

        return Inertia::render('admin/commissions', [
            'rules' => $rules,
            'stats' => [
                'platformMargin' => Money::toDecimal($marginMinor),
                'resellerPayouts' => Money::toDecimal($resellerPayoutMinor),
                'activeRules' => $rules->count(),
                'avgMarkup' => round((float) CommissionRule::query()->where('active', true)->avg('markup_percent'), 1),
            ],
        ]);
    }

    public function store(StoreCommissionRuleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $percent = (float) $data['markup_percent'];
        $flatMinor = Money::toMinor((float) $data['markup_flat']);
        $capMinor = isset($data['cap']) && $data['cap'] !== null && $data['cap'] !== ''
            ? Money::toMinor((float) $data['cap'])
            : null;

        CommissionRule::query()->create([
            'product' => $data['product'],
            'region' => $data['region'],
            'tier' => $data['tier'],
            'active' => true,
            'markup_percent' => $percent,
            'markup_flat_minor' => $flatMinor,
            'cap_minor' => $capMinor,
            'markup' => $this->formatMarkup($percent, $flatMinor),
            'cap' => $capMinor !== null ? '$'.number_format(Money::toDecimal($capMinor), 2) : null,
        ]);

        return back();
    }

    public function update(UpdateCommissionRuleRequest $request, CommissionRule $rule): RedirectResponse
    {
        $data = $request->validated();
        $percent = (float) $data['markup_percent'];
        $flatMinor = Money::toMinor((float) $data['markup_flat']);
        $capMinor = isset($data['cap']) && $data['cap'] !== null && $data['cap'] !== ''
            ? Money::toMinor((float) $data['cap'])
            : null;

        $rule->update([
            'markup_percent' => $percent,
            'markup_flat_minor' => $flatMinor,
            'cap_minor' => $capMinor,
            'markup' => $this->formatMarkup($percent, $flatMinor),
            'cap' => $capMinor !== null ? '$'.number_format(Money::toDecimal($capMinor), 2) : null,
        ]);

        return back();
    }

    public function destroy(CommissionRule $rule): RedirectResponse
    {
        // Soft-disable: the index only lists active rules, and pricing falls
        // back to built-in defaults once a rule is gone.
        $rule->update(['active' => false]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Rule deleted.']);
    }

    private function formatMarkup(float $percent, int $flatMinor): string
    {
        $label = rtrim(rtrim(number_format($percent, 2), '0'), '.').'%';

        if ($flatMinor > 0) {
            $label .= ' + $'.number_format(Money::toDecimal($flatMinor), 2);
        }

        return $label;
    }
}
