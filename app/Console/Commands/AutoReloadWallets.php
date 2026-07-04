<?php

namespace App\Console\Commands;

use App\Enums\LedgerReason;
use App\Models\Payment;
use App\Models\Wallet;
use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\WalletService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('wallet:auto-reload')]
#[Description('Top up wallets that have dropped below their auto-reload threshold.')]
class AutoReloadWallets extends Command
{
    public function handle(WalletService $wallets, PaymentGateway $gateway): int
    {
        $candidates = Wallet::query()
            ->where('auto_reload_enabled', true)
            ->whereNotNull('auto_reload_threshold_minor')
            ->whereNotNull('auto_reload_amount_minor')
            ->whereColumn('balance_minor', '<', 'auto_reload_threshold_minor')
            // Cooldown: never reload the same wallet more than once an hour, so a
            // concurrent or manual re-run can't charge the gateway twice.
            ->where(function ($query): void {
                $query->whereNull('auto_reloaded_at')
                    ->orWhere('auto_reloaded_at', '<', now()->subHour());
            })
            ->get();

        $reloaded = 0;

        foreach ($candidates as $wallet) {
            if ($this->reload($wallets, $gateway, $wallet)) {
                $reloaded++;
            }
        }

        $this->info("Reloaded {$reloaded} wallet(s).");

        return self::SUCCESS;
    }

    private function reload(WalletService $wallets, PaymentGateway $gateway, Wallet $wallet): bool
    {
        $amountMinor = (int) $wallet->auto_reload_amount_minor;

        $payment = $gateway->charge($amountMinor, $wallet->currency, [
            'user_id' => $wallet->user_id,
            'reason' => 'auto-reload',
        ]);

        // The gateway could not collect (e.g. no saved card for a real gateway).
        // Leave the wallet untouched and move on — nothing is fabricated.
        if (! $payment->approved) {
            $this->warn("Auto-reload declined for wallet #{$wallet->id}.");

            return false;
        }

        Payment::query()->create([
            'user_id' => $wallet->user_id,
            'amount_minor' => $amountMinor,
            'currency' => $wallet->currency,
            'gateway' => config('services.payments.driver', 'fake'),
            'reference' => $payment->reference,
            'status' => 'succeeded',
        ]);

        $wallets->credit($wallet, $amountMinor, LedgerReason::Funding, [
            // Deterministic per-hour key so an overlapping/manual re-run within
            // the same hour can't double-credit the wallet.
            'idempotencyKey' => 'auto-reload-'.$wallet->id.'-'.now()->format('YmdH'),
            'description' => 'Wallet auto-reload',
        ]);

        $wallet->update(['auto_reloaded_at' => now()]);

        return true;
    }
}
