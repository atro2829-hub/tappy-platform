<?php

namespace App\Console\Commands;

use App\Exceptions\InsufficientFundsException;
use App\Models\Automation;
use App\Services\TopUpPurchaseInput;
use App\Services\TopUpService;
use App\Support\Money;
use Carbon\CarbonInterval;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('automations:run')]
#[Description('Execute due recurring top-up automations as real top-ups.')]
class RunAutomations extends Command
{
    public function handle(TopUpService $topUp): int
    {
        $automations = Automation::query()->with('user')->where('enabled', true)->get();
        $ran = 0;

        foreach ($automations as $automation) {
            if ($this->isDue($automation)) {
                $this->runAutomation($topUp, $automation);
                $ran++;
            }
        }

        $this->info("Ran {$ran} automation(s).");

        return self::SUCCESS;
    }

    private function isDue(Automation $automation): bool
    {
        $config = $automation->config ?? [];

        if (empty($config['recipient']) || (float) ($config['amount'] ?? 0) <= 0) {
            return false;
        }

        if ($automation->last_run_at === null) {
            return true;
        }

        $interval = match (strtolower((string) ($config['freq'] ?? 'weekly'))) {
            'daily' => CarbonInterval::day(),
            'monthly' => CarbonInterval::month(),
            default => CarbonInterval::week(),
        };

        return now()->greaterThanOrEqualTo($automation->last_run_at->copy()->add($interval));
    }

    private function runAutomation(TopUpService $topUp, Automation $automation): void
    {
        $config = $automation->config ?? [];
        $user = $automation->user;

        if ($user === null) {
            return;
        }

        $operator = $topUp->detectOperator((string) $config['recipient'], (string) ($config['country'] ?? 'US'));

        if ($operator === null) {
            $this->markFailed($automation, 'Operator not found');

            return;
        }

        // Amounts are stored in the recipient's local currency unless explicitly
        // USD; convert via the detected operator's FX rate (no other FX source).
        $amount = (float) $config['amount'];
        $cur = (string) ($config['cur'] ?? 'USD');
        $usd = $cur === 'USD' ? $amount : $amount / max($operator->fxRate, 0.0001);

        try {
            $topUp->purchase($user, new TopUpPurchaseInput(
                countryIso: (string) ($config['country'] ?? $operator->countryIso),
                recipientPhone: (string) $config['recipient'],
                amountUsdMinor: Money::toMinor($usd),
                operatorId: $operator->operatorId,
                operatorName: $operator->name,
                localAmountMinor: $cur === 'USD' ? null : Money::toMinor($amount),
                localCurrency: $cur === 'USD' ? null : $cur,
                idempotencyKey: 'auto-'.$automation->id.'-'.now()->format('Ymd'),
            ));
        } catch (InsufficientFundsException) {
            $this->markFailed($automation, 'Insufficient funds');

            return;
        }

        $config = $automation->config ?? [];
        unset($config['failReason']);

        $automation->update([
            'config' => $config === [] ? null : $config,
            'last_run_at' => now(),
        ]);
    }

    private function markFailed(Automation $automation, string $reason): void
    {
        $config = $automation->config ?? [];
        $config['failReason'] = $reason;

        $automation->update(['config' => $config, 'last_run_at' => now()]);
    }
}
