<?php

use App\Models\CommissionRule;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows commission rules and stats to an admin', function () {
    $admin = User::factory()->admin()->create();
    CommissionRule::factory()->count(3)->create(['active' => true]);

    $this->actingAs($admin)->get(route('admin.commissions'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/commissions')
            ->has('rules', 3)
            ->has('stats.platformMargin')
            ->where('stats.activeRules', 3));
});

it('forbids non-admins from commissions', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.commissions'))->assertForbidden();
});

it('requires authentication for commissions', function () {
    $this->get(route('admin.commissions'))->assertRedirect(route('login'));
});

it('updates a markup rule and recomputes its display labels', function () {
    $admin = User::factory()->admin()->create();
    $rule = CommissionRule::factory()->create([
        'product' => 'Airtime',
        'markup_percent' => 1.5,
        'markup_flat_minor' => 20,
        'cap_minor' => null,
    ]);

    $this->actingAs($admin)->patch(route('admin.commissions.update', $rule), [
        'markup_percent' => 3,
        'markup_flat' => 0.5,
        'cap' => 5,
    ])->assertRedirect();

    $rule->refresh();
    expect($rule->markup_percent)->toBe(3.0)
        ->and($rule->markup_flat_minor)->toBe(50)
        ->and($rule->cap_minor)->toBe(500)
        ->and($rule->markup)->toContain('3%')
        ->and($rule->cap)->toBe('$5.00');
});

it('forbids non-admins from editing a rule', function () {
    $reseller = User::factory()->reseller()->create();
    $rule = CommissionRule::factory()->create();

    $this->actingAs($reseller)->patch(route('admin.commissions.update', $rule), [
        'markup_percent' => 3, 'markup_flat' => 0,
    ])->assertForbidden();
});

it('validates the commission rule update', function () {
    $admin = User::factory()->admin()->create();
    $rule = CommissionRule::factory()->create();

    $this->actingAs($admin)->patch(route('admin.commissions.update', $rule), [
        'markup_percent' => 200, 'markup_flat' => -1,
    ])->assertSessionHasErrors(['markup_percent', 'markup_flat']);
});

it('creates a new commission rule', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.commissions.store'), [
        'product' => 'Data',
        'region' => 'Global',
        'tier' => 'All',
        'markup_percent' => 2.5,
        'markup_flat' => 0.25,
        'cap' => 3,
    ])->assertRedirect();

    $rule = CommissionRule::query()->where('product', 'Data')->first();
    expect($rule)->not->toBeNull()
        ->and($rule->markup_percent)->toBe(2.5)
        ->and($rule->markup_flat_minor)->toBe(25)
        ->and($rule->cap_minor)->toBe(300)
        ->and($rule->markup)->toContain('2.5%')
        ->and($rule->active)->toBeTrue();
});

it('forbids non-admins from creating a rule', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->post(route('admin.commissions.store'), [
        'product' => 'Data', 'region' => 'Global', 'tier' => 'All',
        'markup_percent' => 2, 'markup_flat' => 0,
    ])->assertForbidden();
});

it('deletes (disables) a rule so it leaves the active list', function () {
    $admin = User::factory()->admin()->create();
    $rule = CommissionRule::factory()->create(['active' => true]);

    $this->actingAs($admin)->delete(route('admin.commissions.destroy', $rule))->assertRedirect();

    expect($rule->fresh()->active)->toBeFalse();
});

it('forbids non-admins from deleting a rule', function () {
    $reseller = User::factory()->reseller()->create();
    $rule = CommissionRule::factory()->create(['active' => true]);

    $this->actingAs($reseller)->delete(route('admin.commissions.destroy', $rule))->assertForbidden();
});
