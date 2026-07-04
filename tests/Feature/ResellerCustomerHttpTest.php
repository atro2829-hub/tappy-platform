<?php

use App\Enums\Role;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->reseller = User::factory()->create(['role' => Role::Reseller]);
});

it('shows the reseller only their own customers', function () {
    Customer::factory()->count(2)->create(['reseller_id' => $this->reseller->id]);
    Customer::factory()->create();

    $this->actingAs($this->reseller)->get(route('reseller.customers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reseller/customers')
            ->has('customers', 2)
            ->has('commissionMtd'));
});

it('attributes the reseller transactions to a customer by contact number', function () {
    Customer::factory()->create([
        'reseller_id' => $this->reseller->id,
        'contact' => '+2348035550142',
    ]);
    Transaction::factory()->success()->count(2)->create([
        'user_id' => $this->reseller->id,
        'recipient' => '+234 803 555 0142',
        'amount_usd_minor' => 1000,
        'fee_minor' => 40,
    ]);

    $this->actingAs($this->reseller)->get(route('reseller.customers'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('customers.0.orders', 2)
            ->where('customers.0.volume', 20)
            ->where('customers.0.commission', 0.8));
});

it('does not clutter the sidebar with a non-actionable customer-count badge', function () {
    Customer::factory()->count(3)->create(['reseller_id' => $this->reseller->id]);

    // A running total isn't an action item, so there's no customers badge.
    $this->actingAs($this->reseller)->get(route('reseller.customers'))
        ->assertInertia(fn (Assert $page) => $page->missing('navBadges.reseller-customers'));
});

it('imports customers from a CSV', function () {
    $csv = "name,contact,country,tier\nAda Lovelace,+2348031110001,NG,Agent\nGrace Hopper,+2348031110002,NG,Standard\n";
    $file = UploadedFile::fake()->createWithContent('customers.csv', $csv);

    $this->actingAs($this->reseller)->post(route('reseller.customers.import'), ['file' => $file])
        ->assertRedirect();

    expect($this->reseller->customers()->count())->toBe(2)
        ->and($this->reseller->customers()->where('name', 'Ada Lovelace')->where('tier', 'Agent')->exists())->toBeTrue();
});

it('adds a customer', function () {
    $this->actingAs($this->reseller)->post(route('reseller.customers.store'), [
        'name' => 'Karim Store',
        'contact' => '+8801712345678',
        'tier' => 'Agent',
    ])->assertRedirect();

    expect(Customer::query()->where('reseller_id', $this->reseller->id)->where('name', 'Karim Store')->exists())->toBeTrue();
});

it('validates the customer store request', function () {
    $this->actingAs($this->reseller)->post(route('reseller.customers.store'), ['name' => ''])
        ->assertSessionHasErrors(['name', 'contact']);
});

it('updates own customer', function () {
    $customer = Customer::factory()->create(['reseller_id' => $this->reseller->id, 'status' => 'active']);

    $this->actingAs($this->reseller)->patch(route('reseller.customers.update', $customer), ['status' => 'inactive'])
        ->assertRedirect();

    expect($customer->fresh()->status)->toBe('inactive');
});

it('forbids updating another reseller\'s customer', function () {
    $customer = Customer::factory()->create();

    $this->actingAs($this->reseller)->patch(route('reseller.customers.update', $customer), ['status' => 'inactive'])
        ->assertForbidden();
});

it('deletes own customer', function () {
    $customer = Customer::factory()->create(['reseller_id' => $this->reseller->id]);

    $this->actingAs($this->reseller)->delete(route('reseller.customers.destroy', $customer))->assertRedirect();

    expect(Customer::query()->find($customer->id))->toBeNull();
});

it('forbids non-resellers from the customers area', function () {
    $customer = User::factory()->create(['role' => Role::Customer]);

    $this->actingAs($customer)->get(route('reseller.customers'))->assertForbidden();
});

it('requires authentication', function () {
    $this->get(route('reseller.customers'))->assertRedirect(route('login'));
});

it('paginates customers and filters by tier server-side', function () {
    $reseller = User::factory()->reseller()->create();
    Customer::factory()->count(25)->create(['reseller_id' => $reseller->id, 'tier' => 'Customer']);
    Customer::factory()->count(3)->create(['reseller_id' => $reseller->id, 'tier' => 'Agent']);

    $this->actingAs($reseller)->get(route('reseller.customers'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers', 20)
            ->where('pagination.total', 28)
            ->where('stats.total', 28)
            ->where('stats.agents', 3));

    $this->actingAs($reseller)->get(route('reseller.customers', ['tier' => 'agent']))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 3));
});
