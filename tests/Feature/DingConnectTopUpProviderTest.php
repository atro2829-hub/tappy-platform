<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\DingConnect\DingConnectClient;
use App\Services\Providers\DingConnect\DingConnectTopUpProvider;
use Illuminate\Support\Facades\Http;

function dingProvider(bool $sandbox = false): DingConnectTopUpProvider
{
    return new DingConnectTopUpProvider(new DingConnectClient('test-key', sandbox: $sandbox));
}

function dingOrder(string $sku = 'AF_AW_TopUp', string $id = 'ref-1'): TopUpOrder
{
    return new TopUpOrder($sku, 5.0, false, '+2348012345678', 'NG', $id);
}

it('detects an operator and parses provider + product into an OperatorDetail', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/GetProviders*' => Http::response([
            'Items' => [['ProviderCode' => 'NGMTN', 'Name' => 'MTN Nigeria', 'CountryIso' => 'NG']],
        ]),
        'api.dingconnect.com/api/V1/GetProducts*' => Http::response([
            'Items' => [[
                'SkuCode' => 'NG_MTN_TopUp',
                'ProviderCode' => 'NGMTN',
                'Minimum' => ['SendValue' => 1.0, 'SendCurrencyIso' => 'USD', 'ReceiveValue' => 1600.0, 'ReceiveCurrencyIso' => 'NGN'],
                'Maximum' => ['SendValue' => 100.0, 'SendCurrencyIso' => 'USD', 'ReceiveValue' => 160000.0, 'ReceiveCurrencyIso' => 'NGN'],
            ]],
        ]),
    ]);

    $op = dingProvider()->detectOperator('+2348012345678', 'NG');

    expect($op)->not->toBeNull()
        ->and($op->operatorId)->toBe('NG_MTN_TopUp')   // SkuCode powers SendTransfer
        ->and($op->name)->toBe('MTN Nigeria')
        ->and($op->denominationType)->toBe('RANGE')
        ->and($op->localCurrency)->toBe('NGN')
        ->and($op->fxRate)->toBe(1600.0)
        ->and($op->minLocal)->toBe(1600.0)
        ->and($op->maxLocal)->toBe(160000.0);

    // DingConnect expects camelCase query params (snake_case is silently ignored).
    Http::assertSent(fn ($request) => ! str_contains($request->url(), 'GetProviders')
        || (str_contains($request->url(), 'accountNumber=2348012345678') && str_contains($request->url(), 'countryIsos=NG')));
});

it('marks a single-value product as FIXED', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/GetProviders*' => Http::response([
            'Items' => [['ProviderCode' => 'X', 'Name' => 'Op']],
        ]),
        'api.dingconnect.com/api/V1/GetProducts*' => Http::response([
            'Items' => [[
                'SkuCode' => 'FIXED5',
                'Minimum' => ['SendValue' => 5.0, 'ReceiveValue' => 5.0, 'ReceiveCurrencyIso' => 'USD'],
                'Maximum' => ['SendValue' => 5.0, 'ReceiveValue' => 5.0, 'ReceiveCurrencyIso' => 'USD'],
            ]],
        ]),
    ]);

    $op = dingProvider()->detectOperator('+10000000000', 'US');

    expect($op->denominationType)->toBe('FIXED')
        ->and($op->fixedAmounts)->toBe([5.0]);
});

it('prefers a ranged product so any chosen amount is orderable', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/GetProviders*' => Http::response([
            'Items' => [['ProviderCode' => 'P', 'Name' => 'Op']],
        ]),
        'api.dingconnect.com/api/V1/GetProducts*' => Http::response([
            'Items' => [
                ['SkuCode' => 'FIXED', 'Minimum' => ['SendValue' => 5.0], 'Maximum' => ['SendValue' => 5.0]],
                ['SkuCode' => 'RANGED', 'Minimum' => ['SendValue' => 1.0], 'Maximum' => ['SendValue' => 100.0]],
            ],
        ]),
    ]);

    $op = dingProvider()->detectOperator('+10000000000', 'NG');

    expect($op->operatorId)->toBe('RANGED')->and($op->denominationType)->toBe('RANGE');
});

it('returns null when no provider matches the number', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/GetProviders*' => Http::response(['Items' => []]),
    ]);

    expect(dingProvider()->detectOperator('+10000000000', 'ZZ'))->toBeNull();
});

it('sends a successful transfer and parses the transfer record', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/SendTransfer' => Http::response([
            'ResultCode' => 1,
            'ErrorCodes' => [],
            'TransferRecord' => [
                'TransferId' => ['TransferRef' => 'DING-999', 'DistributorRef' => 'ref-1'],
                'ProcessingState' => 'Complete',
            ],
        ]),
    ]);

    $result = dingProvider()->sendTopUp(dingOrder());

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('DING-999')
        ->and($result->providerStatus)->toBe('Complete');
});

it('maps a processing transfer state to in-flight', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/SendTransfer' => Http::response([
            'ResultCode' => 1,
            'TransferRecord' => ['TransferId' => ['TransferRef' => 'DING-1'], 'ProcessingState' => 'Processing'],
        ]),
    ]);

    expect(dingProvider()->sendTopUp(dingOrder())->status)->toBe(TransactionStatus::Processing);
});

it('treats a non-success result code as a failure', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/SendTransfer' => Http::response([
            'ResultCode' => 4,
            'ErrorCodes' => ['DuplicateTransactionPrevented'],
        ], 400),
    ]);

    $result = dingProvider()->sendTopUp(dingOrder());

    expect($result->status)->toBe(TransactionStatus::Failed)
        ->and($result->providerStatus)->toBe('FAILED')
        ->and($result->message)->toContain('DuplicateTransactionPrevented');
});

it('sends the api_key header, SkuCode, AccountNumber and DistributorRef', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/SendTransfer' => Http::response([
            'ResultCode' => 1,
            'TransferRecord' => ['TransferId' => ['TransferRef' => 'x'], 'ProcessingState' => 'Confirmed'],
        ]),
    ]);

    dingProvider()->sendTopUp(dingOrder('NG_MTN_TopUp', 'ref-42'));

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->hasHeader('api_key', 'test-key')
            && $body['SkuCode'] === 'NG_MTN_TopUp'
            && $body['AccountNumber'] === '2348012345678'
            && $body['DistributorRef'] === 'ref-42'
            && $body['ValidateOnly'] === false;
    });
});

it('sends transfers as validate-only in sandbox mode', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/SendTransfer' => Http::response([
            'ResultCode' => 1,
            'TransferRecord' => ['TransferId' => ['TransferRef' => 'x'], 'ProcessingState' => 'Confirmed'],
        ]),
    ]);

    dingProvider(sandbox: true)->sendTopUp(dingOrder());

    Http::assertSent(fn ($request) => $request->data()['ValidateOnly'] === true);
});

it('looks up a transfer by its reference', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/ListTransferRecords' => Http::response([
            'Items' => [[
                'TransferId' => ['TransferRef' => 'DING-7'],
                'ProcessingState' => 'Complete',
            ]],
        ]),
    ]);

    $result = dingProvider()->getTransaction('DING-7');

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerTransactionId)->toBe('DING-7');

    // The lookup uses a flat filter with a required Take, not a wrapper.
    Http::assertSent(fn ($request) => ! str_contains($request->url(), 'ListTransferRecords')
        || ($request->data()['TransferRef'] === 'DING-7' && $request->data()['Take'] === 1));
});

it('reports an unknown transfer as still processing', function () {
    Http::fake([
        'api.dingconnect.com/api/V1/ListTransferRecords' => Http::response(['Items' => []]),
    ]);

    expect(dingProvider()->getTransaction('missing')->status)->toBe(TransactionStatus::Processing);
});
