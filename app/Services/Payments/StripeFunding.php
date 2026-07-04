<?php

namespace App\Services\Payments;

use App\Enums\LedgerReason;
use App\Models\Payment;
use App\Models\User;
use App\Services\WalletService;

/**
 * Orchestrates wallet funding through Stripe Checkout: starts a hosted session
 * (recording a pending {@see Payment}) and credits the wallet once the session
 * is confirmed paid. Crediting is idempotent (guarded by the payment status and
 * a stable ledger idempotency key), so the return-redirect and the webhook can
 * both fire safely without double-crediting.
 */
class StripeFunding
{
    public function __construct(
        private readonly StripeCheckout $checkout,
        private readonly WalletService $wallets,
    ) {}

    /**
     * Create a Checkout session for the user and return the hosted payment URL,
     * or null if Stripe could not start the session.
     */
    public function startSession(User $user, int $amountMinor): ?string
    {
        $wallet = $this->wallets->forUser($user);

        $session = $this->checkout->createSession(
            $amountMinor,
            $wallet->currency,
            route('wallet').'?session_id={CHECKOUT_SESSION_ID}',
            route('wallet'),
            ['user_id' => $user->id],
        );

        if ($session === null) {
            return null;
        }

        Payment::query()->create([
            'user_id' => $user->id,
            'amount_minor' => $amountMinor,
            'currency' => $wallet->currency,
            'gateway' => 'stripe',
            'reference' => $session['id'],
            'status' => 'pending',
        ]);

        return $session['url'];
    }

    /**
     * Verify a Checkout session is paid and credit the wallet (idempotent).
     * Returns true only when this call performed the credit.
     */
    public function creditFromSession(string $sessionId): bool
    {
        $payment = Payment::query()
            ->where('gateway', 'stripe')
            ->where('reference', $sessionId)
            ->first();

        if ($payment === null || $payment->status === 'succeeded') {
            return false;
        }

        $session = $this->checkout->retrieveSession($sessionId);

        if ($session === null || ($session['payment_status'] ?? '') !== 'paid') {
            return false;
        }

        $payment->update(['status' => 'succeeded']);

        $wallet = $this->wallets->forUser($payment->user);

        $this->wallets->credit($wallet, $payment->amount_minor, LedgerReason::Funding, [
            'idempotencyKey' => 'stripe-'.$sessionId,
            'description' => 'Wallet funding',
        ]);

        return true;
    }
}
