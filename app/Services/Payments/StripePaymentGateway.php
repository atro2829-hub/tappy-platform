<?php

namespace App\Services\Payments;

use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Payments\Data\PaymentResult;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Stripe-backed payment gateway. Funds the wallet by creating and confirming a
 * Stripe PaymentIntent via the REST API (no SDK — Laravel's HTTP client only).
 *
 * IMPORTANT — integration seam: this server-side path confirms an off-session /
 * test payment method (e.g. `pm_card_visa`) and is intended for tests and
 * key-ready wiring. A full production card flow must instead:
 *   1. Create the PaymentIntent on the server and return its `client_secret`.
 *   2. Collect and confirm the card client-side with Stripe.js (PaymentElement)
 *      so SCA / 3-D Secure challenges can be presented to the cardholder.
 *   3. Treat the asynchronous `payment_intent.succeeded` webhook (verified with
 *      `services.stripe.webhook_secret`) as the source of truth for funding.
 * The method below is the natural seam to extend for that flow.
 */
final class StripePaymentGateway implements PaymentGateway
{
    private const PAYMENT_INTENTS_URL = 'https://api.stripe.com/v1/payment_intents';

    public function __construct(private readonly string $secret) {}

    public function charge(int $amountMinor, string $currency, array $meta = []): PaymentResult
    {
        try {
            $response = Http::withToken($this->secret)
                ->connectTimeout(5)->timeout(15)->retry(2, 200, throw: false)
                ->asForm()
                ->post(self::PAYMENT_INTENTS_URL, [
                    'amount' => $amountMinor,
                    'currency' => strtolower($currency),
                    'confirm' => 'true',
                    'payment_method' => 'pm_card_visa',
                    'automatic_payment_methods[enabled]' => 'true',
                    'automatic_payment_methods[allow_redirects]' => 'never',
                    'metadata[user_id]' => $meta['user_id'] ?? null,
                ]);

            $json = $response->json() ?? [];

            return new PaymentResult(
                approved: ($json['status'] ?? '') === 'succeeded',
                reference: (string) ($json['id'] ?? ''),
                message: isset($json['error']['message']) ? (string) $json['error']['message'] : null,
            );
        } catch (Throwable $e) {
            return new PaymentResult(
                approved: false,
                reference: '',
                message: $e->getMessage(),
            );
        }
    }
}
