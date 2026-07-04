<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Providers\Reloadly\ReloadlyClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AdminCatalogController extends Controller
{
    private const CACHE_KEY = 'catalog.sync';

    public function index(): Response
    {
        $cached = Cache::get(self::CACHE_KEY);

        return Inertia::render('admin/catalog', [
            'sync' => $cached ? [
                'operators' => $cached['operators'],
                'countries' => $cached['countries'],
                'at' => $cached['at'],
            ] : null,
            'catalog' => $cached['catalog'] ?? null,
            'driver' => config('services.topup.driver', 'fake'),
        ]);
    }

    /**
     * Pull the full live catalog (every operator, grouped by country) from the
     * provider and cache it so the page can browse exactly what's available.
     */
    public function sync(): RedirectResponse
    {
        if (config('services.topup.driver') !== 'reloadly') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Catalog sync requires the live provider (set PROVIDER_DRIVER=reloadly).',
            ]);
        }

        try {
            $operators = $this->fetchAllOperators(ReloadlyClient::fromConfig('airtime'));
            $catalog = $this->groupByCountry($operators);
        } catch (Throwable $e) {
            report($e);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Could not reach the provider. Please try again.',
            ]);
        }

        Cache::put(self::CACHE_KEY, [
            'operators' => count($operators),
            'countries' => count($catalog),
            'at' => Carbon::now()->toIso8601String(),
            'catalog' => $catalog,
        ], Carbon::now()->addDays(7));

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Synced '.count($operators).' operators across '.count($catalog).' countries.',
        ]);
    }

    /**
     * Page through the provider's operator endpoint and return every operator.
     *
     * @return list<array<string, mixed>>
     */
    private function fetchAllOperators(ReloadlyClient $client): array
    {
        $operators = [];
        $page = 1;

        do {
            $response = $client->get('/operators', ['size' => 200, 'page' => $page]);

            foreach (($response['content'] ?? []) as $operator) {
                $operators[] = $operator;
            }

            $totalPages = (int) ($response['totalPages'] ?? 1);
            $page++;
        } while ($page <= $totalPages && $page <= 25);

        return $operators;
    }

    /**
     * Group raw operators into the per-country shape the catalog page renders,
     * ordered by operator count so the busiest destinations surface first.
     *
     * @param  list<array<string, mixed>>  $operators
     * @return list<array{iso: string, name: string, cur: string, operators: list<array<string, mixed>>}>
     */
    private function groupByCountry(array $operators): array
    {
        $byCountry = [];

        foreach ($operators as $operator) {
            $iso = strtoupper((string) ($operator['country']['isoName'] ?? ''));

            if ($iso === '') {
                continue;
            }

            if (! isset($byCountry[$iso])) {
                $byCountry[$iso] = [
                    'iso' => $iso,
                    'name' => (string) ($operator['country']['name'] ?? $iso),
                    'cur' => (string) ($operator['destinationCurrencyCode'] ?? ''),
                    'operators' => [],
                ];
            }

            $byCountry[$iso]['operators'][] = $this->mapOperator($operator);
        }

        $catalog = array_values($byCountry);

        usort($catalog, fn (array $a, array $b): int => count($b['operators']) <=> count($a['operators'])
            ?: strcmp($a['name'], $b['name']));

        return $catalog;
    }

    /**
     * Map a raw provider operator to the chip shape the UI needs. The provider
     * gives no brand color, so we derive a stable one from the name.
     *
     * @param  array<string, mixed>  $operator
     * @return array<string, mixed>
     */
    private function mapOperator(array $operator): array
    {
        $isFixed = ($operator['denominationType'] ?? '') === 'FIXED';
        $name = (string) ($operator['name'] ?? 'Operator');
        $hue = abs(crc32($name)) % 360;

        return [
            'id' => (string) ($operator['operatorId'] ?? $name),
            'name' => $name,
            'type' => $isFixed ? 'fixed' : 'range',
            'amounts' => $isFixed
                ? array_values(array_map('floatval', (array) ($operator['fixedAmounts'] ?? [])))
                : [],
            'min' => $isFixed ? null : (float) ($operator['localMinAmount'] ?? $operator['minAmount'] ?? 0),
            'max' => $isFixed ? null : (float) ($operator['localMaxAmount'] ?? $operator['maxAmount'] ?? 0),
            'color' => "hsl({$hue} 58% 45%)",
            'txt' => '#fff',
        ];
    }
}
