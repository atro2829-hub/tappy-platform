<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Computes the real, role-aware metrics shown on the dashboard from the
 * authenticated user's wallet and transactions (platform-wide for admins).
 */
class DashboardData
{
    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $isAdmin = $user->role === Role::Admin;

        $base = fn (): Builder => $isAdmin
            ? Transaction::query()
            : Transaction::query()->where('user_id', $user->id);

        $successCount = (clone $base())->where('status', TransactionStatus::Success)->count();
        $pendingCount = (clone $base())->whereIn('status', [TransactionStatus::Processing, TransactionStatus::Review])->count();
        $totalCount = (clone $base())->count();

        $txnsToday = (clone $base())->whereDate('created_at', now()->toDateString())->count();

        $todaySalesMinor = (int) (clone $base())->where('status', TransactionStatus::Success)
            ->whereDate('created_at', now()->toDateString())->sum('amount_usd_minor');
        $volume30dMinor = (int) (clone $base())->where('created_at', '>=', now()->subDays(30))->sum('amount_usd_minor');
        $commissionMtdMinor = (int) (clone $base())->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->startOfMonth())->sum('fee_minor');
        $profitTodayMinor = (int) (clone $base())->where('status', TransactionStatus::Success)
            ->whereDate('created_at', now()->toDateString())->sum('fee_minor');

        // Daily successful sales for the last 30 days, aggregated in SQL — no
        // hydration of the (potentially huge) transaction set into PHP.
        $dailyMinor = (clone $base())
            ->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->selectRaw('DATE(created_at) as d, SUM(amount_usd_minor) as minor')
            ->groupBy('d')
            ->pluck('minor', 'd');

        // Per-country successful volume for the same window, grouped in SQL.
        $countryRows = (clone $base())
            ->where('status', TransactionStatus::Success)
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->selectRaw('country, SUM(amount_usd_minor) as minor, COUNT(*) as txns')
            ->groupBy('country')
            ->orderByDesc('minor')
            ->get();

        return [
            'successCount' => $successCount,
            'pendingCount' => $pendingCount,
            'totalCount' => $totalCount,
            'successRate' => $totalCount > 0 ? round($successCount / $totalCount * 100, 1) : 100.0,
            'txnsToday' => $txnsToday,
            'todaySales' => Money::toDecimal($todaySalesMinor),
            'volume30d' => Money::toDecimal($volume30dMinor),
            'commissionMtd' => Money::toDecimal($commissionMtdMinor),
            'profitToday' => Money::toDecimal($profitTodayMinor),
            'weekSales' => $this->weekSales($dailyMinor),
            'revenue30d' => $this->revenue30d($dailyMinor),
            'countryPerf' => $this->countryPerf($countryRows),
            'kycPending' => $isAdmin ? User::query()
                ->whereIn('role', [Role::Business, Role::Reseller])
                ->whereIn('kyc_status', ['pending', 'review'])
                ->count() : 0,
            'riskFlags' => $isAdmin ? $this->riskFlagCount() : 0,
            'providerHealth' => $isAdmin ? $this->providerHealth() : [],
        ];
    }

    private function riskFlagCount(): int
    {
        return app(RiskFlags::class)->openCount();
    }

    /**
     * Real per-product health derived from transaction outcomes (platform-wide).
     *
     * @return list<array{name: string, successRate: float, volume: float, status: string}>
     */
    private function providerHealth(): array
    {
        $labels = [
            'airtime' => 'Airtime',
            'data' => 'Data',
            'giftcard' => 'Gift cards',
            'utility' => 'Utility',
        ];

        $rows = Transaction::query()
            ->selectRaw("type, COUNT(*) as total, SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success, SUM(CASE WHEN status = 'success' THEN amount_usd_minor ELSE 0 END) as volume")
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $health = [];

        foreach ($labels as $type => $name) {
            $row = $rows->get($type);
            $total = (int) ($row->total ?? 0);
            $success = (int) ($row->success ?? 0);
            $rate = $total > 0 ? round($success / $total * 100, 1) : 100.0;

            $health[] = [
                'name' => $name,
                'successRate' => $rate,
                'volume' => Money::toDecimal((int) ($row->volume ?? 0)),
                'status' => $rate >= 95 ? 'success' : ($rate >= 80 ? 'warning' : 'destructive'),
            ];
        }

        return $health;
    }

    /**
     * Gross successful value for each of the last 7 days, from the SQL daily map.
     *
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
     * Daily gross value for the last 30 days (sparkline series).
     *
     * @param  Collection<string, int|string>  $dailyMinor  date (Y-m-d) => minor sum
     * @return list<float>
     */
    private function revenue30d(Collection $dailyMinor): array
    {
        $series = [];

        for ($i = 29; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $series[] = Money::toDecimal((int) ($dailyMinor[$day->format('Y-m-d')] ?? 0));
        }

        return $series;
    }

    /**
     * Top destination countries by successful volume (pre-grouped in SQL).
     *
     * @param  Collection<int, Transaction>  $rows  rows with country, minor, txns
     * @return list<array{iso: string, name: string, volume: float, txns: int, share: float}>
     */
    private function countryPerf(Collection $rows): array
    {
        $totalMinor = (int) $rows->sum('minor');

        return $rows->take(5)
            ->map(fn ($row): array => [
                'iso' => $row->country,
                'name' => $row->country,
                'volume' => Money::toDecimal((int) $row->minor),
                'txns' => (int) $row->txns,
                'share' => $totalMinor > 0 ? round($row->minor / $totalMinor * 100, 1) : 0.0,
            ])
            ->values()
            ->all();
    }
}
