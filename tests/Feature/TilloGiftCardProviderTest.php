<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Tillo\TilloClient;
use App\Services\Providers\Tillo\TilloGiftCardProvider;
use Illuminate\Support\Facades\Http;

function tilloProvider(): TilloGiftCardProvider
{
    return new TilloGiftCardProvider(new TilloClient('tillo_key', 'tillo_secret', sandbox: true), 'marketplace');
}

function tilloOrder(string $brand = 'amazon', string $id = 'gc-ref-1'): GiftCardOrder
{
    return new GiftCardOrder($brand, 1, 25.0, 'jane@example.com', 'email', 'US', $id, 'Tappy');
}

it('lists and normalizes brands', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/brands*' => Http::response([
            'data' => ['brands' => [[
                'brand' => 'amazon',
                'name' => 'Amazon',
                'category' => 'eCommerce',
                'denominations' => [10, 25, 50],
                'countries' => ['US', 'gb'],
                'logo' => 'https://img/amazon.png',
            ]]],
        ]),
    ]);

    $products = tilloProvider()->listProducts();

    expect($products)->toHaveCount(1);
    expect($products[0]['id'])->toBe('amazon')
        ->and($products[0]['brand'])->toBe('Amazon')
        ->and($products[0]['denoms'])->toBe([10.0, 25.0, 50.0])
        ->and($products[0]['countries'])->toBe(['US', 'GB'])
        ->and($products[0]['logo'])->toBe('https://img/amazon.png');
});

it('expands a variable denomination range', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/brands*' => Http::response([
            'data' => ['brands' => [[
                'brand' => 'visa',
                'name' => 'Visa',
                'denominations' => ['from' => 10, 'to' => 100],
                'countries' => [],
            ]]],
        ]),
    ]);

    expect(tilloProvider()->listProducts()[0]['denoms'])->toBe([10.0, 55.0, 100.0]);
});

it('filters brands by country', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/brands*' => Http::response([
            'data' => ['brands' => [
                ['brand' => 'us-only', 'name' => 'US Only', 'countries' => ['US']],
                ['brand' => 'gb-only', 'name' => 'GB Only', 'countries' => ['GB']],
            ]],
        ]),
    ]);

    $products = tilloProvider()->listProducts('GB');

    expect($products)->toHaveCount(1)->and($products[0]['id'])->toBe('gb-only');
});

it('signs the brands request with the correct HMAC', function () {
    Http::fake(['sandbox.tillo.dev/api/v2/brands*' => Http::response(['data' => ['brands' => []]])]);

    tilloProvider()->listProducts();

    Http::assertSent(function ($request) {
        $timestamp = $request->header('Timestamp')[0];
        $expected = hash_hmac('sha256', 'tillo_key-GET-brands-'.$timestamp, 'tillo_secret');

        return $request->hasHeader('API-Key', 'tillo_key')
            && $request->header('Signature')[0] === $expected;
    });
});

it('places an order and signs it with the request id and brand', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/digital/issue' => Http::response([
            'status' => 'success',
            'data' => ['reference' => 'TILLO-REF-9', 'code' => 'ABCD-EFGH', 'url' => 'https://t/redeem'],
        ]),
    ]);

    $result = tilloProvider()->order(tilloOrder('amazon', 'gc-ref-77'));

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('TILLO-REF-9');

    Http::assertSent(function ($request) {
        $timestamp = $request->header('Timestamp')[0];
        // Signature includes currency + amount, with the amount byte-identical to the body.
        $expected = hash_hmac('sha256', 'tillo_key-POST-digital-issue-gc-ref-77-amazon-USD-25.00-'.$timestamp, 'tillo_secret');
        $body = $request->data();

        return $request->header('Signature')[0] === $expected
            && $body['brand'] === 'amazon'
            && $body['client_request_id'] === 'gc-ref-77'
            && $body['face_value']['amount'] === '25.00'
            && $body['face_value']['currency'] === 'USD'
            && $body['delivery_method'] === 'code'
            && $body['sector'] === 'marketplace';
    });
});

it('issues one card per unit of quantity', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/digital/issue' => Http::response([
            'status' => 'success',
            'data' => ['reference' => 'TILLO-REF', 'code' => 'X'],
        ]),
    ]);

    $order = new GiftCardOrder('amazon', 3, 10.0, 'jane@example.com', 'email', 'US', 'q3', 'Tappy');
    tilloProvider()->order($order);

    Http::assertSentCount(3);
});

it('treats an order error as a failure', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/digital/issue' => Http::response(['message' => 'Insufficient float'], 422),
    ]);

    $result = tilloProvider()->order(tilloOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->message)->toContain('Insufficient float');
});

it('returns an empty catalog when the brands request fails', function () {
    Http::fake(['sandbox.tillo.dev/api/v2/brands*' => Http::response([], 500)]);

    expect(tilloProvider()->listProducts())->toBe([]);
});

it('checks an order via the order-status endpoint with a correctly signed request', function () {
    Http::fake([
        'sandbox.tillo.dev/api/v2/digital/order-status*' => Http::response([
            'status' => 'SUCCESS',
            'data' => ['reference' => 'TILLO-REF-9'],
        ]),
    ]);

    $result = tilloProvider()->getOrder('TILLO-REF-9');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('TILLO-REF-9');

    // GET order-status signs only apiKey-GET-digital-order-status-{ts}; the
    // reference is a query param, not part of the signature.
    Http::assertSent(function ($request) {
        $timestamp = $request->header('Timestamp')[0];
        $expected = hash_hmac('sha256', 'tillo_key-GET-digital-order-status-'.$timestamp, 'tillo_secret');

        return str_contains($request->url(), '/digital/order-status')
            && str_contains($request->url(), 'reference=TILLO-REF-9')
            && $request->header('Signature')[0] === $expected;
    });
});
