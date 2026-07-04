<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Reloadly\ReloadlyClient;
use App\Services\Providers\Reloadly\ReloadlyTopUpProvider;
use Illuminate\Support\Facades\Http;

function reloadlyProvider(): ReloadlyTopUpProvider
{
    return new ReloadlyTopUpProvider(new ReloadlyClient('test-id', 'test-secret', sandbox: true));
}

function reloadlyOrder(string $phone = '+2348012345678', string $id = 'ref-1'): TopUpOrder
{
    return new TopUpOrder('341', 5.0, false, $phone, 'NG', $id);
}

function fakeAuth(): array
{
    return ['auth.reloadly.com/*' => Http::response(['access_token' => 'tok', 'expires_in' => 86400])];
}

it('detects an operator and parses the response', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/operators/auto-detect/*' => Http::response([
            'operatorId' => 341,
            'name' => 'MTN Nigeria',
            'denominationType' => 'RANGE',
            'senderCurrencyCode' => 'USD',
            'destinationCurrencyCode' => 'NGN',
            'fx' => ['rate' => 1600.5],
            'localMinAmount' => 100,
            'localMaxAmount' => 500000,
            'country' => ['isoName' => 'NG'],
        ]),
    ]);

    $op = reloadlyProvider()->detectOperator('+2348012345678', 'NG');

    expect($op)->not->toBeNull()
        ->and($op->operatorId)->toBe('341')
        ->and($op->localCurrency)->toBe('NGN')
        ->and($op->fxRate)->toBe(1600.5)
        ->and($op->maxLocal)->toBe(500000.0);
});

it('returns null when no operator is detected', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/operators/auto-detect/*' => Http::response([], 404),
    ]);

    expect(reloadlyProvider()->detectOperator('+10000000000', 'ZZ'))->toBeNull();
});

it('sends a successful top-up', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/topups' => Http::response([
            'transactionId' => 999001,
            'status' => 'SUCCESSFUL',
            'operatorId' => 341,
        ]),
    ]);

    $result = reloadlyProvider()->sendTopUp(reloadlyOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('999001')
        ->and($result->providerStatus)->toBe('SUCCESSFUL');
});

it('maps a processing top-up to in-flight', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/topups' => Http::response(['transactionId' => 5, 'status' => 'PROCESSING']),
    ]);

    expect(reloadlyProvider()->sendTopUp(reloadlyOrder())->status)->toBe(TransactionStatus::Processing);
});

it('treats a provider error as a failure', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/topups' => Http::response(['message' => 'Insufficient balance'], 400),
    ]);

    $result = reloadlyProvider()->sendTopUp(reloadlyOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->providerStatus)->toBe('FAILED');
});

it('caches the OAuth token across calls', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/topups' => Http::response(['transactionId' => 1, 'status' => 'SUCCESSFUL']),
    ]);

    $provider = reloadlyProvider();
    $provider->sendTopUp(reloadlyOrder('+2348012345678', 'a'));
    $provider->sendTopUp(reloadlyOrder('+2348012345678', 'b'));

    // One auth call (token reused from cache) + two top-up calls.
    Http::assertSentCount(3);
});

it('sends the bearer token and versioned accept header', function () {
    Http::fake([
        ...fakeAuth(),
        'topups-sandbox.reloadly.com/topups' => Http::response(['transactionId' => 1, 'status' => 'SUCCESSFUL']),
    ]);

    reloadlyProvider()->sendTopUp(reloadlyOrder());

    Http::assertSent(function ($request) {
        if (! str_contains($request->url(), '/topups')) {
            return true;
        }

        return $request->hasHeader('Authorization', 'Bearer tok')
            && $request->hasHeader('Accept', 'application/com.reloadly.topups-v1+json');
    });
});
