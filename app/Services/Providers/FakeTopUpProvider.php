<?php

namespace App\Services\Providers;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;

/**
 * Deterministic, network-free top-up provider for local dev and tests.
 *
 * Outcome is controllable so tests can exercise every branch:
 *   - recipient phone ending in "0000" (or customIdentifier containing "fail")    -> FAILED
 *   - recipient phone ending in "9999" (or customIdentifier containing "pending") -> PROCESSING
 *   - anything else                                                               -> SUCCESSFUL
 */
final class FakeTopUpProvider implements TopUpProvider
{
    /**
     * @var array<string, array{id: string, name: string, currency: string, fx: float}>
     */
    private const OPERATORS = [
        'NG' => ['id' => '341', 'name' => 'MTN Nigeria', 'currency' => 'NGN', 'fx' => 1600.0],
        'KE' => ['id' => '237', 'name' => 'Safaricom', 'currency' => 'KES', 'fx' => 129.0],
        'IN' => ['id' => '283', 'name' => 'Airtel India', 'currency' => 'INR', 'fx' => 83.0],
        'BD' => ['id' => '201', 'name' => 'Grameenphone', 'currency' => 'BDT', 'fx' => 118.0],
        'PH' => ['id' => '152', 'name' => 'Globe Telecom', 'currency' => 'PHP', 'fx' => 57.0],
        'GH' => ['id' => '208', 'name' => 'MTN Ghana', 'currency' => 'GHS', 'fx' => 14.0],
        'US' => ['id' => '173', 'name' => 'T-Mobile US', 'currency' => 'USD', 'fx' => 1.0],
    ];

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        $iso = strtoupper($countryIso);

        // "ZZ" is the reserved ISO code for an unknown country; anything that
        // isn't a real 2-letter code has no operator.
        if (strlen($iso) !== 2 || $iso === 'ZZ') {
            return null;
        }

        // Curated operators carry an accurate name/currency/rate; any other
        // supported country gets a generic demo operator so the fake driver is
        // functional everywhere (the live provider returns the real operator).
        $op = self::OPERATORS[$iso] ?? [
            'id' => 'demo-'.$iso,
            'name' => $iso.' Mobile',
            'currency' => 'USD',
            'fx' => 1.0,
        ];

        return new OperatorDetail(
            operatorId: $op['id'],
            name: $op['name'],
            countryIso: $iso,
            denominationType: 'RANGE',
            localCurrency: $op['currency'],
            fxRate: $op['fx'],
            minLocal: 1.0 * $op['fx'],
            maxLocal: 200.0 * $op['fx'],
            fixedAmounts: [],
        );
    }

    public function sendTopUp(TopUpOrder $order): TopUpResult
    {
        $providerId = 'FAKE-'.substr(md5($order->customIdentifier), 0, 12);
        $identifier = strtolower($order->customIdentifier);
        $phone = $order->recipientPhone;

        if (str_ends_with($phone, '0000') || str_contains($identifier, 'fail')) {
            return new TopUpResult(TransactionStatus::Failed, $providerId, 'FAILED', 'Simulated provider failure.');
        }

        if (str_ends_with($phone, '9999') || str_contains($identifier, 'pending')) {
            return new TopUpResult(TransactionStatus::Processing, $providerId, 'PROCESSING', 'Simulated async delivery.');
        }

        return new TopUpResult(TransactionStatus::Success, $providerId, 'SUCCESSFUL', 'Simulated successful top-up.');
    }

    public function getTransaction(string $providerTransactionId): TopUpResult
    {
        return new TopUpResult(TransactionStatus::Success, $providerTransactionId, 'SUCCESSFUL');
    }
}
