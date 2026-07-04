<?php

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use App\Services\Providers\FailoverGiftCardProvider;
use App\Services\Providers\FailoverTopUpProvider;

/** A controllable top-up double that records whether each method was called. */
function topUpDouble(?OperatorDetail $operator, bool $throwOnDetect = false): TopUpProvider
{
    return new class($operator, $throwOnDetect) implements TopUpProvider
    {
        public bool $detectCalled = false;

        public bool $sendCalled = false;

        public function __construct(public ?OperatorDetail $operator, public bool $throwOnDetect) {}

        public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
        {
            $this->detectCalled = true;
            if ($this->throwOnDetect) {
                throw new RuntimeException('provider down');
            }

            return $this->operator;
        }

        public function sendTopUp(TopUpOrder $order): TopUpResult
        {
            $this->sendCalled = true;

            return new TopUpResult(TransactionStatus::Success, 'PRIMARY-TX', 'SUCCESSFUL');
        }

        public function getTransaction(string $providerTransactionId): TopUpResult
        {
            return new TopUpResult(TransactionStatus::Success, $providerTransactionId, 'SUCCESSFUL');
        }
    };
}

function sampleOperator(string $name): OperatorDetail
{
    return new OperatorDetail($name, $name, 'NG', 'RANGE', 'NGN', 1600.0);
}

it('uses the primary operator when it resolves, without touching the fallback', function () {
    $primary = topUpDouble(sampleOperator('primary-op'));
    $fallback = topUpDouble(sampleOperator('fallback-op'));

    $op = (new FailoverTopUpProvider($primary, $fallback))->detectOperator('+2348012345678', 'NG');

    expect($op->operatorId)->toBe('primary-op')
        ->and($primary->detectCalled)->toBeTrue()
        ->and($fallback->detectCalled)->toBeFalse();
});

it('falls over to the fallback operator when the primary returns null', function () {
    $primary = topUpDouble(null);
    $fallback = topUpDouble(sampleOperator('fallback-op'));

    $op = (new FailoverTopUpProvider($primary, $fallback))->detectOperator('+2348012345678', 'NG');

    expect($op->operatorId)->toBe('fallback-op')
        ->and($fallback->detectCalled)->toBeTrue();
});

it('falls over to the fallback operator when the primary throws', function () {
    $primary = topUpDouble(null, throwOnDetect: true);
    $fallback = topUpDouble(sampleOperator('fallback-op'));

    $op = (new FailoverTopUpProvider($primary, $fallback))->detectOperator('+2348012345678', 'NG');

    expect($op->operatorId)->toBe('fallback-op');
});

it('returns null when neither provider detects an operator', function () {
    $provider = new FailoverTopUpProvider(topUpDouble(null), topUpDouble(null));

    expect($provider->detectOperator('+10000000000', 'ZZ'))->toBeNull();
});

it('never fails a top-up send over to the fallback', function () {
    $primary = topUpDouble(null);
    $fallback = topUpDouble(null);

    $result = (new FailoverTopUpProvider($primary, $fallback))->sendTopUp(
        new TopUpOrder('op', 5.0, false, '+2348012345678', 'NG', 'ref'),
    );

    expect($result->providerTransactionId)->toBe('PRIMARY-TX')
        ->and($primary->sendCalled)->toBeTrue()
        ->and($fallback->sendCalled)->toBeFalse();
});

/** A controllable gift-card double. */
function giftCardDouble(array $products, bool $throwOnList = false): GiftCardProvider
{
    return new class($products, $throwOnList) implements GiftCardProvider
    {
        public bool $listCalled = false;

        public bool $orderCalled = false;

        public function __construct(public array $products, public bool $throwOnList) {}

        public function listProducts(?string $countryIso = null, int $size = 50): array
        {
            $this->listCalled = true;
            if ($this->throwOnList) {
                throw new RuntimeException('catalog down');
            }

            return $this->products;
        }

        public function order(GiftCardOrder $order): TopUpResult
        {
            $this->orderCalled = true;

            return new TopUpResult(TransactionStatus::Success, 'PRIMARY-ORDER', 'SUCCESSFUL');
        }

        public function getOrder(string $providerTransactionId): TopUpResult
        {
            return new TopUpResult(TransactionStatus::Success, $providerTransactionId, 'SUCCESSFUL');
        }
    };
}

function sampleProduct(string $id): array
{
    return ['id' => $id, 'brand' => $id, 'cat' => 'Gift card', 'denoms' => [10.0], 'countries' => ['US'], 'logo' => null];
}

it('uses the primary catalog when it has products', function () {
    $primary = giftCardDouble([sampleProduct('primary-card')]);
    $fallback = giftCardDouble([sampleProduct('fallback-card')]);

    $products = (new FailoverGiftCardProvider($primary, $fallback))->listProducts('US');

    expect($products)->toHaveCount(1)
        ->and($products[0]['id'])->toBe('primary-card')
        ->and($fallback->listCalled)->toBeFalse();
});

it('falls over to the fallback catalog when the primary is empty', function () {
    $primary = giftCardDouble([]);
    $fallback = giftCardDouble([sampleProduct('fallback-card')]);

    $products = (new FailoverGiftCardProvider($primary, $fallback))->listProducts('US');

    expect($products[0]['id'])->toBe('fallback-card')
        ->and($fallback->listCalled)->toBeTrue();
});

it('falls over to the fallback catalog when the primary throws', function () {
    $primary = giftCardDouble([], throwOnList: true);
    $fallback = giftCardDouble([sampleProduct('fallback-card')]);

    expect((new FailoverGiftCardProvider($primary, $fallback))->listProducts()[0]['id'])->toBe('fallback-card');
});

it('never fails a gift-card order over to the fallback', function () {
    $primary = giftCardDouble([]);
    $fallback = giftCardDouble([]);

    $result = (new FailoverGiftCardProvider($primary, $fallback))->order(
        new GiftCardOrder('card', 1, 10.0, 'a@b.com', 'email', 'US', 'ref'),
    );

    expect($result->providerTransactionId)->toBe('PRIMARY-ORDER')
        ->and($primary->orderCalled)->toBeTrue()
        ->and($fallback->orderCalled)->toBeFalse();
});
