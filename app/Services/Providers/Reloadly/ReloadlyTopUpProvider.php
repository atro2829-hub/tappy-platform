<?php

namespace App\Services\Providers\Reloadly;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Reloadly-backed top-up provider. Translates Reloadly's airtime responses
 * into the provider-agnostic DTOs the rest of the app understands.
 */
class ReloadlyTopUpProvider implements TopUpProvider
{
    public function __construct(private readonly ReloadlyClient $client) {}

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        try {
            $op = $this->client->get(
                '/operators/auto-detect/phone/'.ltrim($phone, '+').'/countries/'.strtoupper($countryIso),
            );
        } catch (Throwable) {
            return null;
        }

        if (empty($op['operatorId'])) {
            return null;
        }

        return new OperatorDetail(
            operatorId: (string) $op['operatorId'],
            name: (string) ($op['name'] ?? ''),
            countryIso: strtoupper((string) ($op['country']['isoName'] ?? $countryIso)),
            denominationType: ($op['denominationType'] ?? null) === 'FIXED' ? 'FIXED' : 'RANGE',
            localCurrency: (string) ($op['destinationCurrencyCode'] ?? $op['senderCurrencyCode'] ?? 'USD'),
            fxRate: (float) ($op['fx']['rate'] ?? 1.0),
            minLocal: $this->floatOrNull($op['localMinAmount'] ?? $op['minAmount'] ?? null),
            maxLocal: $this->floatOrNull($op['localMaxAmount'] ?? $op['maxAmount'] ?? null),
            fixedAmounts: array_map('floatval', $op['fixedAmounts'] ?? []),
        );
    }

    public function sendTopUp(TopUpOrder $order): TopUpResult
    {
        try {
            $resp = $this->client->post('/topups', [
                'operatorId' => (int) $order->operatorId,
                'amount' => $order->amount,
                'useLocalAmount' => $order->useLocalAmount,
                'customIdentifier' => $order->customIdentifier,
                'recipientPhone' => [
                    'countryCode' => strtoupper($order->countryIso),
                    'number' => $order->recipientPhone,
                ],
            ]);
        } catch (RequestException $e) {
            return new TopUpResult(
                status: TransactionStatus::Failed,
                providerStatus: 'FAILED',
                message: $e->getMessage(),
                raw: ['error' => $e->response->json() ?? $e->getMessage()],
            );
        }

        return $this->toResult($resp);
    }

    public function getTransaction(string $providerTransactionId): TopUpResult
    {
        return $this->toResult($this->client->get('/topups/'.$providerTransactionId), $providerTransactionId);
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $status = (string) ($resp['status'] ?? 'FAILED');

        return new TopUpResult(
            status: TopUpResult::statusFromProvider($status),
            providerTransactionId: isset($resp['transactionId']) ? (string) $resp['transactionId'] : $fallbackId,
            providerStatus: $status,
            message: isset($resp['message']) ? (string) $resp['message'] : null,
            raw: $resp,
        );
    }

    private function floatOrNull(mixed $value): ?float
    {
        return $value === null ? null : (float) $value;
    }
}
