<?php

use App\Models\Ticket;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows a user only their own tickets', function () {
    $user = User::factory()->create();
    Ticket::factory()->count(2)->create(['user_id' => $user->id]);
    Ticket::factory()->create();

    $this->actingAs($user)->get(route('support'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('support')->has('tickets', 2));
});

it('shows an admin every ticket', function () {
    $admin = User::factory()->admin()->create();
    Ticket::factory()->count(3)->create();

    $this->actingAs($admin)->get(route('support'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('support')->has('tickets', 3));
});

it('opens a support ticket', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('support.store'), [
        'subject' => 'Top-up not received',
        'body' => 'My recipient did not get the airtime.',
    ])->assertRedirect();

    expect(Ticket::query()->where('user_id', $user->id)->where('subject', 'Top-up not received')->exists())->toBeTrue();
});

it('validates the ticket request', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('support.store'), ['subject' => ''])
        ->assertSessionHasErrors(['subject', 'body']);
});

it('requires authentication for support', function () {
    $this->get(route('support'))->assertRedirect(route('login'));
});

it('lets the ticket owner reply and marks it pending', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['user_id' => $user->id, 'status' => 'open']);

    $this->actingAs($user)->patch(route('support.reply', $ticket), [
        'body' => 'Any update on this?',
    ])->assertRedirect();

    expect($ticket->fresh()->status)->toBe('pending');
    expect($ticket->replies()->where('body', 'Any update on this?')->where('author', $user->name)->exists())->toBeTrue();
});

it('lets an admin reply and resolves the ticket', function () {
    $admin = User::factory()->admin()->create();
    $ticket = Ticket::factory()->create(['status' => 'open']);

    $this->actingAs($admin)->patch(route('support.reply', $ticket), [
        'body' => 'Resolved and refunded.',
    ])->assertRedirect();

    expect($ticket->fresh()->status)->toBe('resolved');
    expect($ticket->replies()->where('author', $admin->name)->exists())->toBeTrue();
});

it('forbids replying to another user ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create();

    $this->actingAs($user)->patch(route('support.reply', $ticket), [
        'body' => 'Let me peek at this.',
    ])->assertForbidden();

    expect($ticket->replies()->count())->toBe(0);
});

it('validates the reply request', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->patch(route('support.reply', $ticket), ['body' => ''])
        ->assertSessionHasErrors(['body']);
});

it('requires authentication to reply', function () {
    $ticket = Ticket::factory()->create();

    $this->patch(route('support.reply', $ticket), ['body' => 'Hi'])
        ->assertRedirect(route('login'));
});

it('paginates tickets for an admin with a true total', function () {
    $admin = User::factory()->admin()->create();
    Ticket::factory()->count(25)->create();

    $this->actingAs($admin)->get(route('support'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tickets', 20)
            ->where('pagination.total', 25)
            ->where('pagination.lastPage', 2));
});
