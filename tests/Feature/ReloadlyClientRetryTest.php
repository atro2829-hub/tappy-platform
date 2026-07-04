<?php

use App\Services\Providers\Reloadly\ReloadlyClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * The client must NOT resend a write that already reached Reloadly: a gift-card
 * `/orders` consumes its customIdentifier even on a rejected attempt, so a blind
 * retry double-charges or masks the outcome behind "reference already used".
 * Only a connection-level failure (request provably never sent) may be retried.
 */
beforeEach(function () {
    config()->set('services.reloadly.client_id', 'test-id');
    config()->set('services.reloadly.client_secret', 'test-secret');
    config()->set('services.reloadly.sandbox', true);
    // Pre-seed the OAuth token so the client doesn't try to authenticate.
    Cache::put('reloadly:giftcards:token:sandbox', 'token-123', now()->addHour());
});

it('does not retry a 4xx response on a write (no double-send)', function () {
    Http::fake([
        'giftcards-sandbox.reloadly.com/*' => Http::response(['message' => 'INVALID_INPUT_PROVIDED'], 400),
    ]);

    $client = ReloadlyClient::fromConfig('giftcards');

    expect(fn () => $client->post('/orders', ['productId' => 1]))
        ->toThrow(RequestException::class);

    // Exactly one POST — the 400 was surfaced, never resent.
    Http::assertSentCount(1);
});

it('retries when the connection never reaches Reloadly', function () {
    $attempts = 0;

    Http::fake(function () use (&$attempts) {
        $attempts++;

        if ($attempts < 2) {
            throw new ConnectionException('Connection timed out');
        }

        return Http::response(['status' => 'SUCCESSFUL', 'transactionId' => 999], 200);
    });

    $client = ReloadlyClient::fromConfig('giftcards');

    $result = $client->post('/orders', ['productId' => 1]);

    expect($result['transactionId'])->toBe(999)
        ->and($attempts)->toBe(2);
});
