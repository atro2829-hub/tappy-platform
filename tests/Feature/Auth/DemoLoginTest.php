<?php

use Inertia\Testing\AssertableInertia as Assert;

test('demo accounts are shown on the login page when demo mode is enabled', function () {
    config(['demo.enabled' => true, 'demo.password' => 'password']);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('demo.password', 'password')
            ->has('demo.accounts', 4)
            ->where('demo.accounts.0.email', 'admin@tappy.test'),
        );
});

test('demo accounts are hidden when demo mode is disabled', function () {
    config(['demo.enabled' => false]);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('demo', null),
        );
});
