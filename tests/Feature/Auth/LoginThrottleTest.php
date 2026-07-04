<?php

use App\Models\User;

test('demo mode never throttles login, even after many rapid attempts', function () {
    config(['demo.enabled' => true]);

    $user = User::factory()->create(['password' => 'password']);

    // A reviewer hammering the demo (wrong tries, clicking all roles, etc.).
    foreach (range(1, 25) as $i) {
        $status = $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->status();

        expect($status)->not->toBe(429);
        expect($status)->not->toBe(422);
    }

    // ...and a correct login still works — no lockout ever happened.
    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});

test('production mode still throttles brute-force login attempts', function () {
    config(['demo.enabled' => false]);

    User::factory()->create(['email' => 'victim@example.com', 'password' => 'password']);

    $throttled = collect(range(1, 30))->contains(
        fn () => $this->post('/login', [
            'email' => 'victim@example.com',
            'password' => 'wrong-password',
        ])->status() === 429,
    );

    expect($throttled)->toBeTrue();
});
