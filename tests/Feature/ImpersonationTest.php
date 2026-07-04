<?php

use App\Http\Controllers\ImpersonationController;
use App\Models\AuditLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

const KEY = ImpersonationController::SESSION_KEY;

it('lets an admin impersonate a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create(['role' => 'business']);

    $this->actingAs($admin)
        ->post(route('admin.users.impersonate', $target))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas(KEY, $admin->id);

    $this->assertAuthenticatedAs($target);

    expect(AuditLog::query()->where('action', 'user.impersonation_started')->exists())->toBeTrue();
});

it('exposes the impersonating flag to the frontend while active', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create(['role' => 'business']);

    $this->actingAs($admin)->post(route('admin.users.impersonate', $target));

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('impersonating', true));
});

it('restores the original admin when impersonation stops', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create(['role' => 'business']);

    $this->actingAs($admin)->post(route('admin.users.impersonate', $target));

    $this->post(route('impersonate.stop'))
        ->assertRedirect(route('admin.users'))
        ->assertSessionMissing(KEY);

    $this->assertAuthenticatedAs($admin);

    expect(AuditLog::query()->where('action', 'user.impersonation_stopped')->exists())->toBeTrue();
});

it('refuses to impersonate another admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $other = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.users.impersonate', $other))
        ->assertForbidden();

    $this->assertAuthenticatedAs($admin);
    expect(session()->has(KEY))->toBeFalse();
});

it('refuses to impersonate a suspended account', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $suspended = User::factory()->create(['role' => 'business', 'status' => 'suspended']);

    $this->actingAs($admin)
        ->post(route('admin.users.impersonate', $suspended))
        ->assertRedirect()
        ->assertSessionMissing(KEY);

    $this->assertAuthenticatedAs($admin);
});

it('forbids non-admins from starting impersonation', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $target = User::factory()->create(['role' => 'business']);

    $this->actingAs($customer)
        ->post(route('admin.users.impersonate', $target))
        ->assertForbidden();
});

it('treats stop as a harmless no-op when not impersonating', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('impersonate.stop'))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($admin);
});
