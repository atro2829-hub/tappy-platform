<?php

use App\Models\User;

it('logs out and blocks a suspended user on their next request', function () {
    $user = User::factory()->create(['status' => 'active']);

    // Active session works.
    $this->actingAs($user)->get(route('dashboard'))->assertOk();

    $user->update(['status' => 'suspended']);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

it('lets an active user through', function () {
    $user = User::factory()->create(['status' => 'active']);

    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});

it('prevents a suspended user from logging in', function () {
    $user = User::factory()->create([
        'status' => 'suspended',
        'password' => bcrypt('password'),
    ]);

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});

it('exposes an isSuspended helper', function () {
    expect(User::factory()->create(['status' => 'suspended'])->isSuspended())->toBeTrue()
        ->and(User::factory()->create(['status' => 'active'])->isSuspended())->toBeFalse();
});
