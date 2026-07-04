<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminKycController extends Controller
{
    public function index(): Response
    {
        $paginator = $this->reviewableUsers()
            ->with('kycDocuments')
            ->whereIn('kyc_status', ['pending', 'review', 'approved', 'rejected'])
            ->latest('updated_at')
            ->paginate(20)
            ->withQueryString();

        $queue = collect($paginator->items())
            ->map(fn (User $user): array => [
                'id' => (string) $user->id,
                'biz' => $user->business_name ?? $user->name,
                'type' => $user->role->label(),
                'contact' => $user->email,
                'docs' => $user->kycDocuments->count(),
                'documents' => $user->kycDocuments
                    ->map(fn (KycDocument $document): array => [
                        'id' => $document->id,
                        'label' => $document->label(),
                        'name' => $document->original_name,
                        'size' => $document->size,
                    ])
                    ->values(),
                'submitted' => $user->created_at?->diffForHumans() ?? '—',
                'status' => $user->kyc_status,
                'country' => $user->country ?? '',
            ]);

        return Inertia::render('admin/kyc', [
            'queue' => $queue,
            'pagination' => $this->paginationMeta($paginator),
            'stats' => [
                'pending' => $this->reviewableUsers()->where('kyc_status', 'pending')->count(),
                'review' => $this->reviewableUsers()->where('kyc_status', 'review')->count(),
                'approved' => $this->reviewableUsers()
                    ->where('kyc_status', 'approved')
                    ->where('updated_at', '>=', Carbon::now()->subDays(30))
                    ->count(),
                'rejected' => $this->reviewableUsers()->where('kyc_status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Stream a single uploaded KYC document inline for review. Admin-only (the
     * route lives behind the role:admin middleware); the file is otherwise never
     * reachable because it's stored on the private disk.
     */
    public function document(KycDocument $document): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($document->path), 404);

        return Storage::disk('local')->response($document->path, $document->original_name);
    }

    /**
     * Base query for users that actually go through KYC review — only Business
     * and Reseller accounts. Customers and admins are excluded so their default
     * "pending" status never inflates the review counts.
     *
     * @return Builder<User>
     */
    private function reviewableUsers(): Builder
    {
        return User::query()->whereIn('role', [Role::Business, Role::Reseller]);
    }
}
