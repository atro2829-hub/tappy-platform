<?php

namespace App\Http\Controllers;

use App\Exceptions\DraftNotFoundException;
use App\Exceptions\InsufficientFundsException;
use App\Models\AiActivity;
use App\Services\Ai\AiCopilot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CopilotController extends Controller
{
    public function __construct(private readonly AiCopilot $copilot) {}

    public function ask(Request $request): JsonResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);

        return response()->json($this->copilot->ask($request->user(), $data['message']));
    }

    /**
     * Server-Sent Events variant of {@see ask()}. The full reply is resolved
     * once (so intent/action stay authoritative), then pushed to the client in
     * word chunks followed by the action — giving a live, streaming feel. The
     * client falls back to ask() + a local typewriter if streaming is unavailable.
     */
    public function stream(Request $request): StreamedResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);
        $result = $this->copilot->ask($request->user(), $data['message']);

        return response()->stream(function () use ($result): void {
            $this->sse('start', ['intent' => $result['intent']]);

            foreach (preg_split('/(\s+)/', (string) $result['reply'], -1, PREG_SPLIT_DELIM_CAPTURE) ?: [] as $chunk) {
                if ($chunk !== '') {
                    $this->sse('chunk', ['text' => $chunk]);
                }
            }

            if ($result['action'] !== null) {
                $this->sse('action', ['action' => $result['action']]);
            }

            $this->sse('done', ['reply' => $result['reply']]);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Emit one SSE frame and flush it to the client immediately.
     *
     * @param  array<string, mixed>  $data
     */
    private function sse(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: '.json_encode($data)."\n\n";

        if (ob_get_level() > 0) {
            @ob_flush();
        }

        flush();
    }

    public function execute(Request $request): JsonResponse
    {
        $data = $request->validate(['action' => ['required', 'array']]);
        $action = $data['action'];

        // Only the shapes we actually use are accepted. The executable amounts are
        // reloaded server-side from the draft keyed by activityId, never trusted
        // from the client. (Returned as JSON 422 — this endpoint is fetch-driven.)
        if (! in_array($action['type'] ?? null, ['topup', 'giftcard'], true)) {
            return response()->json(['message' => 'That action can’t be executed here.'], 422);
        }

        if (! isset($action['activityId']) || ! is_numeric($action['activityId'])) {
            return response()->json(['message' => 'Invalid request — missing draft reference.'], 422);
        }

        try {
            $transaction = $this->copilot->execute($request->user(), $data['action']);
        } catch (InsufficientFundsException) {
            return response()->json(['message' => 'Insufficient wallet balance. Add funds and try again.'], 422);
        } catch (DraftNotFoundException) {
            return response()->json(['message' => 'That request has expired. Please ask again.'], 422);
        }

        $transaction->refresh();

        return response()->json([
            'reference' => $transaction->reference,
            'status' => $transaction->status->value,
            'product' => $data['action']['product'] ?? 'Top-up',
            'recipientMask' => $data['action']['recipientMask'] ?? '',
        ]);
    }

    public function activity(Request $request): Response
    {
        $user = $request->user();

        $items = AiActivity::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (AiActivity $a): array => [
                'id' => (string) $a->id,
                'icon' => $this->iconFor($a->intent),
                'voice' => false,
                'command' => $a->prompt,
                'action' => $this->actionLabel($a->intent),
                'recipient' => $a->action['recipientName'] ?? $a->action['recipientMask'] ?? $a->action['recipientNumber'] ?? '—',
                'confidence' => 'High',
                'amount' => isset($a->action['total']) ? (float) $a->action['total'] : null,
                'status' => match ($a->status) {
                    'drafted' => 'pending',
                    'answered' => 'success',
                    default => $a->status,
                },
                'time' => $a->created_at?->diffForHumans() ?? '—',
            ]);

        return Inertia::render('ai-activity', [
            'activity' => $items,
            'stats' => [
                'total' => AiActivity::query()->where('user_id', $user->id)->where('created_at', '>=', now()->subDays(30))->count(),
                'completed' => AiActivity::query()->where('user_id', $user->id)->where('status', 'answered')->count(),
            ],
        ]);
    }

    private function iconFor(string $intent): string
    {
        return match ($intent) {
            'topup' => 'phone',
            'giftcard' => 'gift',
            'balance' => 'wallet',
            'status' => 'receipt',
            default => 'sparkles',
        };
    }

    private function actionLabel(string $intent): string
    {
        return match ($intent) {
            'topup' => 'Airtime',
            'giftcard' => 'Gift card',
            'balance' => 'Balance check',
            'status' => 'Transaction lookup',
            default => 'Assistant',
        };
    }
}
