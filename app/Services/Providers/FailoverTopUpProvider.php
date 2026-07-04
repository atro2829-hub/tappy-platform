<?php

namespace App\Services\Providers;

use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use Throwable;

/**
 * Routes top-up reads across a primary provider and a fallback: operator
 * detection falls over to the fallback when the primary can't resolve it
 * (improving country coverage and surviving a primary outage).
 *
 * Sends and status lookups deliberately stay on the primary — never fail a
 * charge over to another provider, since a primary that returned an error may
 * still have delivered, and a transaction belongs to whoever processed it.
 */
final class FailoverTopUpProvider implements TopUpProvider
{
    public function __construct(
        private readonly TopUpProvider $primary,
        private readonly TopUpProvider $fallback,
    ) {}

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        $operator = $this->attempt(fn (): ?OperatorDetail => $this->primary->detectOperator($phone, $countryIso));

        return $operator ?? $this->attempt(fn (): ?OperatorDetail => $this->fallback->detectOperator($phone, $countryIso));
    }

    public function sendTopUp(TopUpOrder $order): TopUpResult
    {
        return $this->primary->sendTopUp($order);
    }

    public function getTransaction(string $providerTransactionId): TopUpResult
    {
        return $this->primary->getTransaction($providerTransactionId);
    }

    /**
     * @param  callable(): ?OperatorDetail  $resolver
     */
    private function attempt(callable $resolver): ?OperatorDetail
    {
        try {
            return $resolver();
        } catch (Throwable) {
            return null;
        }
    }
}
