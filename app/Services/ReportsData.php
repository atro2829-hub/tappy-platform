<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Collection;

/**
 * Computes the real reports/analytics figures over a 30-day window from the
 * user's transactions (platform-wide for admins).
 */
class ReportsData
{
    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $isAdmin = $user->role === Role::Admin;

        // Shared 30-day base query — every figure below is aggregated in SQL,
        // never hydrated into PHP.
        $base = fn () => ($isAdmin ? Transaction::query() : Transaction::query()->where('user_id', $user->id))
            ->where('created_at', '>=', now()->subDays(30)->startOfDay());

        $txnCount = (clone $base())->count();
        $failedCount = (clone $base())->where('status', TransactionStatus::Failed)->count();
        $totalRevenueMinor = (int) (clone $base())->where('status', TransactionStatus::Success)->sum('amount_usd_minor');
        $grossMarginMinor = (int) (clone $base())->where('status', TransactionStatus::Success)->sum('fee_minor');

        $dailyMinor = (clone $base())
            ->where('status', TransactionStatus::Success)
            ->selectRaw('DATE(created_at) as d, SUM(amount_usd_minor) as minor')
            ->groupBy('d')
            ->pluck('minor', 'd');

        $productMinor = (clone $base())
            ->where('status', TransactionStatus::Success)
            ->selectRaw('type, SUM(amount_usd_minor) as minor')
            ->groupBy('type')
            ->pluck('minor', 'type');

        $countryRows = (clone $base())
            ->where('status', TransactionStatus::Success)
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->selectRaw('country, SUM(amount_usd_minor) as minor, SUM(fee_minor) as fee, COUNT(*) as txns')
            ->groupBy('country')
            ->orderByDesc('minor')
            ->get();

        return [
            'totalRevenue' => Money::toDecimal($totalRevenueMinor),
            'grossMargin' => Money::toDecimal($grossMarginMinor),
            'transactions' => $txnCount,
            'failureRate' => $txnCount > 0 ? round($failedCount / $txnCount * 100, 1) : 0.0,
            'revenue30d' => $this->dailySeries($dailyMinor, 30),
            'weekSales' => $this->weekSales($dailyMinor),
            'productMix' => $this->productMix($productMinor, $totalRevenueMinor),
            'topDestinations' => $this->topDestinations($countryRows),
        ];
    }

    /**
     * @param  Collection<string, int|string>  $dailyMinor  date (Y-m-d) => minor sum
     * @return list<float>
     */
    private function dailySeries(Collection $dailyMinor, int $days): array
    {
        $series = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $series[] = Money::toDecimal((int) ($dailyMinor[$day->format('Y-m-d')] ?? 0));
        }

        return $series;
    }

    /**
     * @param  Collection<string, int|string>  $dailyMinor  date (Y-m-d) => minor sum
     * @return list<array{label: string, value: float}>
     */
    private function weekSales(Collection $dailyMinor): array
    {
        $days = [];

        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $minor = (int) ($dailyMinor[$day->format('Y-m-d')] ?? 0);
            $days[] = ['label' => $day->format('D'), 'value' => Money::toDecimal($minor)];
        }

        return $days;
    }

    /**
     * Share of successful volume by product type (pre-grouped in SQL).
     *
     * @param  Collection<string, int|string>  $productMinor  type => minor sum
     * @return list<array{label: string, token: string, value: int}>
     */
    private function productMix(Collection $productMinor, int $totalMinor): array
    {
        $meta = [
            'airtime' => ['label' => 'Airtime', 'token' => 'primary'],
            'data' => ['label' => 'Data', 'token' => 'violet'],
            'giftcard' => ['label' => 'Gift cards', 'token' => 'info'],
            'utility' => ['label' => 'Utility', 'token' => 'warning'],
        ];

        $mix = [];

        foreach ($meta as $type => $m) {
            $minor = (int) ($productMinor[$type] ?? 0);

            $mix[] = [
                'label' => $m['label'],
                'token' => $m['token'],
                'value' => $totalMinor > 0 ? (int) round($minor / $totalMinor * 100) : 0,
            ];
        }

        return $mix;
    }

    /**
     * @param  Collection<int, Transaction>  $rows  rows with country, minor, fee, txns
     * @return list<array{iso: string, name: string, volume: float, txns: int, share: float, margin: float}>
     */
    private function topDestinations(Collection $rows): array
    {
        $totalMinor = (int) $rows->sum('minor');

        return $rows->take(8)
            ->map(fn ($row): array => [
                'iso' => $row->country,
                'name' => $row->country,
                'volume' => Money::toDecimal((int) $row->minor),
                'txns' => (int) $row->txns,
                'share' => $totalMinor > 0 ? round($row->minor / $totalMinor * 100, 1) : 0.0,
                'margin' => Money::toDecimal((int) $row->fee),
            ])
            ->values()
            ->all();
    }
}
