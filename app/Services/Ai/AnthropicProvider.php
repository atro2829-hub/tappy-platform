<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\LlmProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Anthropic (Claude) provider — calls the Messages API directly over HTTP
 * (no SDK). Returns the first text block, or an empty string on failure so the
 * copilot can fall back gracefully.
 */
class AnthropicProvider implements LlmProvider
{
    public function __construct(
        private readonly string $key,
        private readonly string $model,
    ) {}

    public function complete(string $system, array $messages): string
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->key,
                'anthropic-version' => '2023-06-01',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model' => $this->model,
                'max_tokens' => 1024,
                'system' => $system,
                'messages' => $messages,
            ]);

            if (! $response->successful()) {
                Log::warning('AI Copilot Anthropic request failed', [
                    'model' => $this->model,
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 500),
                ]);

                return '';
            }

            foreach ($response->json('content') ?? [] as $block) {
                if (($block['type'] ?? null) === 'text') {
                    return (string) $block['text'];
                }
            }

            return '';
        } catch (Throwable $e) {
            Log::warning('AI Copilot Anthropic threw', ['message' => $e->getMessage()]);

            return '';
        }
    }
}
