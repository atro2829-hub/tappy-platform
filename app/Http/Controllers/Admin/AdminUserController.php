<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LedgerReason;
use App\Enums\Role;
use App\Exceptions\InsufficientFundsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreditUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\AdminUserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\KycDecisionNotification;
use App\Notifications\UserInvitation;
use App\Services\WalletService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = (string) $request->query('role', 'all');

        $query = User::query()->with('wallet')->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('business_name', 'like', "%{$search}%");
            });
        }

        if ($role !== 'all' && Role::tryFrom($role) !== null) {
            $query->where('role', $role);
        }

        $paginator = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users' => AdminUserResource::collection($paginator->items()),
            'filters' => ['search' => $search, 'role' => $role],
            'pagination' => [
                'total' => $paginator->total(),
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'stats' => [
                'total' => User::query()->count(),
                'businesses' => User::query()->where('role', Role::Business)->count(),
                'resellers' => User::query()->where('role', Role::Reseller)->count(),
                'suspended' => User::query()->where('status', 'suspended')->count(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make(Str::password(20)),
            'role' => $data['role'],
            'business_name' => $data['business_name'] ?? null,
            'country' => $data['country'] ?? null,
            'status' => 'active',
            'kyc_status' => 'pending',
        ]);

        // The admin vouches for the address, and the invite link (sent to it)
        // proves ownership — so the user skips the separate email-verify step.
        $user->markEmailAsVerified();

        // Email a secure set-password link so the invitation works immediately.
        $user->notify(new UserInvitation(Password::createToken($user)));

        AuditLog::record(
            'user.invited',
            'Invited '.$user->name.' ('.$user->role->value.')',
            $request->user(),
            ['user_id' => $user->id],
            $request->ip(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => $user->name.' invited — a set-password email is on its way.']);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $changes = $request->validated();
        $admin = $request->user();

        // Guard role changes: never demote yourself or the last remaining admin,
        // or the platform could be left with no administrator.
        if (isset($changes['role']) && $user->role === Role::Admin && $changes['role'] !== Role::Admin->value) {
            if ($user->id === $admin->id) {
                return back()->with('toast', ['type' => 'error', 'message' => 'You cannot change your own admin role.']);
            }

            if (User::query()->where('role', Role::Admin)->count() <= 1) {
                return back()->with('toast', ['type' => 'error', 'message' => 'Cannot demote the last administrator.']);
            }
        }

        $roleChanged = isset($changes['role']) && $user->role->value !== $changes['role'];

        $user->update($changes);

        if ($roleChanged) {
            AuditLog::record(
                'user.role_changed',
                'Changed role of '.$user->name.' to '.$changes['role'],
                $admin,
                ['user_id' => $user->id],
                $request->ip(),
            );
        }

        if (isset($changes['status'])) {
            AuditLog::record(
                $changes['status'] === 'suspended' ? 'user.suspended' : 'user.reactivated',
                ($changes['status'] === 'suspended' ? 'Suspended ' : 'Reactivated ').$user->name,
                $admin,
                ['user_id' => $user->id],
                $request->ip(),
            );
        }

        if (isset($changes['kyc_status'])) {
            AuditLog::record(
                'kyc.'.$changes['kyc_status'],
                'Set KYC of '.$user->name.' to '.$changes['kyc_status'],
                $admin,
                ['user_id' => $user->id],
                $request->ip(),
            );

            // Let the user know the outcome of their verification.
            $user->notify(new KycDecisionNotification($changes['kyc_status']));
        }

        return back();
    }

    /**
     * Manually move money in or out of a user's wallet — e.g. when a Business,
     * Reseller or Agent pays the operator in cash and the super admin tops their
     * account up. Every movement is written to the immutable ledger and the audit
     * log so cash handling stays accountable.
     */
    public function credit(CreditUserRequest $request, User $user, WalletService $wallets): RedirectResponse
    {
        $admin = $request->user();
        $isCredit = $request->validated('direction') === 'credit';
        $amountMinor = Money::toMinor((float) $request->validated('amount'));
        $note = trim((string) $request->validated('note'));
        $wallet = $wallets->forUser($user);

        $options = [
            // A fresh key per submission; the disabled-while-saving button guards
            // against accidental double posts.
            'idempotencyKey' => 'manual-'.($isCredit ? 'credit' : 'debit').'-'.Str::uuid()->toString(),
            'description' => 'Manual '.($isCredit ? 'credit' : 'debit').' by '.$admin->name.' — '.$note,
            'meta' => [
                'manual' => true,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'note' => $note,
            ],
        ];

        try {
            if ($isCredit) {
                $wallets->credit($wallet, $amountMinor, LedgerReason::Funding, $options);
            } else {
                $wallets->debit($wallet, $amountMinor, LedgerReason::Adjustment, $options);
            }
        } catch (InsufficientFundsException) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => $user->name.' does not have enough balance for that deduction.',
            ]);
        }

        $amount = number_format(Money::toDecimal($amountMinor), 2);
        $newBalance = number_format(Money::toDecimal($wallet->fresh()->balance_minor), 2);

        AuditLog::record(
            $isCredit ? 'wallet.credited' : 'wallet.debited',
            ($isCredit ? 'Credited $'.$amount.' to ' : 'Debited $'.$amount.' from ').$user->name.' — '.$note,
            $admin,
            ['user_id' => $user->id, 'amount_minor' => $amountMinor, 'direction' => $isCredit ? 'credit' : 'debit', 'note' => $note],
            $request->ip(),
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => ($isCredit ? 'Added $'.$amount.' to ' : 'Deducted $'.$amount.' from ').$user->name.'. New balance: $'.$newBalance.'.',
        ]);
    }
}
