<?php

namespace App\Services\Ai\Contracts;

use App\Services\Ai\AiCopilot;

/**
 * Abstraction over a chat LLM. Implementations send the conversation (system
 * prompt + a list of prior turns ending with the latest user message) and
 * return the model's raw text reply (which the {@see AiCopilot} instructs to be
 * JSON). Swappable between Anthropic, OpenAI, OpenRouter, Groq, Gemini and a fake.
 */
interface LlmProvider
{
    /**
     * @param  list<array{role: string, content: string}>  $messages  conversation turns, oldest first, ending with the latest user message
     */
    public function complete(string $system, array $messages): string;
}
