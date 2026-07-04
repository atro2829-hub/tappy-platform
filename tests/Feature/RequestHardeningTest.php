<?php

use App\Models\User;

it('rejects an oversized request body with 413', function () {
    $this->call('GET', '/', [], [], [], ['CONTENT_LENGTH' => 20 * 1024 * 1024])
        ->assertStatus(413);
});

it('allows a normal-sized request through', function () {
    $this->call('GET', '/', [], [], [], ['CONTENT_LENGTH' => 1024])
        ->assertOk();
});

it('rejects a copilot execute missing the activity id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => ['type' => 'topup']])
        ->assertStatus(422)
        ->assertJson(['message' => 'Invalid request — missing draft reference.']);
});

it('rejects a copilot execute with an unsupported action type', function () {
    $user = User::factory()->create();

    // topup/giftcard are the only executable types; anything else is refused.
    $this->actingAs($user)->postJson(route('copilot.execute'), ['action' => ['type' => 'wire-transfer', 'activityId' => 1]])
        ->assertStatus(422)
        ->assertJson(['message' => 'That action can’t be executed here.']);
});
