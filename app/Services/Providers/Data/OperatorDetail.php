<?php

namespace App\Services\Providers\Data;

/**
 * A provider's operator for a given phone/country — the result of auto-detect.
 */
final readonly class OperatorDetail
{
    /**
     * @param  'FIXED'|'RANGE'  $denominationType
     * @param  list<float>  $fixedAmounts
     */
    public function __construct(
        public string $operatorId,
        public string $name,
        public string $countryIso,
        public string $denominationType,
        public string $localCurrency,
        public float $fxRate,
        public ?float $minLocal = null,
        public ?float $maxLocal = null,
        public array $fixedAmounts = [],
    ) {}
}
