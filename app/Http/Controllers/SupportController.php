<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Ticket::query()->with(['user', 'replies'])->latest('id');

        // Admins triage every ticket; everyone else sees only their own.
        if ($request->user()->role !== Role::Admin) {
            $query->where('user_id', $request->user()->id);
        }

        $paginator = $query->paginate(20)->withQueryString();

        return Inertia::render('support', [
            'tickets' => TicketResource::collection($paginator->items()),
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Ticket::create([
            'user_id' => $request->user()->id,
            'reference' => 'TKT-'.strtoupper(Str::random(6)),
            'subject' => $data['subject'],
            'body' => $data['body'],
            'txn' => $data['txn'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'open',
        ]);

        return back();
    }

    public function reply(Request $request, Ticket $ticket): RedirectResponse
    {
        $isAdmin = $request->user()->role === Role::Admin;

        abort_unless($ticket->user_id === $request->user()->id || $isAdmin, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $ticket->replies()->create([
            'author' => $request->user()->name,
            'body' => $data['body'],
        ]);

        // An admin reply resolves the dispute; a customer reply re-opens triage.
        $ticket->update(['status' => $isAdmin ? 'resolved' : 'pending']);

        return back();
    }
}
