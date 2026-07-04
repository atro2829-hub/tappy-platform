<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Tremendous\TremendousClient;
use App\Services\Providers\Tremendous\TremendousGiftCardProvider;
use Illuminate\Support\Facades\Http;

function tremendousProvider(bool $sandbox = true): TremendousGiftCardProvider
{
    return new TremendousGiftCardProvider(new TremendousClient('test-key', sandbox: $sandbox));
}

function tremendousOrder(string $product = 'PROD1', string $id = 'gc-ref-1'): GiftCardOrder
{
    return new GiftCardOrder($product, 1, 25.0, 'jane@example.com', 'email', 'US', $id, 'Tappy');
}

it('lists and normalizes products', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/products*' => Http::response([
            'products' => [[
                'id' => 'AMZN',
                'name' => 'Amazon',
                'category' => 'eCommerce',
                'currency_codes' => ['USD'],
                'countries' => [['abbr' => 'US'], ['abbr' => 'gb']],
                'images' => [['src' => 'https://img/amazon.png']],
                'skus' => [['min' => 10, 'max' => 10], ['min' => 25, 'max' => 25]],
            ]],
        ]),
    ]);

    $products = tremendousProvider()->listProducts('US');

    expect($products)->toHaveCount(1);
    expect($products[0]['id'])->toBe('AMZN')
        ->and($products[0]['brand'])->toBe('Amazon')
        ->and($products[0]['cat'])->toBe('eCommerce')
        ->and($products[0]['denoms'])->toBe([10.0, 25.0])
        ->and($products[0]['countries'])->toBe(['US', 'GB'])
        ->and($products[0]['logo'])->toBe('https://img/amazon.png');
});

it('expands a variable-value SKU into low/mid/high denominations', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/products*' => Http::response([
            'products' => [[
                'id' => 'VISA',
                'name' => 'Visa',
                'skus' => [['min' => 1, 'max' => 100]],
                'countries' => [],
            ]],
        ]),
    ]);

    expect(tremendousProvider()->listProducts()[0]['denoms'])->toBe([1.0, 50.5, 100.0]);
});

it('returns an empty catalog when the request fails', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/products*' => Http::response([], 500),
    ]);

    expect(tremendousProvider()->listProducts())->toBe([]);
});

it('places a successful order', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-100', 'status' => 'EXECUTED'],
        ]),
    ]);

    $result = tremendousProvider()->order(tremendousOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('ORD-100')
        ->and($result->providerStatus)->toBe('EXECUTED');
});

it('maps an open order to processing', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-2', 'status' => 'OPEN'],
        ]),
    ]);

    expect(tremendousProvider()->order(tremendousOrder())->status)->toBe(TransactionStatus::Processing);
});

it('does not mark a pending-settlement order as failed', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-2b', 'status' => 'PENDING SETTLEMENT'],
        ]),
    ]);

    expect(tremendousProvider()->order(tremendousOrder())->status)->toBe(TransactionStatus::Processing);
});

it('treats an order error as a failure', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'errors' => ['message' => 'Insufficient balance'],
        ], 422),
    ]);

    $result = tremendousProvider()->order(tremendousOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->message)->toContain('Insufficient balance');
});

it('sends bearer auth, external_id idempotency, balance funding and the reward', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-3', 'status' => 'EXECUTED'],
        ]),
    ]);

    tremendousProvider()->order(tremendousOrder('AMZN', 'gc-ref-42'));

    Http::assertSent(function ($request) {
        $body = $request->data();
        $reward = $body['reward'];

        return $request->hasHeader('Authorization', 'Bearer test-key')
            && $body['external_id'] === 'gc-ref-42'
            && $body['payment']['funding_source_id'] === 'balance'
            && ! isset($body['rewards']) // single reward object, not an array
            && $reward['products'] === ['AMZN']
            && $reward['value']['denomination'] === 25.0
            && $reward['recipient']['email'] === 'jane@example.com'
            && $reward['delivery']['method'] === 'EMAIL';
    });
});

it('creates one order per unit of quantity (single reward each)', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-4', 'status' => 'EXECUTED'],
        ]),
    ]);

    $order = new GiftCardOrder('AMZN', 3, 10.0, 'jane@example.com', 'email', 'US', 'q3', 'Tappy');
    tremendousProvider()->order($order);

    // Three separate orders, each a single-reward request with a unique external_id.
    Http::assertSentCount(3);
    Http::assertSent(fn ($request) => isset($request->data()['reward']) && ! isset($request->data()['rewards']));
});

it('delivers by phone for SMS orders', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders' => Http::response([
            'order' => ['id' => 'ORD-5', 'status' => 'EXECUTED'],
        ]),
    ]);

    $order = new GiftCardOrder('AMZN', 1, 10.0, '+15551234567', 'sms', 'US', 'sms1', 'Tappy');
    tremendousProvider()->order($order);

    Http::assertSent(function ($request) {
        $reward = $request->data()['reward'];

        return $reward['delivery']['method'] === 'PHONE'
            && $reward['recipient']['phone'] === '+15551234567';
    });
});

it('retrieves an order by id', function () {
    Http::fake([
        'testflight.tremendous.com/api/v2/orders/ORD-7' => Http::response([
            'order' => ['id' => 'ORD-7', 'status' => 'EXECUTED'],
        ]),
    ]);

    $result = tremendousProvider()->getOrder('ORD-7');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('ORD-7');
});

it('targets the production host when not in sandbox', function () {
    Http::fake([
        'api.tremendous.com/api/v2/orders' => Http::response(['order' => ['id' => 'x', 'status' => 'EXECUTED']]),
    ]);

    tremendousProvider(sandbox: false)->order(tremendousOrder());

    Http::assertSent(fn ($request) => str_contains($request->url(), 'api.tremendous.com'));
});
