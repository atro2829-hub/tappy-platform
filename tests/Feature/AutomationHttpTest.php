<?php

use App\Models\Automation;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('renders the automations page with only the user\'s automations', function () {
    Automation::factory()->count(3)->create(['user_id' => $this->user->id]);
    Automation::factory()->create();

    $this->actingAs($this->user)->get(route('automations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('automations')->has('automations', 3));
});

it('stores a new automation', function () {
    $this->actingAs($this->user)->post(route('automations.store'), [
        'name' => 'Mother',
        'type' => 'scheduled',
        'trigger' => 'Every Monday 09:00',
        'action' => 'Top up $5',
        'amount' => 300,
        'cur' => 'BDT',
        'freq' => 'Monthly',
    ])->assertRedirect();

    $automation = Automation::query()->where('user_id', $this->user->id)->where('name', 'Mother')->first();

    expect($automation)->not->toBeNull()
        ->and($automation->enabled)->toBeTrue()
        ->and($automation->config['amount'])->toBe(300)
        ->and($automation->config['freq'])->toBe('Monthly');
});

it('validates the automation store request', function () {
    $this->actingAs($this->user)->post(route('automations.store'), ['name' => ''])
        ->assertSessionHasErrors(['name', 'type', 'trigger', 'action']);
});

it('toggles an automation off via update', function () {
    $automation = Automation::factory()->create(['user_id' => $this->user->id, 'enabled' => true]);

    $this->actingAs($this->user)->patch(route('automations.update', $automation), ['enabled' => false])
        ->assertRedirect();

    expect($automation->fresh()->enabled)->toBeFalse();
});

it('preserves existing config when updating', function () {
    $automation = Automation::factory()->create([
        'user_id' => $this->user->id,
        'config' => ['recipient' => '+880123', 'amount' => 200, 'freq' => 'Monthly'],
    ]);

    $this->actingAs($this->user)->patch(route('automations.update', $automation), ['enabled' => false])
        ->assertRedirect();

    expect($automation->fresh()->config)->toMatchArray([
        'recipient' => '+880123',
        'amount' => 200,
        'freq' => 'Monthly',
    ]);
});

it('forbids updating another user\'s automation', function () {
    $automation = Automation::factory()->create();

    $this->actingAs($this->user)->patch(route('automations.update', $automation), ['enabled' => false])
        ->assertForbidden();
});

it('deletes an automation', function () {
    $automation = Automation::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->delete(route('automations.destroy', $automation))->assertRedirect();

    expect(Automation::query()->find($automation->id))->toBeNull();
});

it('forbids deleting another user\'s automation', function () {
    $automation = Automation::factory()->create();

    $this->actingAs($this->user)->delete(route('automations.destroy', $automation))->assertForbidden();
});

it('requires authentication', function () {
    $this->get(route('automations'))->assertRedirect(route('login'));
});
