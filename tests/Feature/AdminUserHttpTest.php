<?php

use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('invites a user, marks them verified and emails a set-password link', function () {
    Notification::fake();

    $this->actingAs($this->admin)->post(route('admin.users.store'), [
        'name' => 'New Vendor',
        'email' => 'vendor@example.com',
        'role' => 'business',
        'business_name' => 'Vendor LLC',
        'country' => 'NG',
    ])->assertRedirect();

    $user = User::query()->where('email', 'vendor@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role->value)->toBe('business')
        ->and($user->status)->toBe('active')
        ->and($user->kyc_status)->toBe('pending')
        ->and($user->hasVerifiedEmail())->toBeTrue();

    Notification::assertSentTo($user, UserInvitation::class);
});

it('validates the invite', function () {
    $this->actingAs($this->admin)->post(route('admin.users.store'), [
        'name' => '', 'email' => $this->admin->email, 'role' => 'wizard',
    ])->assertSessionHasErrors(['name', 'email', 'role']);
});

it('forbids non-admins from inviting users', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->post(route('admin.users.store'), [
        'name' => 'X', 'email' => 'x@example.com', 'role' => 'customer',
    ])->assertForbidden();
});

it('lists users with stats for an admin', function () {
    User::factory()->business()->count(2)->create();
    User::factory()->reseller()->create();
    User::factory()->suspended()->create();

    $this->actingAs($this->admin)->get(route('admin.users'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users')
            ->has('stats.total')
            ->has('stats.suspended'));
});

it('lets an admin suspend a user', function () {
    $user = User::factory()->create(['status' => 'active']);

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['status' => 'suspended'])
        ->assertRedirect();

    expect($user->fresh()->status)->toBe('suspended');
});

it('validates the status value', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['status' => 'bogus'])
        ->assertSessionHasErrors('status');
});

it('forbids non-admins from the users area', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.users'))->assertForbidden();
});

it('forbids non-admins from updating users', function () {
    $reseller = User::factory()->reseller()->create();
    $target = User::factory()->create();

    $this->actingAs($reseller)->patch(route('admin.users.update', $target), ['status' => 'suspended'])
        ->assertForbidden();
});

it('lets an admin approve a user\'s KYC', function () {
    $user = User::factory()->create(['kyc_status' => 'pending']);

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['kyc_status' => 'approved'])
        ->assertRedirect();

    expect($user->fresh()->kyc_status)->toBe('approved');
});

it('lets an admin change a user\'s role and records an audit entry', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['role' => 'reseller'])
        ->assertRedirect();

    expect($user->fresh()->role->value)->toBe('reseller')
        ->and(AuditLog::query()->where('action', 'user.role_changed')->exists())->toBeTrue();
});

it('prevents an admin from demoting themselves', function () {
    User::factory()->admin()->create(); // a second admin exists

    $this->actingAs($this->admin)->patch(route('admin.users.update', $this->admin), ['role' => 'business'])
        ->assertRedirect();

    expect($this->admin->fresh()->role->value)->toBe('admin');
});

it('prevents demoting the last administrator', function () {
    $onlyAdmin = $this->admin; // the only admin

    $this->actingAs($onlyAdmin)->patch(route('admin.users.update', $onlyAdmin), ['role' => 'business'])
        ->assertRedirect();

    expect($onlyAdmin->fresh()->role->value)->toBe('admin');
});

it('paginates users server-side with a true total', function () {
    User::factory()->count(25)->create();

    $this->actingAs($this->admin)->get(route('admin.users'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users', 20)
            ->where('pagination.total', 26) // 25 + the admin
            ->where('pagination.lastPage', 2));
});

it('filters users by server-side search', function () {
    User::factory()->create(['name' => 'Zalando Bravo', 'email' => 'zb@example.com']);
    User::factory()->count(5)->create();

    $this->actingAs($this->admin)->get(route('admin.users', ['search' => 'Zalando']))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 1)->has('users', 1));
});

it('filters users by role', function () {
    User::factory()->count(3)->reseller()->create();

    $this->actingAs($this->admin)->get(route('admin.users', ['role' => 'reseller']))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 3));
});

it('requires authentication', function () {
    $this->get(route('admin.users'))->assertRedirect(route('login'));
});
