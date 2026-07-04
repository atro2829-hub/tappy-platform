<?php

namespace App\Services\Providers\Contracts;

use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;

/**
 * Abstraction over a top-up provider (Reloadly, or the in-memory fake).
 *
 * Implementations must be side-effect free apart from talking to their
 * provider; all wallet/ledger bookkeeping happens in the calling service.
 */
interface TopUpProvider
{
    /**
     * Detect the mobile operator for a phone number in a country (ISO-2),
     * or null if none could be resolved.
     */
    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail;

    /**
     * Send a top-up. Implementations should treat `customIdentifier` as an
     * idempotency key so retries do not double-charge.
     */
    public function sendTopUp(TopUpOrder $order): TopUpResult;

    /**
     * Fetch the current state of a previously-sent top-up by its provider id.
     */
    public function getTransaction(string $providerTransactionId): TopUpResult;
}
