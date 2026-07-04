<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\LlmProvider;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Provider for any OpenAI-compatible chat-completions API (OpenAI, OpenRouter,
 * Groq). Parameterised by base endpoint and key. Returns the message content,
 * or an empty string on failure so the copilot can fall back gracefully.
 */
class OpenAiCompatibleProvider implements LlmProvider
{
    /**
     * @param  array<string, string>  $headers  extra provider headers
     */
    public function __construct(
        private readonly string $key,
        private readonly string $model,
        private readonly string $endpoint,
        private readonly array $headers = [],
    ) {}

    public function complete(string $system, array $messages): string
    {
        try {
            $response = Http::withToken($this->key)
                ->withHeaders($this->headers)
                ->timeout(30)
                // Free/shared models (e.g. OpenRouter ":free") get rate-limited
                // upstream (429); retry briefly on transient errors before giving
                // up to the copilot's deterministic fallback.
                ->retry(2, 600, fn (Throwable $e): bool => $e instanceof ConnectionException
                    || ($e instanceof RequestException && in_array($e->response->status(), [429, 500, 502, 503], true)), throw: false)
                ->post($this->endpoint, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ...$messages,
                    ],
                ]);

            if (! $response->successful()) {
                // Surface the reason (e.g. invalid key, or an OpenRouter
                // free-model data-policy rejection) without leaking the key.
                Log::warning('AI Copilot provider request failed', [
                    'endpoint' => $this->endpoint,
                    'model' => $this->model,
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 500),
                ]);

                return '';
            }

            return (string) ($response->json('choices.0.message.content') ?? '');
        } catch (Throwable $e) {
            Log::warning('AI Copilot provider threw', ['endpoint' => $this->endpoint, 'message' => $e->getMessage()]);

            return '';
        }
    }
}
