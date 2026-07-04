<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verifies the HMAC signature on an incoming Reloadly webhook.
 *
 * When RELOADLY_WEBHOOK_SECRET is empty (e.g. local/sandbox) verification is
 * skipped. Confirm the exact header name and algorithm against your Reloadly
 * dashboard before relying on this in production.
 */
class VerifyReloadlyWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('services.reloadly.webhook_secret');

        if ($secret === '') {
            // No secret configured. Tolerated outside production (local/sandbox);
            // in production we fail closed so a forged callback can't move money.
            abort_if(app()->isProduction(), 403, 'Webhook secret not configured.');

            return $next($request);
        }

        $signature = (string) $request->header('X-Reloadly-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        abort_unless(
            $signature !== '' && hash_equals($expected, $signature),
            403,
            'Invalid webhook signature.',
        );

        return $next($request);
    }
}
