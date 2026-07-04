<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the catalog page for an admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/catalog')->has('driver'));
});

it('syncs the full live catalog grouped by country, busiest first', function () {
    config()->set('services.topup.driver', 'reloadly');

    Http::fake([
        '*auth.reloadly.com/*' => Http::response(['access_token' => 'tok', 'expires_in' => 3600]),
        '*/operators*' => Http::response([
            'content' => [
                ['operatorId' => 1, 'name' => 'MTN Nigeria', 'denominationType' => 'RANGE', 'destinationCurrencyCode' => 'NGN', 'country' => ['isoName' => 'NG', 'name' => 'Nigeria'], 'localMinAmount' => 100, 'localMaxAmount' => 50000],
                ['operatorId' => 2, 'name' => 'Airtel Nigeria', 'denominationType' => 'RANGE', 'destinationCurrencyCode' => 'NGN', 'country' => ['isoName' => 'NG', 'name' => 'Nigeria'], 'localMinAmount' => 100, 'localMaxAmount' => 50000],
                ['operatorId' => 3, 'name' => 'Safaricom', 'denominationType' => 'FIXED', 'destinationCurrencyCode' => 'KES', 'country' => ['isoName' => 'KE', 'name' => 'Kenya'], 'fixedAmounts' => [50, 100, 250]],
            ],
            'totalPages' => 1,
        ]),
    ]);

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.catalog.sync'))->assertRedirect();

    $cached = Cache::get('catalog.sync');
    expect($cached)->not->toBeNull()
        ->and($cached['operators'])->toBe(3)
        ->and($cached['countries'])->toBe(2)
        // Grouped by country, Nigeria (2 operators) ahead of Kenya (1).
        ->and($cached['catalog'][0]['iso'])->toBe('NG')
        ->and($cached['catalog'][0]['cur'])->toBe('NGN')
        ->and($cached['catalog'][0]['operators'])->toHaveCount(2)
        ->and($cached['catalog'][0]['operators'][0]['type'])->toBe('range')
        ->and($cached['catalog'][1]['operators'][0]['type'])->toBe('fixed');
});

it('passes the synced catalog to the catalog page', function () {
    Cache::put('catalog.sync', [
        'operators' => 1,
        'countries' => 1,
        'at' => now()->toIso8601String(),
        'catalog' => [[
            'iso' => 'NG', 'name' => 'Nigeria', 'cur' => 'NGN',
            'operators' => [['id' => '1', 'name' => 'MTN Nigeria', 'type' => 'range', 'min' => 100, 'max' => 50000, 'color' => '#000', 'txt' => '#fff']],
        ]],
    ], now()->addDay());

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/catalog')
            ->has('catalog', 1)
            ->where('catalog.0.iso', 'NG')
            ->where('sync.operators', 1));
});

it('refuses to sync when the provider is not reloadly', function () {
    config()->set('services.topup.driver', 'fake');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.catalog.sync'))->assertRedirect();

    expect(Cache::get('catalog.sync'))->toBeNull();
});

it('forbids non-admins from the catalog and from syncing', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.catalog'))->assertForbidden();
    $this->actingAs($reseller)->post(route('admin.catalog.sync'))->assertForbidden();
});
