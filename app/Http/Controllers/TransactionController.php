<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');
        $type = (string) $request->query('type', 'all');
        $range = (string) $request->query('range', 'all');

        $query = $request->user()->transactions()->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('recipient', 'like', "%{$search}%")
                    ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        $cutoff = match ($range) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => null,
        };

        if ($cutoff !== null) {
            $query->where('created_at', '>=', $cutoff);
        }

        $paginator = $query->paginate(20)->withQueryString();

        return Inertia::render('transactions', [
            'transactions' => TransactionResource::collection($paginator->items()),
            'filters' => ['search' => $search, 'status' => $status, 'type' => $type, 'range' => $range],
            'pagination' => [
                'total' => $paginator->total(),
                'perPage' => $paginator->perPage(),
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }

    public function show(Request $request, Transaction $transaction): JsonResource
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        return new TransactionResource($transaction);
    }

    /**
     * Lightweight status lookup by reference, scoped to the owner — used to
     * poll a pending transaction until it settles (top-up, gift card, utility).
     */
    public function status(Request $request, string $reference): JsonResponse
    {
        $transaction = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->where('reference', $reference)
            ->firstOrFail();

        return response()->json([
            'reference' => $transaction->reference,
            'status' => $transaction->status->value,
        ]);
    }
}
