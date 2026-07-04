<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('shows the KYC queue with stats', function () {
    User::factory()->business()->kycPending()->create();
    User::factory()->reseller()->kycReview()->create();

    $this->actingAs($this->admin)->get(route('admin.kyc'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/kyc')
            ->has('queue')
            ->has('stats.pending')
            ->has('stats.review'));
});

it('lets an admin approve a kyc submission', function () {
    $user = User::factory()->business()->kycPending()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['kyc_status' => 'approved'])
        ->assertRedirect();

    expect($user->fresh()->kyc_status)->toBe('approved');
});

it('counts only Business and Reseller accounts, never customers or admins', function () {
    // Customers and admins can sit at a default "pending" kyc_status but never
    // go through KYC review — they must not inflate the pending count or queue.
    User::factory()->admin()->kycPending()->create();
    User::factory()->customer()->kycPending()->create();
    User::factory()->business()->create(['kyc_status' => 'approved']);
    User::factory()->reseller()->create(['kyc_status' => 'approved']);

    $this->actingAs($this->admin)->get(route('admin.kyc'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.pending', 0)
            ->where('stats.approved', 2)
            ->has('queue', 2));
});

it('only counts recently approved accounts in the 30-day stat', function () {
    User::factory()->business()->create(['kyc_status' => 'approved', 'updated_at' => now()->subDays(45)]);
    User::factory()->reseller()->create(['kyc_status' => 'approved', 'updated_at' => now()->subDays(5)]);

    $this->actingAs($this->admin)->get(route('admin.kyc'))
        ->assertInertia(fn (Assert $page) => $page->where('stats.approved', 1));
});

it('includes rejected users in the queue so they can be re-reviewed', function () {
    User::factory()->business()->create(['kyc_status' => 'rejected']);

    $this->actingAs($this->admin)->get(route('admin.kyc'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('queue', 1)
            ->where('stats.rejected', 1));
});

it('forbids non-admins from the kyc area', function () {
    $reseller = User::factory()->reseller()->create();

    $this->actingAs($reseller)->get(route('admin.kyc'))->assertForbidden();
});

it('requires authentication for kyc', function () {
    $this->get(route('admin.kyc'))->assertRedirect(route('login'));
});
