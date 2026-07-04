<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;

/**
 * Single source of truth for risk-flag rules and the set of currently open
 * (unresolved, rule-matching) flagged transactions. Shared by the Risk page,
 * the sidebar badge, and the dashboard banner so all three always agree.
 */
class RiskFlags
{
    public const RULES_KEY = 'risk.rules';

    /**
     * Default flag rules — used until an admin customises them.
     *
     * @var array{largeAmount: int, highAmount: int, flagFailed: bool, flagRefunded: bool}
     */
    public const DEFAULT_RULES = [
        'largeAmount' => 200,
        'highAmount' => 500,
        'flagFailed' => true,
        'flagRefunded' => true,
    ];

    /**
     * The active flag rules, merged over defaults.
     *
     * @return array{largeAmount: float, highAmount: float, flagFailed: bool, flagRefunded: bool}
     */
    public function rules(): array
    {
        return array_merge(self::DEFAULT_RULES, Setting::get(self::RULES_KEY, []));
    }

    /**
     * Query for the genuinely open risk flags: unresolved transactions that
     * match the admin-configured thresholds and status toggles.
     *
     * @return Builder<Transaction>
     */
    public function openFlagsQuery(): Builder
    {
        $rules = $this->rules();
        $largeMinor = (int) round($rules['largeAmount'] * 100);

        $flaggableStatuses = [];

        if ($rules['flagFailed']) {
            $flaggableStatuses[] = TransactionStatus::Failed;
        }

        if ($rules['flagRefunded']) {
            $flaggableStatuses[] = TransactionStatus::Refunded;
        }

        return Transaction::query()
            ->whereNull('risk_resolved_at')
            ->where(function (Builder $query) use ($largeMinor, $flaggableStatuses): void {
                $query->where('amount_usd_minor', '>=', $largeMinor);

                if ($flaggableStatuses !== []) {
                    $query->orWhereIn('status', $flaggableStatuses);
                }
            });
    }

    /**
     * Persist updated rule thresholds.
     *
     * @param  array{largeAmount: float, highAmount: float, flagFailed: bool, flagRefunded: bool}  $rules
     */
    public function saveRules(array $rules): void
    {
        Setting::put(self::RULES_KEY, $rules);
    }

    /** The number of currently open risk flags. */
    public function openCount(): int
    {
        return $this->openFlagsQuery()->count();
    }
}
