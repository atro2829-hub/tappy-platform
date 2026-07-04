<?php

use App\Models\AuditLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('records an audit entry when an admin suspends a user', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['status' => 'active']);

    $this->actingAs($admin)->patch(route('admin.users.update', $user), ['status' => 'suspended']);

    expect(AuditLog::query()->where('action', 'user.suspended')->where('user_id', $admin->id)->exists())->toBeTrue();
});

it('records a login audit entry', function () {
    $user = User::factory()->create();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

    expect(AuditLog::query()->where('action', 'auth.login')->where('user_id', $user->id)->exists())->toBeTrue();
});

it('shows the audit log to an admin', function () {
    $admin = User::factory()->admin()->create();
    AuditLog::factory()->count(3)->create();

    $this->actingAs($admin)->get(route('admin.audit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/audit')->has('logs', 3));
});

it('paginates the audit log with a true total', function () {
    $admin = User::factory()->admin()->create();
    AuditLog::factory()->count(30)->create();

    $this->actingAs($admin)->get(route('admin.audit'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs', 25)
            ->where('pagination.total', 30)
            ->where('pagination.lastPage', 2));
});

it('forbids non-admins from the audit log', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.audit'))->assertForbidden();
});

it('requires authentication for the audit log', function () {
    $this->get(route('admin.audit'))->assertRedirect(route('login'));
});
