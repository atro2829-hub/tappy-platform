<?php

namespace App\Auth;

use Illuminate\Http\Request;
use Laravel\Fortify\LoginRateLimiter;

/**
 * On public demo deployments (DEMO=true) the login throttle is fully disabled so
 * reviewers and buyers can test freely with the shared demo credentials — they
 * can never get locked out. Real installs keep Fortify's default failed-attempt
 * brute-force protection unchanged.
 */
class DemoAwareLoginRateLimiter extends LoginRateLimiter
{
    public function tooManyAttempts(Request $request)
    {
        if (config('demo.enabled')) {
            return false;
        }

        return parent::tooManyAttempts($request);
    }

    public function availableIn(Request $request)
    {
        if (config('demo.enabled')) {
            return 0;
        }

        return parent::availableIn($request);
    }
}
