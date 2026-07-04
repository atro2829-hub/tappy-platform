<?php

namespace App\Http\Controllers;

use App\Services\Payments\StripeFunding;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Receives Stripe webhooks (public; verified by signature when a webhook secret
 * is configured). On `checkout.session.completed` it credits the wallet — but
 * always re-retrieves the session from Stripe first, so even an unverified call
 * cannot fabricate a credit. Crediting is idempotent with the return-redirect.
 */
class StripeWebhookController extends Controller
{
    public function handle(Request $request, StripeFunding $funding): HttpResponse
    {
        $secret = config('services.stripe.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            // No secret configured. Crediting still re-retrieves the session
            // from Stripe so a forged call can't fabricate funds, but in
            // production we require a verified signature — fail closed.
            abort_if(app()->isProduction(), 400, 'Webhook secret not configured.');
        } elseif (! $this->signatureValid($request, $secret)) {
            abort(400);
        }

        $event = $request->json()->all();

        if (($event['type'] ?? null) === 'checkout.session.completed') {
            $sessionId = $event['data']['object']['id'] ?? null;

            if (is_string($sessionId)) {
                $funding->creditFromSession($sessionId);
            }
        }

        return response('', 200);
    }

    private function signatureValid(Request $request, string $secret): bool
    {
        $parts = [];

        foreach (explode(',', (string) $request->header('Stripe-Signature', '')) as $segment) {
            [$key, $value] = array_pad(explode('=', $segment, 2), 2, '');
            $parts[$key] = $value;
        }

        $timestamp = $parts['t'] ?? '';
        $expected = $parts['v1'] ?? '';

        if ($timestamp === '' || $expected === '') {
            return false;
        }

        $signature = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);

        return hash_equals($signature, $expected);
    }
}
