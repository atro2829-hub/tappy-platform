<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Giftbit\GiftbitClient;
use App\Services\Providers\Giftbit\GiftbitGiftCardProvider;
use Illuminate\Support\Facades\Http;

function giftbitProvider(bool $sandbox = true): GiftbitGiftCardProvider
{
    return new GiftbitGiftCardProvider(new GiftbitClient('gb_key', sandbox: $sandbox));
}

function giftbitOrder(string $brand = 'amazon', string $id = 'gc-ref-1'): GiftCardOrder
{
    return new GiftCardOrder($brand, 1, 25.0, 'jane@example.com', 'email', 'US', $id, 'Tappy');
}

it('lists brands, pulling denominations from each brand detail', function () {
    // The /brands list carries no pricing, so detail (with min/max) is fetched
    // per brand. Detail patterns must precede the wildcard list pattern.
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/brands/amazon' => Http::response([
            'brand' => ['brand_code' => 'amazon', 'variable_price' => true, 'min_price_in_cents' => 1000, 'max_price_in_cents' => 5000],
        ]),
        'api-testbed.giftbit.com/papi/v1/brands/visa' => Http::response([
            'brand' => ['brand_code' => 'visa', 'variable_price' => true, 'min_price_in_cents' => 500, 'max_price_in_cents' => 10000],
        ]),
        'api-testbed.giftbit.com/papi/v1/brands*' => Http::response([
            'brands' => [
                ['brand_code' => 'amazon', 'name' => 'Amazon', 'image_url' => 'https://img/a.png'],
                ['brand_code' => 'visa', 'name' => 'Visa'],
            ],
        ]),
    ]);

    $products = giftbitProvider()->listProducts();

    expect($products)->toHaveCount(2);
    expect($products[0]['id'])->toBe('amazon')
        ->and($products[0]['denoms'])->toBe([10.0, 25.0, 50.0])   // common values in [10, 50]
        ->and($products[0]['logo'])->toBe('https://img/a.png')
        ->and($products[1]['denoms'])->toBe([5.0, 10.0, 25.0, 50.0, 100.0]); // common values in [5, 100]
});

it('returns an empty catalog when the request fails', function () {
    Http::fake(['api-testbed.giftbit.com/papi/v1/brands*' => Http::response([], 500)]);

    expect(giftbitProvider()->listProducts())->toBe([]);
});

it('creates a campaign for an order', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'campaign' => ['uuid' => 'CMP-123', 'status' => 'CAMPAIGN_CREATED'],
        ]),
    ]);

    $result = giftbitProvider()->order(giftbitOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('CMP-123')
        ->and($result->providerStatus)->toBe('CAMPAIGN_CREATED');
});

it('maps an awaiting-funds campaign to processing', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'campaign' => ['uuid' => 'CMP-2', 'status' => 'AWAITING_FUNDS'],
        ]),
    ]);

    expect(giftbitProvider()->order(giftbitOrder())->status)->toBe(TransactionStatus::Processing);
});

it('creates one campaign per unit of quantity', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'campaign' => ['uuid' => 'CMP', 'status' => 'CAMPAIGN_CREATED'],
        ]),
    ]);

    $order = new GiftCardOrder('amazon', 3, 10.0, 'jane@example.com', 'email', 'US', 'q3', 'Tappy');
    giftbitProvider()->order($order);

    Http::assertSentCount(3);
});

it('treats a campaign error as a failure', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'error' => ['message' => 'Insufficient funds'],
        ], 422),
    ]);

    $result = giftbitProvider()->order(giftbitOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->message)->toContain('Insufficient funds');
});

it('sends bearer auth, the client id, brand code and price in cents', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'campaign' => ['uuid' => 'CMP-3', 'status' => 'CAMPAIGN_CREATED'],
        ]),
    ]);

    giftbitProvider()->order(giftbitOrder('starbucks', 'gc-ref-55'));

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->hasHeader('Authorization', 'Bearer gb_key')
            && $body['id'] === 'gc-ref-55'
            && $body['brand_codes'] === ['starbucks']
            && $body['price_in_cents'] === 2500
            && $body['contacts'][0]['email'] === 'jane@example.com'
            && $body['delivery_type'] === 'GIFTBIT_EMAIL';
    });
});

it('uses shortlink delivery for non-email orders', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign' => Http::response([
            'campaign' => ['uuid' => 'CMP-4', 'status' => 'CAMPAIGN_CREATED'],
        ]),
    ]);

    $order = new GiftCardOrder('amazon', 1, 10.0, '+15551234567', 'sms', 'US', 'sms1', 'Tappy');
    giftbitProvider()->order($order);

    Http::assertSent(fn ($request) => $request->data()['delivery_type'] === 'SHORTLINK');
});

it('retrieves a campaign by id', function () {
    Http::fake([
        'api-testbed.giftbit.com/papi/v1/campaign/CMP-9' => Http::response([
            'campaign' => ['uuid' => 'CMP-9', 'status' => 'CAMPAIGN_CREATED'],
        ]),
    ]);

    $result = giftbitProvider()->getOrder('CMP-9');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('CMP-9');
});

it('targets the production host when not in sandbox', function () {
    Http::fake([
        'api.giftbit.com/papi/v1/campaign' => Http::response(['campaign' => ['uuid' => 'x', 'status' => 'CAMPAIGN_CREATED']]),
    ]);

    giftbitProvider(sandbox: false)->order(giftbitOrder());

    Http::assertSent(fn ($request) => str_contains($request->url(), 'api.giftbit.com')
        && ! str_contains($request->url(), 'testbed'));
});
