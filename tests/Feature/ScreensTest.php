<?php

use App\Models\User;

$sharedScreens = [
    'dashboard',
    'topup',
    'giftcards',
    'bulk',
    'recipients',
    'automations',
    'wallet',
    'transactions',
    'reports',
    'ai-activity',
    'developers',
    'support',
];

test('shared screens render for an authenticated user', function (string $route) {
    $this->actingAs(User::factory()->business()->create());

    $this->get(route($route))->assertOk();
})->with($sharedScreens);

test('admin screens are gated to admins', function (string $route) {
    $this->actingAs(User::factory()->business()->create());
    $this->get(route($route))->assertForbidden();

    $this->actingAs(User::factory()->admin()->create());
    $this->get(route($route))->assertOk();
})->with([
    'admin.users',
    'admin.kyc',
    'admin.catalog',
    'admin.commissions',
    'admin.risk',
    'admin.audit',
]);

test('reseller screens are gated to resellers', function (string $route) {
    $this->actingAs(User::factory()->business()->create());
    $this->get(route($route))->assertForbidden();

    $this->actingAs(User::factory()->reseller()->create());
    $this->get(route($route))->assertOk();
})->with([
    'reseller.customers',
    'reseller.earnings',
]);

test('guests are redirected to login from app screens', function () {
    $this->get(route('wallet'))->assertRedirect(route('login'));
});
