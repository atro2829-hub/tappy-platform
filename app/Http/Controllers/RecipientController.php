<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecipientRequest;
use App\Http\Requests\UpdateRecipientRequest;
use App\Http\Resources\RecipientResource;
use App\Models\Recipient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $query = $request->user()->recipients()
            ->orderByDesc('favorite')
            ->orderByDesc('last_used_at')
            ->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('recipient', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(24)->withQueryString();

        return Inertia::render('recipients', [
            'recipients' => RecipientResource::collection($paginator->items()),
            'filters' => ['search' => $search],
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function store(StoreRecipientRequest $request): RedirectResponse
    {
        $request->user()->recipients()->create($request->validated());

        return back();
    }

    public function update(UpdateRecipientRequest $request, Recipient $recipient): RedirectResponse
    {
        abort_unless($recipient->user_id === $request->user()->id, 403);

        $recipient->update($request->validated());

        return back();
    }

    public function destroy(Request $request, Recipient $recipient): RedirectResponse
    {
        abort_unless($recipient->user_id === $request->user()->id, 403);

        $recipient->delete();

        return back();
    }
}
