<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditController extends Controller
{
    public function index(): Response
    {
        $paginator = AuditLog::query()->latest('id')->paginate(25)->withQueryString();

        $logs = collect($paginator->items())
            ->map(fn (AuditLog $log): array => [
                'actor' => $log->actor,
                'action' => $log->description,
                'target' => '—',
                'ip' => $log->ip_address ?? 'internal',
                'time' => $log->created_at?->diffForHumans() ?? '—',
                'icon' => $this->iconFor($log->action),
            ]);

        return Inertia::render('admin/audit', [
            'logs' => $logs,
            'pagination' => [
                'total' => $paginator->total(),
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }

    private function iconFor(string $action): string
    {
        return match (true) {
            str_starts_with($action, 'auth.') => 'lock',
            str_starts_with($action, 'kyc.') => 'shieldcheck',
            str_starts_with($action, 'wallet.') => 'wallet',
            str_starts_with($action, 'user.') => 'user',
            default => 'receipt',
        };
    }
}
