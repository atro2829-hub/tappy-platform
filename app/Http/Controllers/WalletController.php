<?php

namespace App\Http\Controllers;

use App\Console\Commands\AutoReloadWallets;
use App\Enums\LedgerDirection;
use App\Enums\LedgerReason;
use App\Http\Requests\FundWalletRequest;
use App\Http\Resources\LedgerEntryResource;
use App\Http\Resources\WalletResource;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Payments\StripeFunding;
use App\Services\WalletService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $wallets) {}

    public function index(Request $request, StripeFunding $funding): Response
    {
        $user = $request->user();

        // Returning from Stripe Checkout — verify the session and credit (idempotent).
        $sessionId = $request->query('session_id');

        if (is_string($sessionId) && $sessionId !== '' && $funding->creditFromSession($sessionId)) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Wallet funded.')]);
        }

        $wallet = $this->wallets->forUser($user);

        $reason = (string) $request->query('reason', 'all');
        $ledgerQuery = $wallet->ledgerEntries()->latest('id');

        if ($reason !== 'all') {
            $ledgerQuery->where('reason', $reason);
        }

        $ledgerPaginator = $ledgerQuery->paginate(15, ['*'], 'ledgerPage')->withQueryString();

        $refundedMinor = (int) $wallet->ledgerEntries()
            ->where('reason', LedgerReason::Refund)
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount_minor');

        $spentMinor = (int) $wallet->ledgerEntries()
            ->where('direction', LedgerDirection::Debit)
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount_minor');

        return Inertia::render('wallet', [
            'wallet' => new WalletResource($wallet),
            'ledger' => LedgerEntryResource::collection($ledgerPaginator->items()),
            'ledgerFilter' => $reason,
            'ledgerPagination' => [
                'total' => $ledgerPaginator->total(),
                'currentPage' => $ledgerPaginator->currentPage(),
                'lastPage' => $ledgerPaginator->lastPage(),
                'from' => $ledgerPaginator->firstItem(),
                'to' => $ledgerPaginator->lastItem(),
            ],
            'paymentDriver' => config('services.payments.driver', 'fake'),
            'autoReload' => [
                'enabled' => (bool) $wallet->auto_reload_enabled,
                'threshold' => $wallet->auto_reload_threshold_minor !== null
                    ? Money::toDecimal($wallet->auto_reload_threshold_minor)
                    : null,
                'amount' => $wallet->auto_reload_amount_minor !== null
                    ? Money::toDecimal($wallet->auto_reload_amount_minor)
                    : null,
            ],
            'stats' => [
                'refundedMtd' => Money::toDecimal($refundedMinor),
                'spentMonth' => Money::toDecimal($spentMinor),
            ],
        ]);
    }

    /**
     * Save the wallet's auto-reload preferences. When enabled, a scheduled job
     * tops the wallet up by the configured amount once it drops below the
     * threshold (see {@see AutoReloadWallets}).
     */
    public function autoReload(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'threshold' => ['required_if:enabled,true', 'nullable', 'numeric', 'min:1', 'max:100000'],
            'amount' => ['required_if:enabled,true', 'nullable', 'numeric', 'min:1', 'max:100000'],
        ]);

        $wallet = $this->wallets->forUser($request->user());

        $wallet->update([
            'auto_reload_enabled' => (bool) $data['enabled'],
            'auto_reload_threshold_minor' => isset($data['threshold']) ? Money::toMinor((float) $data['threshold']) : null,
            'auto_reload_amount_minor' => isset($data['amount']) ? Money::toMinor((float) $data['amount']) : null,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => $data['enabled'] ? 'Auto-reload enabled.' : 'Auto-reload disabled.',
        ]);
    }

    /**
     * Start a Stripe Checkout session and redirect to Stripe's hosted payment
     * page (used when PAYMENT_DRIVER=stripe). The wallet is credited on return.
     */
    public function checkout(FundWalletRequest $request, StripeFunding $funding): HttpResponse
    {
        $url = $funding->startSession($request->user(), $request->amountMinor());

        if ($url === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Could not start checkout. Please try again.')]);

            return to_route('wallet');
        }

        return Inertia::location($url);
    }

    /**
     * Synchronous funding for the fake gateway (instant credit, no redirect).
     */
    public function fund(FundWalletRequest $request, PaymentGateway $gateway): RedirectResponse
    {
        // The synchronous "instant credit" path is for the fake gateway only.
        // Never allow it to mint real balance in production (where a real
        // gateway like Stripe Checkout must be used instead).
        abort_if(
            app()->isProduction() && config('services.payments.driver', 'fake') === 'fake',
            403,
            'Instant funding is disabled in production.',
        );

        $wallet = $this->wallets->forUser($request->user());
        $amountMinor = $request->amountMinor();

        // Capture the funding payment through the gateway before crediting.
        $payment = $gateway->charge($amountMinor, $wallet->currency, [
            'user_id' => $request->user()->id,
        ]);

        if (! $payment->approved) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Payment was declined. Please try again.')]);

            return to_route('wallet');
        }

        Payment::query()->create([
            'user_id' => $request->user()->id,
            'amount_minor' => $amountMinor,
            'currency' => $wallet->currency,
            'gateway' => config('services.payments.driver', 'fake'),
            'reference' => $payment->reference,
            'status' => 'succeeded',
        ]);

        $this->wallets->credit($wallet, $amountMinor, LedgerReason::Funding, [
            'idempotencyKey' => $request->validated('idempotency_key') ?? (string) Str::uuid(),
            'description' => 'Wallet funding',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Wallet funded.')]);

        return to_route('wallet');
    }
}
