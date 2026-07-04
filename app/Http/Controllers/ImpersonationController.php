<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Lets an admin sign in as another user for support/debugging, then return to
 * their own account. The original admin's id is stashed in the session and is
 * the trust anchor for restoring the session.
 */
class ImpersonationController extends Controller
{
    /** Session key holding the impersonating admin's id. */
    public const SESSION_KEY = 'impersonator_id';

    /**
     * Begin impersonating $user. Only reachable by an admin (the route lives
     * behind role:admin); admins, suspended accounts and self are refused.
     */
    public function start(Request $request, User $user): RedirectResponse
    {
        $admin = $request->user();

        // Don't allow nesting impersonation sessions.
        abort_if($request->session()->has(self::SESSION_KEY), 403, 'Already impersonating a user.');
        abort_if($user->id === $admin->id, 403, 'You cannot impersonate yourself.');
        abort_if($user->role === Role::Admin, 403, 'Administrators cannot be impersonated.');

        if ($user->isSuspended()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Reactivate the account before signing in as it.']);
        }

        AuditLog::record(
            'user.impersonation_started',
            $admin->name.' started impersonating '.$user->name,
            $admin,
            ['user_id' => $user->id],
            $request->ip(),
        );

        Auth::login($user);
        // Stash after login so it survives the guard's session migration.
        $request->session()->put(self::SESSION_KEY, $admin->id);

        return redirect()->route('dashboard');
    }

    /**
     * Stop impersonating and restore the original admin. Lives behind plain
     * `auth` (the current user is the impersonated, non-admin account); it is a
     * no-op when no impersonation is in progress.
     */
    public function stop(Request $request): RedirectResponse
    {
        $impersonatorId = $request->session()->pull(self::SESSION_KEY);

        if ($impersonatorId === null) {
            return redirect()->route('dashboard');
        }

        $admin = User::find($impersonatorId);

        if ($admin === null) {
            // The original admin no longer exists — fail closed by logging out.
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        }

        $impersonated = $request->user();

        AuditLog::record(
            'user.impersonation_stopped',
            $admin->name.' stopped impersonating '.($impersonated?->name ?? 'a user'),
            $admin,
            ['user_id' => $impersonated?->id],
            $request->ip(),
        );

        Auth::login($admin);

        return redirect()->route('admin.users');
    }
}
