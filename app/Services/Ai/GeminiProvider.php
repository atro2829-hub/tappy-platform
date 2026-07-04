<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\LlmProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Google Gemini provider — calls the Generative Language API's
 * generateContent endpoint. Returns the first text part, or an empty string on
 * failure so the copilot can fall back gracefully.
 */
class GeminiProvider implements LlmProvider
{
    public function __construct(
        private readonly string $key,
        private readonly string $model,
    ) {}

    public function complete(string $system, array $messages): string
    {
        try {
            // Gemini names the assistant role "model" and wraps text in parts.
            $contents = array_map(fn (array $m): array => [
                'role' => $m['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $m['content']]],
            ], $messages);

            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->key}",
                [
                    'systemInstruction' => ['parts' => [['text' => $system]]],
                    'contents' => $contents,
                ],
            );

            if (! $response->successful()) {
                Log::warning('AI Copilot Gemini request failed', [
                    'model' => $this->model,
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 500),
                ]);

                return '';
            }

            return (string) ($response->json('candidates.0.content.parts.0.text') ?? '');
        } catch (Throwable $e) {
            Log::warning('AI Copilot Gemini threw', ['message' => $e->getMessage()]);

            return '';
        }
    }
}
