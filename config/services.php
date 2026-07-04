<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Top-up Provider
    |--------------------------------------------------------------------------
    |
    | Tappy talks to a top-up provider (Reloadly) through a driver abstraction.
    | Use the "fake" driver for offline development and tests so nothing hits
    | the network; switch to "reloadly" once sandbox credentials are present.
    |
    */

    'topup' => [
        'driver' => env('PROVIDER_DRIVER', 'fake'),
        // Optional read-path fallback: operator detection fails over here when
        // the primary can't resolve it. Sends always stay on the primary.
        'fallback_driver' => env('PROVIDER_FALLBACK_DRIVER'),
    ],

    // Gift cards can run on a different provider than airtime/data top-ups.
    // Left unset, they inherit the top-up driver (Reloadly fulfils both).
    'giftcard' => [
        'driver' => env('GIFTCARD_DRIVER'),
        // Optional read-path fallback for the catalog (orders stay on primary).
        'fallback_driver' => env('GIFTCARD_FALLBACK_DRIVER'),
    ],

    'payments' => [
        'driver' => env('PAYMENT_DRIVER', 'fake'),
    ],

    'dingconnect' => [
        'api_key' => env('DINGCONNECT_API_KEY'),
        // Sandbox mode sends every transfer as a provider-side dry-run
        // (ValidateOnly) so no real airtime is delivered while testing.
        'sandbox' => (bool) env('DINGCONNECT_SANDBOX', true),
    ],

    'reloadly' => [
        'client_id' => env('RELOADLY_CLIENT_ID'),
        'client_secret' => env('RELOADLY_CLIENT_SECRET'),
        'sandbox' => (bool) env('RELOADLY_SANDBOX', true),
        'webhook_secret' => env('RELOADLY_WEBHOOK_SECRET'),
        // Per-row pacing (ms) for bulk processing so a large batch doesn't
        // hammer Reloadly. 0 = no delay (dev/tests). Set e.g. 50 in production.
        'bulk_delay_ms' => (int) env('RELOADLY_BULK_DELAY_MS', 0),
    ],

    'dtone' => [
        'api_key' => env('DTONE_API_KEY'),
        'api_secret' => env('DTONE_API_SECRET'),
        // Sandbox routes to DT One's pre-production host.
        'sandbox' => (bool) env('DTONE_SANDBOX', true),
    ],

    'tremendous' => [
        'api_key' => env('TREMENDOUS_API_KEY'),
        'sandbox' => (bool) env('TREMENDOUS_SANDBOX', true),
    ],

    'tillo' => [
        'api_key' => env('TILLO_API_KEY'),
        'secret' => env('TILLO_SECRET'),
        // Your Tillo business sector classification (sent on every issuance).
        'sector' => env('TILLO_SECTOR', 'marketplace'),
        'sandbox' => (bool) env('TILLO_SANDBOX', true),
    ],

    'giftbit' => [
        'api_key' => env('GIFTBIT_API_KEY'),
        // Sandbox routes to Giftbit's testbed environment.
        'sandbox' => (bool) env('GIFTBIT_SANDBOX', true),
    ],

    'tango' => [
        'platform_name' => env('TANGO_PLATFORM_NAME'),
        'platform_key' => env('TANGO_PLATFORM_KEY'),
        // The funding account orders draw on.
        'account_identifier' => env('TANGO_ACCOUNT_IDENTIFIER'),
        'customer_identifier' => env('TANGO_CUSTOMER_IDENTIFIER'),
        'sandbox' => (bool) env('TANGO_SANDBOX', true),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    /*
    | AI Copilot LLM provider. "fake" is a deterministic, network-free engine so
    | the copilot works (and tests run) without any key; set AI_DRIVER to one of
    | anthropic | openai | openrouter | groq | gemini once a key is present
    | (all configurable from System Settings → Integrations → AI Copilot).
    */
    'ai' => [
        'driver' => env('AI_DRIVER', 'fake'),
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-5-haiku-latest'),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    'openrouter' => [
        'key' => env('OPENROUTER_API_KEY'),
        'model' => env('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct:free'),
    ],

    'groq' => [
        'key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    ],

];
