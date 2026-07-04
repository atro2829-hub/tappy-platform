<?php

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'account_type' => 'customer',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    expect(User::query()->where('email', 'test@example.com')->first()->role->value)->toBe('customer');
});

test('registering as a business sets the role and business name', function () {
    $this->post(route('register.store'), [
        'name' => 'Biz Owner',
        'email' => 'biz@example.com',
        'account_type' => 'business',
        'business_name' => 'Acme Ltd',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect();

    $user = User::query()->where('email', 'biz@example.com')->first();
    expect($user->role->value)->toBe('business')
        ->and($user->business_name)->toBe('Acme Ltd');
});

test('a business or reseller signup requires a business name', function () {
    $this->post(route('register.store'), [
        'name' => 'Biz Owner',
        'email' => 'biz2@example.com',
        'account_type' => 'business',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('business_name');
});

test('visitors cannot self-register as an admin', function () {
    $this->post(route('register.store'), [
        'name' => 'Sneaky',
        'email' => 'sneaky@example.com',
        'account_type' => 'admin',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('account_type');

    expect(User::query()->where('email', 'sneaky@example.com')->exists())->toBeFalse();
});
