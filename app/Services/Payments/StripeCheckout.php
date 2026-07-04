<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin wrapper over Stripe's hosted Checkout REST API (no SDK — Laravel HTTP
 * client only). Creating a session returns a Stripe-hosted payment URL; the
 * customer enters their card on Stripe's page, so no card data ever touches us.
 */
class StripeCheckout
{
    private const BASE = 'https://api.stripe.com/v1';

    private function secret(): string
    {
        return (string) config('services.stripe.secret');
    }

    /**
     * @param  array<string, mixed>  $meta
     * @return array{id: string, url: string}|null
     */
    public function createSession(int $amountMinor, string $currency, string $successUrl, string $cancelUrl, array $meta = []): ?array
    {
        try {
            $response = Http::withToken($this->secret())
                ->connectTimeout(5)->timeout(15)->retry(2, 200, throw: false)
                ->asForm()->post(self::BASE.'/checkout/sessions', [
                    'mode' => 'payment',
                    'success_url' => $successUrl,
                    'cancel_url' => $cancelUrl,
                    'line_items[0][quantity]' => 1,
                    'line_items[0][price_data][currency]' => strtolower($currency),
                    'line_items[0][price_data][unit_amount]' => $amountMinor,
                    'line_items[0][price_data][product_data][name]' => 'Wallet funding',
                    'metadata[user_id]' => $meta['user_id'] ?? null,
                    'payment_intent_data[metadata][user_id]' => $meta['user_id'] ?? null,
                ]);

            $json = $response->json() ?? [];

            if (! $response->successful() || empty($json['id']) || empty($json['url'])) {
                return null;
            }

            return ['id' => (string) $json['id'], 'url' => (string) $json['url']];
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrieveSession(string $id): ?array
    {
        try {
            $response = Http::withToken($this->secret())
                ->connectTimeout(5)->timeout(15)->retry(2, 200, throw: false)
                ->get(self::BASE.'/checkout/sessions/'.$id);

            return $response->successful() ? ($response->json() ?? null) : null;
        } catch (Throwable) {
            return null;
        }
    }
}
