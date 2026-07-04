<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo Mode
    |--------------------------------------------------------------------------
    |
    | When enabled, the login page surfaces the seeded demo accounts as
    | one-click "log in as" buttons. Keep this OFF in real production sites.
    |
    */

    'enabled' => (bool) env('DEMO', false),

    /**
     * Shared password for every seeded demo account.
     */
    'password' => env('DEMO_PASSWORD', 'password'),

    /**
     * The accounts shown on the login page when demo mode is enabled.
     *
     * @var array<int, array{role: string, email: string, description: string}>
     */
    'accounts' => [
        ['role' => 'Admin', 'email' => 'admin@tappy.test', 'description' => 'Full platform back office'],
        ['role' => 'Business', 'email' => 'business@tappy.test', 'description' => 'Sell airtime, data & gift cards'],
        ['role' => 'Reseller', 'email' => 'reseller@tappy.test', 'description' => 'Manage customers & commissions'],
        ['role' => 'Customer', 'email' => 'customer@tappy.test', 'description' => 'Personal top-ups & gift cards'],
    ],

];
