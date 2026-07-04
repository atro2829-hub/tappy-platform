<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\LlmProvider;

/**
 * Deterministic, network-free "LLM" — keyword intent + entity extraction that
 * emits the same JSON shape a real model is prompted to return. Lets the copilot
 * work (and tests run) with no API key; swap in Anthropic/OpenRouter for real NLU.
 */
class FakeLlmProvider implements LlmProvider
{
    public function complete(string $system, array $messages): string
    {
        // The deterministic engine has no real memory; it classifies the latest
        // user turn. (A real provider receives the full conversation.)
        $last = '';
        foreach (array_reverse($messages) as $m) {
            if (($m['role'] ?? null) === 'user') {
                $last = (string) ($m['content'] ?? '');
                break;
            }
        }

        $text = strtolower($last);
        $intent = $this->intent($text);
        $amount = $this->amount($text);
        $recipient = $this->recipient($text);
        $brand = $this->brand($text);

        return (string) json_encode(array_filter([
            'intent' => $intent,
            'reply' => $this->reply($intent, $recipient, $amount, $brand),
            'recipient' => $recipient,
            'amount' => $amount['value'] ?? null,
            'currency' => $amount['cur'] ?? null,
            'brand' => $brand,
        ], fn ($v): bool => $v !== null));
    }

    private function intent(string $t): string
    {
        return match (true) {
            (bool) preg_match('/gift\s?card|amazon|netflix|steam|spotify|google play|playstation|xbox|itunes/', $t) => 'giftcard',
            (bool) preg_match('/balance|how much.*(wallet|left)|wallet balance/', $t) => 'balance',
            (bool) preg_match('/check|status|last (transaction|recharge|order)|didn.?t arrive|not received|failed/', $t) => 'status',
            (bool) preg_match('/recharge|top ?up|airtime|send|load|data|bundle/', $t) || (bool) preg_match('/\d{6,}/', $t) => 'topup',
            (bool) preg_match('/^(hi|hello|hey|help)\b/', $t) => 'help',
            default => 'chat',
        };
    }

    /**
     * @return array{value: float, cur: string}|array{}
     */
    private function amount(string $t): array
    {
        $maps = [
            '/৳\s?(\d[\d,]*)|(\d[\d,]*)\s?(?:tk|taka|bdt)/' => 'BDT',
            '/\$\s?(\d[\d,]*)|(\d[\d,]*)\s?(?:dollars?|usd|bucks?)/' => 'USD',
            '/₦\s?(\d[\d,]*)|(\d[\d,]*)\s?(?:naira|ngn)/' => 'NGN',
            '/₹\s?(\d[\d,]*)|(\d[\d,]*)\s?(?:rupees?|inr)/' => 'INR',
        ];

        foreach ($maps as $pattern => $cur) {
            if (preg_match($pattern, $t, $m)) {
                $value = (float) str_replace(',', '', $m[1] !== '' ? $m[1] : ($m[2] ?? '0'));

                return ['value' => $value, 'cur' => $cur];
            }
        }

        return [];
    }

    private function recipient(string $t): ?string
    {
        if (preg_match('/(\+?\d[\d\s-]{6,}\d)/', $t, $m)) {
            return preg_replace('/[\s-]/', '', $m[1]);
        }

        foreach (['mother', 'mom', 'mum', 'amma', 'maa', 'father', 'dad', 'brother', 'sister', 'wife', 'husband', 'son', 'daughter'] as $rel) {
            if (preg_match('/\b'.$rel.'\b/', $t)) {
                return $rel;
            }
        }

        return null;
    }

    private function brand(string $t): ?string
    {
        foreach (['amazon', 'netflix', 'steam', 'spotify', 'google play', 'playstation', 'xbox', 'apple', 'starbucks'] as $brand) {
            if (str_contains($t, $brand)) {
                return ucwords($brand);
            }
        }

        return null;
    }

    /**
     * @param  array{value?: float, cur?: string}  $amount
     */
    private function reply(string $intent, ?string $recipient, array $amount, ?string $brand): string
    {
        return match ($intent) {
            'topup' => $recipient
                ? 'Sure — I can top that up. Review the order below and confirm.'
                : 'Sure — who should I top up? Share a number or pick a saved recipient.',
            'giftcard' => $brand
                ? "Great choice — a {$brand} gift card. Confirm the order below."
                : 'Which gift card would you like? Tell me the brand and amount.',
            'balance' => 'Here is your current wallet balance.',
            'status' => 'Here is your most recent transaction and its status.',
            'help' => "Hi! I'm TopUp Copilot. Ask me to send airtime/data, buy gift cards, or check a transaction — in your own words.",
            default => 'I can help with top-ups, gift cards and checking transactions. What would you like to do?',
        };
    }
}
