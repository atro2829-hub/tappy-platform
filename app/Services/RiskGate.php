<?php

namespace App\Services;

use App\Models\Setting;

/**
 * Decides whether a transaction must be held for admin review before delivery,
 * based on the admin-configured risk threshold (see AdminRiskController). The
 * funds are still captured up-front; only delivery is deferred until approval.
 */
class RiskGate
{
    private const DEFAULT_HIGH_AMOUNT = 500;

    public function shouldHold(int $amountUsdMinor): bool
    {
        $rules = is_array(Setting::get('risk.rules')) ? Setting::get('risk.rules') : [];
        $highAmount = (float) ($rules['highAmount'] ?? self::DEFAULT_HIGH_AMOUNT);
        $highMinor = (int) round($highAmount * 100);

        return $amountUsdMinor >= $highMinor;
    }
}
