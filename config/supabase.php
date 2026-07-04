<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supabase Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Supabase integration: database, storage, auth.
    |
    */

    'url' => env('SUPABASE_URL', 'https://npdpudrjjvcfsfrhvbyc.supabase.co'),
    'key' => env('SUPABASE_KEY'),
    'service_key' => env('SUPABASE_SERVICE_KEY'),
    'project_ref' => env('SUPABASE_PROJECT_REF', 'npdpudrjjvcfsfrhvbyc'),

    /*
    |--------------------------------------------------------------------------
    | Auth Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for Supabase Auth integration.
    | Email/phone verification is NOT required (auto-confirm enabled).
    |
    */

    'auth' => [
        'autoconfirm_email' => true,
        'autoconfirm_phone' => true,
        'enable_signup' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Storage Buckets
    |--------------------------------------------------------------------------
    |
    */

    'buckets' => [
        'public' => 'public-assets',
        'avatars' => 'avatars',
        'kyc' => 'kyc-documents',
        'tickets' => 'tickets',
        'documents' => 'documents',
    ],

];
