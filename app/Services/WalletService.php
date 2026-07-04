<?php

namespace App\Services;

use App\Enums\LedgerDirection;
use App\Enums\LedgerReason;
use App\Exceptions\InsufficientFundsException;
use App\Models\LedgerEntry;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Single source of truth for moving money in and out of a wallet.
 *
 * Every mutation runs inside a database transaction with a row-level lock on
 * the wallet, writes an immutable ledger entry carrying the resulting balance,
 * and is safe to retry via an optional idempotency key.
 */
class WalletService
{
    /**
     * Get (or lazily create) the wallet for a user in the given currency.
     */
    public function forUser(User $user, string $currency = null): Wallet
    {
        $currency = $currency ?? \App\Support\Currency::base();

        return Wallet::firstOrCreate(
            ['user_id' => $user->id, 'currency' => $currency],
            ['balance_minor' => 0, 'status' => 'active'],
        );
    }

    /**
     * Add funds to a wallet.
     *
     * @param  array{idempotencyKey?: string|null, transactionId?: int|null, description?: string|null, meta?: array<string, mixed>|null}  $options
     */
    public function credit(Wallet $wallet, int $amountMinor, LedgerReason $reason, array $options = []): LedgerEntry
    {
        return $this->apply($wallet, LedgerDirection::Credit, $amountMinor, $reason, $options);
    }

    /**
     * Remove funds from a wallet, refusing to overdraw.
     *
     * @param  array{idempotencyKey?: string|null, transactionId?: int|null, description?: string|null, meta?: array<string, mixed>|null}  $options
     */
    public function debit(Wallet $wallet, int $amountMinor, LedgerReason $reason, array $options = []): LedgerEntry
    {
        $balanceBefore = $wallet->balance_minor;
        $entry = $this->apply($wallet, LedgerDirection::Debit, $amountMinor, $reason, $options);

        $this->notifyIfLowBalance($wallet, $balanceBefore);

        return $entry;
    }

    /**
     * Emit a wallet.low_balance webhook the moment a debit takes the balance
     * below the user's configured threshold (single-shot: only on the crossing,
     * not on every subsequent low debit).
     */
    private function notifyIfLowBalance(Wallet $wallet, int $balanceBefore): void
    {
        $threshold = (int) ($wallet->auto_reload_threshold_minor ?? 0);

        if ($threshold <= 0 || $balanceBefore < $threshold || $wallet->balance_minor >= $threshold) {
            return;
        }

        $user = $wallet->user;

        if ($user !== null) {
            app(WebhookDispatcher::class)->lowBalance($user, $wallet->balance_minor);
        }
    }

    /**
     * Return funds to a wallet (a credit tagged as a refund).
     *
     * @param  array{idempotencyKey?: string|null, transactionId?: int|null, description?: string|null, meta?: array<string, mixed>|null}  $options
     */
    public function refund(Wallet $wallet, int $amountMinor, array $options = []): LedgerEntry
    {
        return $this->credit($wallet, $amountMinor, LedgerReason::Refund, $options);
    }

    /**
     * @param  array{idempotencyKey?: string|null, transactionId?: int|null, description?: string|null, meta?: array<string, mixed>|null}  $options
     */
    private function apply(
        Wallet $wallet,
        LedgerDirection $direction,
        int $amountMinor,
        LedgerReason $reason,
        array $options,
    ): LedgerEntry {
        if ($amountMinor <= 0) {
            throw new InvalidArgumentException('Ledger amount must be a positive number of minor units.');
        }

        $idempotencyKey = $options['idempotencyKey'] ?? null;

        return DB::transaction(function () use ($wallet, $direction, $amountMinor, $reason, $options, $idempotencyKey): LedgerEntry {
            // Idempotency: the same financial event must never be applied twice.
            if ($idempotencyKey !== null) {
                $existing = LedgerEntry::query()->where('idempotency_key', $idempotencyKey)->first();

                if ($existing !== null) {
                    return $existing;
                }
            }

            // Lock the wallet row so concurrent debits cannot race the balance.
            $locked = Wallet::query()->whereKey($wallet->getKey())->lockForUpdate()->firstOrFail();

            $delta = $direction === LedgerDirection::Credit ? $amountMinor : -$amountMinor;
            $newBalance = $locked->balance_minor + $delta;

            if ($newBalance < 0) {
                throw new InsufficientFundsException(
                    "Insufficient funds: balance {$locked->balance_minor} minor units, attempted debit {$amountMinor}.",
                );
            }

            $locked->balance_minor = $newBalance;
            $locked->save();

            $entry = LedgerEntry::query()->create([
                'wallet_id' => $locked->id,
                'direction' => $direction,
                'amount_minor' => $amountMinor,
                'balance_after_minor' => $newBalance,
                'reason' => $reason,
                'transaction_id' => $options['transactionId'] ?? null,
                'idempotency_key' => $idempotencyKey,
                'description' => $options['description'] ?? null,
                'meta' => $options['meta'] ?? null,
            ]);

            // Keep the caller's in-memory model consistent with the locked row.
            $wallet->balance_minor = $newBalance;

            return $entry;
        });
    }
}
