<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRiskRulesRequest;
use App\Jobs\ProcessGiftCardJob;
use App\Jobs\ProcessTopUpJob;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Services\Providers\Data\TopUpResult;
use App\Services\RiskFlags;
use App\Services\SettlementService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminRiskController extends Controller
{
    public function __construct(private readonly RiskFlags $riskFlags) {}

    public function index(): Response
    {
        $rules = $this->riskFlags->rules();

        // Real, rule-derived flags from genuinely risky transactions, using the
        // admin-configured thresholds. Resolved flags are excluded.
        $flagged = $this->riskFlags->openFlagsQuery()
            ->with('user')
            ->latest('id')
            ->limit(50)
            ->get();

        $flags = $flagged->map(function (Transaction $txn) use ($rules): array {
            [$rule, $sev] = $this->classify($txn, $rules);

            return [
                'id' => 'RF-'.$txn->id,
                'rule' => $rule,
                'user' => $txn->user?->business_name ?? $txn->user?->name ?? '—',
                'userId' => (string) $txn->user_id,
                'sev' => $sev,
                'txn' => $txn->reference,
                'time' => $txn->created_at?->diffForHumans() ?? '—',
            ];
        });

        // Transactions held for manual approval before delivery.
        $holds = Transaction::query()
            ->with('user')
            ->where('status', TransactionStatus::Review)
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (Transaction $txn): array => [
                'id' => $txn->reference,
                'user' => $txn->user?->business_name ?? $txn->user?->name ?? '—',
                'type' => $txn->type->label(),
                'amount' => Money::toDecimal($txn->amount_usd_minor),
                'time' => $txn->created_at?->diffForHumans() ?? '—',
            ]);

        $blockedMinor = (int) Transaction::query()
            ->whereIn('status', [TransactionStatus::Failed, TransactionStatus::Refunded])
            ->where('created_at', '>=', now()->subDay())
            ->sum('amount_usd_minor');

        return Inertia::render('admin/risk', [
            'flags' => $flags,
            'holds' => $holds,
            'rules' => $rules,
            'stats' => [
                'open' => $this->riskFlags->openCount(),
                'held' => $holds->count(),
                'blocked' => Money::toDecimal($blockedMinor),
            ],
        ]);
    }

    /**
     * Approve a held transaction — queue it for delivery via the right job.
     */
    public function approve(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->status !== TransactionStatus::Review) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This transaction is not awaiting review.']);
        }

        match ($transaction->type) {
            TransactionType::GiftCard => ProcessGiftCardJob::dispatch($transaction->id),
            default => ProcessTopUpJob::dispatch($transaction->id),
        };

        AuditLog::record(
            'risk.approved',
            'Approved held transaction '.$transaction->reference,
            $request->user(),
            ['transaction_id' => $transaction->id],
            $request->ip(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Approved — delivering now.']);
    }

    /**
     * Reject a held transaction — refund the customer in full and mark it failed.
     */
    public function reject(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->status !== TransactionStatus::Review) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This transaction is not awaiting review.']);
        }

        app(SettlementService::class)->settle($transaction, new TopUpResult(
            status: TransactionStatus::Refunded,
            providerTransactionId: null,
            providerStatus: 'risk_rejected',
            raw: [],
        ));

        AuditLog::record(
            'risk.rejected',
            'Rejected held transaction '.$transaction->reference,
            $request->user(),
            ['transaction_id' => $transaction->id],
            $request->ip(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Rejected and refunded.']);
    }

    /**
     * Save the flag-rule thresholds used to derive risk flags.
     */
    public function updateRules(UpdateRiskRulesRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->riskFlags->saveRules([
            'largeAmount' => (float) $data['largeAmount'],
            'highAmount' => (float) $data['highAmount'],
            'flagFailed' => (bool) ($data['flagFailed'] ?? false),
            'flagRefunded' => (bool) ($data['flagRefunded'] ?? false),
        ]);

        AuditLog::record(
            'risk.rules_updated',
            'Updated risk flag rules',
            $request->user(),
            $data,
            $request->ip(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Risk rules saved.']);
    }

    /**
     * Clear (resolve) a flag — marks the underlying transaction reviewed so it
     * drops off the active-flags list. Bound by the public reference.
     */
    public function resolve(Request $request, Transaction $transaction): RedirectResponse
    {
        $transaction->update(['risk_resolved_at' => now()]);

        AuditLog::record(
            'risk.flag_cleared',
            'Cleared risk flag for '.$transaction->reference,
            $request->user(),
            ['transaction_id' => $transaction->id],
            $request->ip(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Flag cleared.']);
    }

    /**
     * @param  array{largeAmount: float, highAmount: float, flagFailed: bool, flagRefunded: bool}  $rules
     * @return array{0: string, 1: string}
     */
    private function classify(Transaction $txn, array $rules): array
    {
        $highMinor = (int) round($rules['highAmount'] * 100);

        return match (true) {
            $txn->status === TransactionStatus::Failed => ['Failed payment attempt', 'medium'],
            $txn->status === TransactionStatus::Refunded => ['Auto-refund issued', 'low'],
            $txn->amount_usd_minor >= $highMinor => ['Large transaction (≥ $'.(int) $rules['highAmount'].')', 'high'],
            default => ['Elevated transaction value', 'medium'],
        };
    }
}
