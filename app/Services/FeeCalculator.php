<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\CommissionRule;

/**
 * Resolves the processing fee for a transaction. If a matching active
 * {@see CommissionRule} exists it drives the price (percentage + flat, with an
 * optional cap); otherwise it falls back to the product's built-in default.
 *
 * This makes pricing data-driven and admin-visible while preserving the exact
 * fee behaviour wherever no rule is configured (e.g. in tests).
 */
class FeeCalculator
{
    public function for(TransactionType $type, int $amountUsdMinor): int
    {
        $rule = $this->matchRule($type);

        if ($rule !== null) {
            $fee = (int) round($amountUsdMinor * $rule->markup_percent / 100) + $rule->markup_flat_minor;

            if ($rule->cap_minor !== null && $rule->cap_minor > 0) {
                $fee = min($fee, $rule->cap_minor);
            }

            return $fee;
        }

        return $this->default($type, $amountUsdMinor);
    }

    private function matchRule(TransactionType $type): ?CommissionRule
    {
        return CommissionRule::query()
            ->where('active', true)
            ->where('product', $this->product($type))
            // Prefer a Global / All-tier rule, then any other active one.
            ->orderByRaw("CASE WHEN region = 'Global' THEN 0 ELSE 1 END")
            ->orderByRaw("CASE WHEN tier = 'All' THEN 0 ELSE 1 END")
            ->first();
    }

    private function product(TransactionType $type): string
    {
        return match ($type) {
            TransactionType::Airtime, TransactionType::Data => 'Airtime',
            TransactionType::GiftCard => 'Gift cards',
            TransactionType::Utility => 'Utility',
        };
    }

    /**
     * Built-in defaults — the fee charged when no commission rule is configured.
     */
    private function default(TransactionType $type, int $amountUsdMinor): int
    {
        return match ($type) {
            TransactionType::Airtime, TransactionType::Data => (int) round($amountUsdMinor * 0.015) + 20,
            TransactionType::GiftCard => (int) round($amountUsdMinor * 0.04),
            TransactionType::Utility => 30,
        };
    }
}
