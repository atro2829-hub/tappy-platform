<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Tango\TangoClient;
use App\Services\Providers\Tango\TangoGiftCardProvider;
use Illuminate\Support\Facades\Http;

function tangoProvider(bool $sandbox = true): TangoGiftCardProvider
{
    return new TangoGiftCardProvider(new TangoClient('platform', 'key', sandbox: $sandbox), 'acct-1', 'cust-1');
}

function tangoOrder(string $utid = 'U123', string $id = 'gc-ref-1'): GiftCardOrder
{
    return new GiftCardOrder($utid, 1, 25.0, 'jane@example.com', 'email', 'US', $id, 'Tappy');
}

it('flattens the catalog into products', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/catalogs' => Http::response([
            'brands' => [[
                'brandName' => 'Amazon',
                'imageUrls' => ['80w-326ppi' => 'https://img/amazon.png'],
                'items' => [
                    ['utid' => 'U-AMZN-10', 'rewardName' => 'Amazon $10', 'valueType' => 'FIXED_VALUE', 'faceValue' => 10.0, 'countries' => ['US']],
                    ['utid' => 'U-AMZN-VAR', 'rewardName' => 'Amazon Variable', 'valueType' => 'VARIABLE_VALUE', 'minValue' => 5.0, 'maxValue' => 100.0, 'countries' => ['US']],
                ],
            ]],
        ]),
    ]);

    $products = tangoProvider()->listProducts();

    expect($products)->toHaveCount(2);
    expect($products[0]['id'])->toBe('U-AMZN-10')
        ->and($products[0]['brand'])->toBe('Amazon')
        ->and($products[0]['denoms'])->toBe([10.0])
        ->and($products[0]['logo'])->toBe('https://img/amazon.png')
        ->and($products[1]['denoms'])->toBe([5.0, 52.5, 100.0]);
});

it('filters catalog items by country', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/catalogs' => Http::response([
            'brands' => [[
                'brandName' => 'Brand',
                'items' => [
                    ['utid' => 'US1', 'valueType' => 'FIXED_VALUE', 'faceValue' => 10, 'countries' => ['US']],
                    ['utid' => 'GB1', 'valueType' => 'FIXED_VALUE', 'faceValue' => 10, 'countries' => ['GB']],
                ],
            ]],
        ]),
    ]);

    $products = tangoProvider()->listProducts('GB');

    expect($products)->toHaveCount(1)->and($products[0]['id'])->toBe('GB1');
});

it('returns an empty catalog when the request fails', function () {
    Http::fake(['integration-api.tangocard.com/raas/v2/catalogs' => Http::response([], 500)]);

    expect(tangoProvider()->listProducts())->toBe([]);
});

it('places a completed order', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders' => Http::response([
            'referenceOrderID' => 'TANGO-REF-1',
            'status' => 'COMPLETE',
        ]),
    ]);

    $result = tangoProvider()->order(tangoOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('TANGO-REF-1')
        ->and($result->providerStatus)->toBe('COMPLETE');
});

it('maps a pending order to processing', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders' => Http::response([
            'referenceOrderID' => 'TANGO-2', 'status' => 'PENDING',
        ]),
    ]);

    expect(tangoProvider()->order(tangoOrder())->status)->toBe(TransactionStatus::Processing);
});

it('creates one order per unit of quantity', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders' => Http::response([
            'referenceOrderID' => 'TANGO', 'status' => 'COMPLETE',
        ]),
    ]);

    $order = new GiftCardOrder('U123', 3, 10.0, 'jane@example.com', 'email', 'US', 'q3', 'Tappy');
    tangoProvider()->order($order);

    Http::assertSentCount(3);
});

it('treats an order error as a failure', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders' => Http::response(['message' => 'Insufficient funds'], 400),
    ]);

    $result = tangoProvider()->order(tangoOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->message)->toContain('Insufficient funds');
});

it('sends basic auth, the utid, amount, account and customer identifiers and externalRefID', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders' => Http::response([
            'referenceOrderID' => 'x', 'status' => 'COMPLETE',
        ]),
    ]);

    tangoProvider()->order(tangoOrder('U-AMZN-25', 'gc-ref-88'));

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->hasHeader('Authorization', 'Basic '.base64_encode('platform:key'))
            && $body['utid'] === 'U-AMZN-25'
            && $body['amount'] === 25.0
            && $body['accountIdentifier'] === 'acct-1'
            && $body['customerIdentifier'] === 'cust-1'
            && $body['externalRefID'] === 'gc-ref-88'
            && $body['deliveryMethod'] === 'EMAIL'
            && $body['recipient']['email'] === 'jane@example.com';
    });
});

it('targets the production host when not in sandbox', function () {
    Http::fake([
        'api.tangocard.com/raas/v2/orders' => Http::response(['referenceOrderID' => 'x', 'status' => 'COMPLETE']),
    ]);

    tangoProvider(sandbox: false)->order(tangoOrder());

    Http::assertSent(fn ($request) => str_contains($request->url(), 'api.tangocard.com')
        && ! str_contains($request->url(), 'integration-api'));
});

it('retrieves an order by reference', function () {
    Http::fake([
        'integration-api.tangocard.com/raas/v2/orders/TANGO-REF-1' => Http::response([
            'referenceOrderID' => 'TANGO-REF-1', 'status' => 'COMPLETE',
        ]),
    ]);

    $result = tangoProvider()->getOrder('TANGO-REF-1');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('TANGO-REF-1');
});
