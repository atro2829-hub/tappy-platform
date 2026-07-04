<?php

use App\Services\Payments\StripePaymentGateway;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

function stripeGateway(): StripePaymentGateway
{
    return new StripePaymentGateway('sk_test_x');
}

it('approves when Stripe reports the payment intent succeeded', function () {
    Http::fake([
        'api.stripe.com/v1/payment_intents' => Http::response(['id' => 'pi_123', 'status' => 'succeeded']),
    ]);

    $result = stripeGateway()->charge(5000, 'USD', ['user_id' => 7]);

    expect($result->approved)->toBeTrue()
        ->and($result->reference)->toBe('pi_123')
        ->and($result->message)->toBeNull();
});

it('declines when Stripe returns an error response', function () {
    Http::fake([
        'api.stripe.com/v1/payment_intents' => Http::response(['error' => ['message' => 'card_declined']], 402),
    ]);

    $result = stripeGateway()->charge(5000, 'USD');

    expect($result->approved)->toBeFalse()
        ->and($result->reference)->toBe('')
        ->and($result->message)->toBe('card_declined');
});

it('sends the bearer token and form-encoded payment intent payload', function () {
    Http::fake([
        'api.stripe.com/v1/payment_intents' => Http::response(['id' => 'pi_456', 'status' => 'succeeded']),
    ]);

    stripeGateway()->charge(1200, 'EUR', ['user_id' => 42]);

    Http::assertSent(function (Request $request) {
        return $request->hasHeader('Authorization', 'Bearer sk_test_x')
            && $request->hasHeader('Content-Type', 'application/x-www-form-urlencoded')
            && $request['amount'] === 1200
            && $request['currency'] === 'eur'
            && $request['confirm'] === 'true'
            && $request['payment_method'] === 'pm_card_visa'
            && $request['metadata[user_id]'] === 42;
    });
});

it('returns a declined result when the request throws', function () {
    Http::fake(function () {
        throw new RuntimeException('connection reset');
    });

    $result = stripeGateway()->charge(5000, 'USD');

    expect($result->approved)->toBeFalse()
        ->and($result->reference)->toBe('')
        ->and($result->message)->toBe('connection reset');
});
