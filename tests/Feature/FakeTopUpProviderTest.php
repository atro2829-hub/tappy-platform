<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use App\Services\Providers\FakeTopUpProvider;

function fakeOrder(string $phone, string $id): TopUpOrder
{
    return new TopUpOrder(
        operatorId: '341',
        amount: 5.0,
        useLocalAmount: false,
        recipientPhone: $phone,
        countryIso: 'NG',
        customIdentifier: $id,
    );
}

beforeEach(function () {
    $this->provider = new FakeTopUpProvider;
});

it('detects an operator for a supported country', function () {
    $op = $this->provider->detectOperator('+2348012345678', 'NG');

    expect($op)->not->toBeNull()
        ->and($op->operatorId)->toBe('341')
        ->and($op->localCurrency)->toBe('NGN');
});

it('returns null for an unsupported country', function () {
    expect($this->provider->detectOperator('+10000000000', 'ZZ'))->toBeNull();
});

it('succeeds by default', function () {
    $result = $this->provider->sendTopUp(fakeOrder('+2348012345678', 'ref-1'));

    expect($result->status)->toBe(TransactionStatus::Success)
        ->and($result->providerStatus)->toBe('SUCCESSFUL')
        ->and($result->providerTransactionId)->toStartWith('FAKE-');
});

it('fails when the recipient phone ends in 0000', function () {
    expect($this->provider->sendTopUp(fakeOrder('+23480120000', 'ref-2'))->status)
        ->toBe(TransactionStatus::Failed);
});

it('reports processing when the recipient phone ends in 9999', function () {
    expect($this->provider->sendTopUp(fakeOrder('+23480129999', 'ref-3'))->status)
        ->toBe(TransactionStatus::Processing);
});

it('maps provider status strings to our lifecycle', function () {
    expect(TopUpResult::statusFromProvider('SUCCESSFUL'))->toBe(TransactionStatus::Success)
        ->and(TopUpResult::statusFromProvider('PROCESSING'))->toBe(TransactionStatus::Processing)
        ->and(TopUpResult::statusFromProvider('REFUNDED'))->toBe(TransactionStatus::Refunded)
        ->and(TopUpResult::statusFromProvider('anything-else'))->toBe(TransactionStatus::Failed);
});

it('resolves the fake driver from the container by default', function () {
    expect(app(TopUpProvider::class))->toBeInstanceOf(FakeTopUpProvider::class);
});
