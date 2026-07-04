<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\DtOne\DtOneClient;
use App\Services\Providers\DtOne\DtOneTopUpProvider;
use Illuminate\Support\Facades\Http;

function dtOneProvider(bool $sandbox = true): DtOneTopUpProvider
{
    return new DtOneTopUpProvider(new DtOneClient('key', 'secret', sandbox: $sandbox));
}

function dtOneOrder(string $productId = '4001', string $id = 'ref-1'): TopUpOrder
{
    return new TopUpOrder($productId, 5.0, false, '+2348012345678', 'NG', $id);
}

it('detects an operator and parses its primary product', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/lookup/mobile-number' => Http::response([
            ['id' => 540, 'name' => 'MTN Nigeria', 'country' => ['iso2' => 'NG']],
        ]),
        'preprod-dvs-api.dtone.com/v1/products*' => Http::response([
            [
                'id' => 4001,
                'name' => 'MTN 1000 NGN',
                'type' => 'FIXED_VALUE_RECHARGE',
                'destination' => ['amount' => 1000.0, 'unit' => 'NGN'],
                'source' => ['amount' => 1.0, 'unit' => 'USD'],
            ],
        ]),
    ]);

    $op = dtOneProvider()->detectOperator('+2348012345678', 'NG');

    expect($op)->not->toBeNull()
        ->and($op->operatorId)->toBe('4001')   // product id drives the transaction
        ->and($op->name)->toBe('MTN Nigeria')
        ->and($op->denominationType)->toBe('FIXED')
        ->and($op->localCurrency)->toBe('NGN')
        ->and($op->fxRate)->toBe(1000.0)
        ->and($op->fixedAmounts)->toBe([1000.0]);
});

it('prefers a fixed-value product (orderable with just its id) over a ranged one', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/lookup/mobile-number' => Http::response([
            ['id' => 540, 'name' => 'MTN', 'country' => ['iso_code' => 'NGA']],
        ]),
        'preprod-dvs-api.dtone.com/v1/products*' => Http::response([
            ['id' => 9001, 'type' => 'RANGED_VALUE_RECHARGE', 'destination' => ['amount' => ['min' => 1, 'max' => 50], 'unit' => 'NGN'], 'source' => ['amount' => ['min' => 1, 'max' => 50]]],
            ['id' => 9002, 'type' => 'FIXED_VALUE_RECHARGE', 'destination' => ['amount' => 1000.0, 'unit' => 'NGN'], 'source' => ['amount' => 1.0]],
        ]),
    ]);

    $op = dtOneProvider()->detectOperator('+2348012345678', 'NG');

    expect($op->operatorId)->toBe('9002')->and($op->denominationType)->toBe('FIXED');
});

it('returns null when the number resolves to no operator', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/lookup/mobile-number' => Http::response([]),
    ]);

    expect(dtOneProvider()->detectOperator('+10000000000', 'ZZ'))->toBeNull();
});

it('sends a successful transaction', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'id' => 778899,
            'external_id' => 'ref-1',
            'status' => ['id' => 7, 'message' => 'COMPLETED', 'class' => ['id' => 7, 'message' => 'COMPLETED']],
        ]),
    ]);

    $result = dtOneProvider()->sendTopUp(dtOneOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('778899')
        ->and($result->providerStatus)->toBe('COMPLETED');
});

it('treats a confirmed (not yet completed) transaction as still processing', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'id' => 5, 'status' => ['message' => 'CONFIRMED'],
        ]),
    ]);

    expect(dtOneProvider()->sendTopUp(dtOneOrder())->status)->toBe(TransactionStatus::Processing);
});

it('treats a declined transaction (with variant suffix) as failed', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'id' => 6, 'status' => ['message' => 'DECLINED-INVALID-CREDIT-PARTY'],
        ]),
    ]);

    expect(dtOneProvider()->sendTopUp(dtOneOrder())->status)->toBe(TransactionStatus::Failed);
});

it('maps a created/processing transaction to in-flight', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'id' => 1,
            'status' => ['message' => 'CREATED'],
        ]),
    ]);

    expect(dtOneProvider()->sendTopUp(dtOneOrder())->status)->toBe(TransactionStatus::Processing);
});

it('treats a rejected transaction as a failure', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'errors' => [['code' => 1, 'message' => 'Insufficient balance']],
        ], 400),
    ]);

    $result = dtOneProvider()->sendTopUp(dtOneOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->message)->toContain('Insufficient balance');
});

it('sends basic auth, external_id, product_id and the credit party identifier', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/sync/transactions' => Http::response([
            'id' => 5, 'status' => ['message' => 'SUCCESSFUL'],
        ]),
    ]);

    dtOneProvider()->sendTopUp(dtOneOrder('4002', 'ref-99'));

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->hasHeader('Authorization', 'Basic '.base64_encode('key:secret'))
            && $body['external_id'] === 'ref-99'
            && $body['product_id'] === 4002
            && $body['auto_confirm'] === true
            && $body['credit_party_identifier']['mobile_number'] === '+2348012345678';
    });
});

it('targets the production host when not in sandbox', function () {
    Http::fake([
        'dvs-api.dtone.com/v1/sync/transactions' => Http::response(['id' => 1, 'status' => ['message' => 'SUCCESSFUL']]),
    ]);

    dtOneProvider(sandbox: false)->sendTopUp(dtOneOrder());

    Http::assertSent(fn ($request) => str_contains($request->url(), 'dvs-api.dtone.com')
        && ! str_contains($request->url(), 'preprod'));
});

it('looks up a transaction by id', function () {
    Http::fake([
        'preprod-dvs-api.dtone.com/v1/transactions/778899' => Http::response([
            'id' => 778899,
            'status' => ['message' => 'COMPLETED'],
        ]),
    ]);

    $result = dtOneProvider()->getTransaction('778899');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('778899');
});
