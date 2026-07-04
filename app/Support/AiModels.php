<?php

namespace App\Support;

/**
 * Catalog of supported AI Copilot providers and their selectable models. The
 * curated model lists drive the System Settings dropdowns; OpenRouter entries
 * flag the free tiers. Adding a provider/model here surfaces it in the UI.
 */
final class AiModels
{
    /** Provider keys, in display order. */
    public const PROVIDERS = ['anthropic', 'openai', 'openrouter', 'groq', 'gemini'];

    /**
     * Human labels for each provider.
     *
     * @var array<string, string>
     */
    public const LABELS = [
        'anthropic' => 'Anthropic (Claude)',
        'openai' => 'OpenAI',
        'openrouter' => 'OpenRouter',
        'groq' => 'Groq',
        'gemini' => 'Google Gemini',
    ];

    /**
     * OpenAI-compatible chat-completions endpoints (Anthropic and Gemini use
     * their own clients).
     *
     * @var array<string, string>
     */
    public const ENDPOINTS = [
        'openai' => 'https://api.openai.com/v1/chat/completions',
        'openrouter' => 'https://openrouter.ai/api/v1/chat/completions',
        'groq' => 'https://api.groq.com/openai/v1/chat/completions',
    ];

    /**
     * Selectable models per provider. `free` marks OpenRouter's no-cost tiers.
     *
     * @var array<string, list<array{value: string, label: string, free?: bool}>>
     */
    public const CATALOG = [
        'anthropic' => [
            ['value' => 'claude-3-5-haiku-latest', 'label' => 'Claude 3.5 Haiku'],
            ['value' => 'claude-3-5-sonnet-latest', 'label' => 'Claude 3.5 Sonnet'],
            ['value' => 'claude-3-opus-latest', 'label' => 'Claude 3 Opus'],
        ],
        'openai' => [
            ['value' => 'gpt-4o-mini', 'label' => 'GPT-4o mini'],
            ['value' => 'gpt-4o', 'label' => 'GPT-4o'],
            ['value' => 'gpt-4.1-mini', 'label' => 'GPT-4.1 mini'],
            ['value' => 'gpt-4.1', 'label' => 'GPT-4.1'],
        ],
        'openrouter' => [
            ['value' => 'meta-llama/llama-3.3-70b-instruct:free', 'label' => 'Llama 3.3 70B', 'free' => true],
            ['value' => 'google/gemma-2-9b-it:free', 'label' => 'Gemma 2 9B', 'free' => true],
            ['value' => 'mistralai/mistral-7b-instruct:free', 'label' => 'Mistral 7B', 'free' => true],
            ['value' => 'deepseek/deepseek-chat:free', 'label' => 'DeepSeek Chat', 'free' => true],
            ['value' => 'anthropic/claude-3.5-haiku', 'label' => 'Claude 3.5 Haiku'],
            ['value' => 'openai/gpt-4o-mini', 'label' => 'GPT-4o mini'],
        ],
        'groq' => [
            ['value' => 'llama-3.3-70b-versatile', 'label' => 'Llama 3.3 70B'],
            ['value' => 'llama-3.1-8b-instant', 'label' => 'Llama 3.1 8B Instant'],
            ['value' => 'gemma2-9b-it', 'label' => 'Gemma 2 9B'],
        ],
        'gemini' => [
            ['value' => 'gemini-1.5-flash', 'label' => 'Gemini 1.5 Flash'],
            ['value' => 'gemini-1.5-pro', 'label' => 'Gemini 1.5 Pro'],
            ['value' => 'gemini-2.0-flash', 'label' => 'Gemini 2.0 Flash'],
        ],
    ];

    /** Whether the given key is a supported provider. */
    public static function isProvider(string $driver): bool
    {
        return in_array($driver, self::PROVIDERS, true);
    }

    /** The default model for a provider (first in its catalog). */
    public static function defaultModel(string $provider): string
    {
        return self::CATALOG[$provider][0]['value'] ?? '';
    }
}
