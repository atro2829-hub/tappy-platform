<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use App\Http\Controllers\ImpersonationController;
use App\Models\AiActivity;
use App\Models\BulkBatch;
use App\Models\User;
use App\Services\RiskFlags;
use App\Support\Money;
use App\Support\SystemSettings;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Bridge the idiomatic `back()->with('toast', …)` session flash into
        // Inertia's flash channel, so every controller's toast reaches the
        // client's flash listener — not just the ones calling Inertia::flash().
        if ($request->session()->has('toast')) {
            Inertia::flash('toast', $request->session()->get('toast'));
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'branding' => SystemSettings::brandingShare(),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $request->user() ? $this->recentNotifications($request->user()) : [],
            'unreadNotifications' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            'navBadges' => $request->user() ? $this->navBadges($request->user()) : [],
            'recentAiActions' => $request->user() ? $this->recentAiActions($request->user()) : [],
            'walletBalance' => $request->user() ? Money::toDecimal((int) ($request->user()->wallet?->balance_minor ?? 0)) : 0,
            // True while an admin is signed in as another user (see ImpersonationController).
            'impersonating' => $request->session()->has(ImpersonationController::SESSION_KEY),
        ];
    }

    /**
     * The user's last few Copilot actions, for the dashboard command bar.
     *
     * @return list<array{icon: string, tone: string, text: string, re: string}>
     */
    private function recentAiActions(User $user): array
    {
        return AiActivity::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(3)
            ->get()
            ->map(fn (AiActivity $a): array => [
                'icon' => $a->status === 'drafted' ? 'clock' : 'checkcircle',
                'tone' => $a->status === 'drafted' ? 'warning' : 'success',
                'text' => Str::limit($a->prompt, 36),
                're' => $a->prompt,
            ])
            ->all();
    }

    /**
     * Sidebar badge counts, cached briefly per user — these run on every request
     * and the admin variant is an expensive full-table aggregate, so a short TTL
     * keeps them off the hot path while staying close enough to live.
     *
     * @return array<string, int>
     */
    private function navBadges(User $user): array
    {
        return Cache::remember(
            "nav-badges:{$user->id}",
            now()->addSeconds(60),
            fn (): array => $this->computeNavBadges($user),
        );
    }

    /**
     * @return array<string, int>
     */
    private function computeNavBadges(User $user): array
    {
        return match ($user->role) {
            Role::Admin => array_filter([
                'admin-kyc' => User::query()
                    ->whereIn('role', [Role::Business, Role::Reseller])
                    ->whereIn('kyc_status', ['pending', 'review'])
                    ->count(),
                'admin-risk' => app(RiskFlags::class)->openCount(),
            ], fn (int $count): bool => $count > 0),
            Role::Business => array_filter([
                // Only in-flight batches warrant a badge; completed/failed ones
                // have nothing left to act on and drop off.
                'bulk' => BulkBatch::query()
                    ->where('user_id', $user->id)
                    ->whereIn('status', ['queued', 'processing'])
                    ->count(),
            ], fn (int $count): bool => $count > 0),
            default => [],
        };
    }

    /**
     * The user's real notifications (failed/refunded transactions, KYC
     * decisions, …) surfaced in the top-bar bell.
     *
     * @return list<array{id: string, icon: string, color: string, title: string, desc: string, time: string, read: bool}>
     */
    private function recentNotifications(User $user): array
    {
        return $user->notifications()->latest()->limit(8)->get()
            ->map(fn (DatabaseNotification $n): array => [
                'id' => $n->id,
                'icon' => $n->data['icon'] ?? 'bell',
                'color' => $n->data['color'] ?? 'foreground',
                'title' => $n->data['title'] ?? 'Notification',
                'desc' => $n->data['desc'] ?? '',
                'time' => $n->created_at?->diffForHumans() ?? '',
                'read' => $n->read_at !== null,
            ])
            ->all();
    }
}
