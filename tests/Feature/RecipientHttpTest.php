<?php

use App\Models\Recipient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('renders the recipients page with only the user\'s recipients', function () {
    Recipient::factory()->count(3)->create(['user_id' => $this->user->id]);
    Recipient::factory()->create();

    $this->actingAs($this->user)->get(route('recipients'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('recipients')->has('recipients', 3));
});

it('stores a new recipient', function () {
    $this->actingAs($this->user)->post(route('recipients.store'), [
        'name' => 'Mum',
        'country' => 'NG',
        'recipient' => '+2348035550142',
    ])->assertRedirect();

    expect(Recipient::query()->where('user_id', $this->user->id)->where('name', 'Mum')->exists())->toBeTrue();
});

it('validates the recipient store request', function () {
    $this->actingAs($this->user)->post(route('recipients.store'), ['name' => ''])
        ->assertSessionHasErrors(['name', 'country', 'recipient']);
});

it('updates a recipient', function () {
    $recipient = Recipient::factory()->create(['user_id' => $this->user->id, 'favorite' => false]);

    $this->actingAs($this->user)->patch(route('recipients.update', $recipient), ['favorite' => true])
        ->assertRedirect();

    expect($recipient->fresh()->favorite)->toBeTrue();
});

it('forbids updating another user\'s recipient', function () {
    $recipient = Recipient::factory()->create();

    $this->actingAs($this->user)->patch(route('recipients.update', $recipient), ['favorite' => true])
        ->assertForbidden();
});

it('deletes a recipient', function () {
    $recipient = Recipient::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->delete(route('recipients.destroy', $recipient))->assertRedirect();

    expect(Recipient::query()->find($recipient->id))->toBeNull();
});

it('forbids deleting another user\'s recipient', function () {
    $recipient = Recipient::factory()->create();

    $this->actingAs($this->user)->delete(route('recipients.destroy', $recipient))->assertForbidden();
});

it('requires authentication', function () {
    $this->get(route('recipients'))->assertRedirect(route('login'));
});

it('paginates and server-searches recipients', function () {
    $user = User::factory()->create();
    Recipient::factory()->count(30)->create(['user_id' => $user->id]);
    Recipient::factory()->create(['user_id' => $user->id, 'name' => 'Zenith Unique', 'recipient' => '+2348039998877']);

    $this->actingAs($user)->get(route('recipients'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recipients', 24)
            ->where('pagination.total', 31)
            ->where('pagination.lastPage', 2));

    $this->actingAs($user)->get(route('recipients', ['search' => 'Zenith Unique']))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 1)->has('recipients', 1));
});
