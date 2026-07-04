<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;

/**
 * Computes a reseller's real commission earnings from the fees on their own
 * successful transactions. Commission is the markup captured per sale, stored
 * as `fee_minor` on each transaction.
 */
class ResellerEarnings
{
    /**
     * @return array{
     *     commissionMtd: float,
     *     lifetimeCommission: float,
     *     avgMargin: float,
     *     productMix: list<array{label: string, color: string, pct: int}>,
     *     monthly: list<array{month: string, amount: float, dim: bool}>,
     *     payouts: list<array{id: string, period: string, amount: float, method: string, status: string, date: string}>
     * }
     */
    public function for(User $user): array
    {
        $commissionMtdMinor = (int) $user->transactions()
            ->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('fee_minor');

        $lifetimeMinor = (int) $user->transactions()
            ->where('status', TransactionStatus::Success)
            ->sum('fee_minor');

        $monthly = $this->monthlySeries($user);

        return [
            'commissionMtd' => Money::toDecimal($commissionMtdMinor),
            'lifetimeCommission' => Money::toDecimal($lifetimeMinor),
            'avgMargin' => $this->avgMargin($user),
            'productMix' => $this->productMix($user),
            'monthly' => $monthly,
            'payouts' => $this->payouts($monthly),
        ];
    }

    /**
     * Average margin = total fees captured / total volume sold, as a percentage.
     */
    private function avgMargin(User $user): float
    {
        $row = $user->transactions()
            ->where('status', TransactionStatus::Success)
            ->selectRaw('SUM(fee_minor) as fee, SUM(amount_usd_minor) as amount')
            ->first();

        $amount = (int) ($row->amount ?? 0);

        return $amount > 0 ? round(((int) $row->fee) / $amount * 100, 1) : 0.0;
    }

    /**
     * Real share of sales volume by product type, for the earnings donut.
     *
     * @return list<array{label: string, color: string, pct: int}>
     */
    private function productMix(User $user): array
    {
        $palette = [
            'airtime' => ['Airtime', 'primary'],
            'data' => ['Data', 'info'],
            'giftcard' => ['Gift cards', 'violet'],
            'utility' => ['Utility', 'warning'],
        ];

        $totals = $user->transactions()
            ->where('status', TransactionStatus::Success)
            ->selectRaw('type, SUM(amount_usd_minor) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $sum = (int) $totals->sum();

        $mix = [];

        foreach ($palette as $type => [$label, $color]) {
            $value = (int) $totals->get($type, 0);

            $mix[] = [
                'label' => $label,
                'color' => $color,
                'pct' => $sum > 0 ? (int) round($value / $sum * 100) : 0,
            ];
        }

        return $mix;
    }

    /**
     * Commission earned for each of the last 6 months. The current (still-open)
     * month is flagged `dim` so the chart renders it faded, matching the design.
     *
     * @return list<array{month: string, amount: float, dim: bool}>
     */
    private function monthlySeries(User $user): array
    {
        $series = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i);

            $minor = (int) $user->transactions()
                ->where('status', TransactionStatus::Success)
                ->whereBetween('created_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->sum('fee_minor');

            $series[] = [
                'month' => $month->format('M'),
                'amount' => Money::toDecimal($minor),
                'dim' => $i === 0,
            ];
        }

        return $series;
    }

    /**
     * Derive payout history from the monthly commission: each month becomes a
     * payout settled on the first of the following month. The current month is
     * still open, so its payout is pending.
     *
     * @param  list<array{month: string, amount: float, dim: bool}>  $monthly
     * @return list<array{id: string, period: string, amount: float, method: string, status: string, date: string}>
     */
    private function payouts(array $monthly): array
    {
        $payouts = [];

        foreach (array_reverse($monthly) as $index => $row) {
            $month = now()->startOfMonth()->subMonths($index);
            $pending = $row['dim'];

            $payouts[] = [
                'id' => 'PO-'.$month->format('Ym'),
                'period' => $pending
                    ? $month->format('M Y').' (current)'
                    : $month->format('M Y'),
                'amount' => $row['amount'],
                'method' => $pending ? 'Pending close' : 'Wallet credit',
                'status' => $pending ? 'pending' : 'success',
                'date' => $pending ? '—' : $month->copy()->addMonth()->format('M j, Y'),
            ];
        }

        return $payouts;
    }
}
