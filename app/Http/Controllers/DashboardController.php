<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\RecipientResource;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use App\Services\DashboardData;
use App\Services\ResellerEarnings;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardData $dashboard,
        private readonly ResellerEarnings $resellerEarnings,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $recent = $user->role === Role::Admin
            ? Transaction::query()->latest('id')->limit(8)->get()
            : $user->transactions()->latest('id')->limit(8)->get();

        $props = [
            'wallet' => [
                'balance' => $user->wallet ? Money::toDecimal($user->wallet->balance_minor) : 0.0,
                'currency' => $user->wallet?->currency ?? \App\Support\Currency::base(),
            ],
            'recent' => TransactionResource::collection($recent),
            'savedRecipients' => RecipientResource::collection(
                $user->recipients()
                    ->orderByDesc('favorite')
                    ->orderByDesc('last_used_at')
                    ->limit(6)
                    ->get(),
            ),
            'metrics' => $this->dashboard->for($user),
            'userCount' => User::query()->count(),
            'onboarding' => $this->onboardingState($user),
        ];

        if ($user->role === Role::Reseller) {
            $props['customers'] = CustomerResource::collection(
                $user->customers()->latest('id')->get(),
            );
            $props['commissionTrend'] = $this->resellerEarnings->for($user)['monthly'];
        }

        return Inertia::render('dashboard', $props);
    }

    /**
     * Getting-started checklist state for a non-admin account. Email is always
     * verified on the dashboard (the route requires it), so it isn't a step.
     *
     * @return array{kycRequired: bool, kycApproved: bool, walletFunded: bool, hasTransaction: bool, complete: bool}|null
     */
    private function onboardingState(User $user): ?array
    {
        if ($user->role === Role::Admin) {
            return null;
        }

        $kycRequired = in_array($user->role, [Role::Business, Role::Reseller], true);
        $kycApproved = $user->kyc_status === 'approved';
        $hasTransaction = $user->transactions()->exists();
        // A funded-then-spent wallet still counts as funded (a transaction implies it).
        $walletFunded = (int) ($user->wallet?->balance_minor ?? 0) > 0 || $hasTransaction;

        return [
            'kycRequired' => $kycRequired,
            'kycApproved' => $kycApproved,
            'walletFunded' => $walletFunded,
            'hasTransaction' => $hasTransaction,
            'complete' => $walletFunded && $hasTransaction && (! $kycRequired || $kycApproved),
        ];
    }
}
