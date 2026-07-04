<?php

namespace App\Jobs;

use App\Models\WebhookEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Delivers a single signed webhook event to a customer's endpoint and records
 * the attempt in their deliveries feed. Failures are logged, not retried into
 * oblivion — the feed shows exactly what happened.
 */
class DeliverWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public int $userId,
        public string $url,
        public string $secret,
        public string $event,
        public array $data,
    ) {}

    public function handle(): void
    {
        $body = (string) json_encode([
            'event' => $this->event,
            'data' => $this->data,
            'created_at' => Carbon::now()->toIso8601String(),
        ]);

        $signature = hash_hmac('sha256', $body, $this->secret);
        $status = 'failed';

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Tappy-Event' => $this->event,
                'X-Tappy-Signature' => 'sha256='.$signature,
            ])->timeout(10)->withBody($body, 'application/json')->post($this->url);

            $status = $response->successful() ? 'delivered' : 'failed';
        } catch (Throwable $e) {
            report($e);
        }

        WebhookEvent::query()->create([
            'user_id' => $this->userId,
            'event' => $this->event,
            'status' => $status,
            'payload' => $this->data,
            'received_at' => Carbon::now(),
        ]);
    }
}
