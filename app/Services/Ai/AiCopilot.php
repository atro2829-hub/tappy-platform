<?php

namespace App\Services\Ai;

use App\Enums\TransactionType;
use App\Exceptions\DraftNotFoundException;
use App\Models\AiActivity;
use App\Models\Recipient;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Ai\Contracts\LlmProvider;
use App\Services\FeeCalculator;
use App\Services\GiftCardPurchaseInput;
use App\Services\GiftCardService;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\ProviderRegistry;
use App\Services\TopUpPurchaseInput;
use App\Services\TopUpService;
use App\Support\Money;
use Illuminate\Support\Facades\Cache;

/**
 * The brain of TopUp Copilot. Uses the configured {@see LlmProvider} for natural
 * language understanding, then resolves the request against the user's REAL data
 * (saved recipients, live operator detection, real fees) to produce a confirmable
 * top-up draft or a real-data answer. Every turn is logged to {@see AiActivity}.
 */
class AiCopilot
{
    public function __construct(
        private readonly LlmProvider $llm,
        private readonly TopUpService $topup,
        private readonly FeeCalculator $fees,
        private readonly GiftCardService $giftcards,
        private readonly GiftCardProvider $giftcardProvider,
    ) {}

    /**
     * @return array{reply: string, action: array<string, mixed>|null, intent: string}
     */
    public function ask(User $user, string $message): array
    {
        $system = $this->systemPrompt($user);
        $conversation = [...$this->history($user), ['role' => 'user', 'content' => $message]];

        $raw = $this->llm->complete($system, $conversation);

        // If the configured provider fails or returns nothing (bad key, model
        // unavailable, network error), fall back to the built-in deterministic
        // engine so the Copilot still understands the request instead of giving
        // a useless generic reply.
        if (blank($raw)) {
            $raw = (new FakeLlmProvider)->complete($system, $conversation);
        }

        $parsed = $this->parseJson($raw);
        $intent = (string) ($parsed['intent'] ?? 'chat');
        $reply = (string) ($parsed['reply'] ?? '');
        $action = null;

        if ($intent === 'balance') {
            $reply = $this->balanceReply($user);
        } elseif ($intent === 'status') {
            $reply = $this->statusReply($user);
        } elseif ($intent === 'topup') {
            $action = $this->buildTopupAction($user, $parsed);

            if ($action === null && empty($parsed['recipient'])) {
                $reply = 'Sure — who should I top up? Share a number or pick a saved recipient.';
            } elseif ($action === null && (float) ($parsed['amount'] ?? 0) <= 0) {
                $reply = 'How much would you like to send?';
            }
        } elseif ($intent === 'giftcard') {
            $action = $this->buildGiftcardAction($user, $parsed);

            if ($action === null && empty($parsed['brand'])) {
                $reply = 'Which gift card would you like — and for how much? (e.g. a $25 Amazon card)';
            } elseif ($action === null && (float) ($parsed['amount'] ?? 0) <= 0) {
                $reply = 'How much should the gift card be worth?';
            } elseif ($action === null) {
                $reply = "I couldn't find that brand. Try Amazon, Netflix, Google Play, Steam, Apple, Spotify and more.";
            }
        }

        $activity = AiActivity::query()->create([
            'user_id' => $user->id,
            'prompt' => $message,
            'intent' => $intent,
            'reply' => $reply,
            'action' => $action,
            'status' => $action !== null ? 'drafted' : 'answered',
        ]);

        // Tag the draft with its activity id so execute() can reload the
        // authoritative server-side action instead of trusting the client.
        if ($action !== null) {
            $action['activityId'] = $activity->id;
        }

        return ['reply' => $reply, 'action' => $action, 'intent' => $intent];
    }

    /**
     * Resolve a confirmed draft (top-up or gift card) into a real purchase.
     *
     * The client sends back only the draft's `activityId`; the executable
     * amounts/operator/recipient are reloaded from the {@see AiActivity} the
     * server itself produced in ask(), so a tampered client payload cannot
     * change what is charged. The activity id also keys idempotency, so a
     * double-click or retry never double-charges the wallet.
     *
     * @param  array<string, mixed>  $action
     */
    public function execute(User $user, array $action): Transaction
    {
        $activity = AiActivity::query()
            ->where('user_id', $user->id)
            ->whereKey((int) ($action['activityId'] ?? 0))
            ->first();

        $draft = is_array($activity?->action) ? $activity->action : null;
        $type = $draft['type'] ?? null;

        if ($draft === null || ! in_array($type, ['topup', 'giftcard'], true)) {
            throw new DraftNotFoundException;
        }

        $key = "copilot-{$activity->id}";

        $transaction = match ($type) {
            'giftcard' => $this->executeGiftcard($user, $draft, $key),
            default => $this->executeTopup($user, $draft, $key),
        };

        $activity->update(['status' => 'executed']);

        return $transaction;
    }

    /**
     * @param  array<string, mixed>  $draft
     */
    private function executeTopup(User $user, array $draft, string $key): Transaction
    {
        return $this->topup->purchase($user, new TopUpPurchaseInput(
            countryIso: (string) ($draft['country'] ?? 'US'),
            recipientPhone: (string) ($draft['recipientNumber'] ?? ''),
            amountUsdMinor: Money::toMinor((float) ($draft['usd'] ?? 0)),
            operatorId: (string) ($draft['operatorId'] ?? ''),
            operatorName: (string) ($draft['operator'] ?? ''),
            localAmountMinor: isset($draft['localAmount']) ? Money::toMinor((float) $draft['localAmount']) : null,
            localCurrency: $draft['cur'] ?? null,
            recipientName: $draft['recipientName'] ?? null,
            idempotencyKey: $key,
        ));
    }

    /**
     * @param  array<string, mixed>  $draft
     */
    private function executeGiftcard(User $user, array $draft, string $key): Transaction
    {
        return $this->giftcards->purchase($user, new GiftCardPurchaseInput(
            productId: (string) ($draft['productId'] ?? ''),
            brand: (string) ($draft['brand'] ?? ''),
            denomMinor: Money::toMinor((float) ($draft['denom'] ?? 0)),
            quantity: (int) ($draft['quantity'] ?? 1),
            recipient: (string) ($draft['recipientNumber'] ?? $user->email),
            deliverVia: (string) ($draft['deliverVia'] ?? 'email'),
            countryIso: (string) ($draft['country'] ?? 'US'),
            idempotencyKey: $key,
        ));
    }

    /**
     * @param  array<string, mixed>  $parsed
     * @return array<string, mixed>|null
     */
    private function buildTopupAction(User $user, array $parsed): ?array
    {
        $hint = trim((string) ($parsed['recipient'] ?? ''));

        if ($hint === '') {
            return null;
        }

        $recipient = $this->resolveRecipient($user, $hint);
        $phone = $recipient->recipient ?? $hint;
        $cur = strtoupper((string) ($parsed['currency'] ?? 'USD'));

        // Resolve the country in priority order: a saved recipient's country,
        // then the currency the user named (৳ ⇒ BD), then the phone's dial code.
        // A live provider returns no operator for the wrong country, so guessing
        // "US" for a foreign number would silently kill the draft.
        $country = $recipient->country
            ?? $this->countryForCurrency($cur)
            ?? $this->countryForPhone($phone)
            ?? 'US';

        $operator = $this->topup->detectOperator($phone, $country);

        if ($operator === null) {
            return null;
        }

        $amountVal = (float) ($parsed['amount'] ?? 0);

        if ($amountVal <= 0) {
            return null;
        }

        $usd = $cur === 'USD' ? $amountVal : $amountVal / max($operator->fxRate, 0.0001);
        $usdMinor = Money::toMinor($usd);
        $feeMinor = $this->fees->for(TransactionType::Airtime, $usdMinor);
        $local = $cur === 'USD' ? $usd * $operator->fxRate : $amountVal;

        return [
            'type' => 'topup',
            'action' => 'Airtime',
            'icon' => 'phone',
            'recipientName' => $recipient->name ?? null,
            'recipientNumber' => $phone,
            'recipientMask' => $this->mask($phone),
            'country' => $operator->countryIso,
            'countryName' => $operator->countryIso,
            'operatorId' => $operator->operatorId,
            'operator' => $operator->name,
            'product' => '$'.number_format(Money::toDecimal($usdMinor), 2).' airtime',
            'localAmount' => round($local, 2),
            'cur' => $operator->localCurrency,
            'usd' => Money::toDecimal($usdMinor),
            'fee' => Money::toDecimal($feeMinor),
            'discount' => 0,
            'total' => Money::toDecimal($usdMinor + $feeMinor),
            'eta' => 'Instant – 30s',
            'highValue' => ($usdMinor + $feeMinor) >= 10000,
            'status' => 'review',
        ];
    }

    /**
     * Resolve a gift-card request into a confirmable draft: match the brand to a
     * real product, snap the amount to the nearest available denomination, and
     * deliver to the user's own email. Returns null when the brand/amount can't
     * be resolved so ask() can prompt for the missing piece.
     *
     * @param  array<string, mixed>  $parsed
     * @return array<string, mixed>|null
     */
    private function buildGiftcardAction(User $user, array $parsed): ?array
    {
        $brandHint = strtolower(trim((string) ($parsed['brand'] ?? '')));
        $amount = (float) ($parsed['amount'] ?? 0);

        if ($brandHint === '' || $amount <= 0) {
            return null;
        }

        $product = collect($this->giftcardProducts())
            ->first(fn (array $p): bool => str_contains(strtolower($p['brand']), $brandHint));

        if ($product === null) {
            return null;
        }

        $denom = $this->nearest($product['denoms'] ?: [$amount], $amount);
        $faceMinor = Money::toMinor($denom);
        $feeMinor = $this->giftcards->computeFeeMinor($faceMinor);
        $email = (string) $user->email;

        return [
            'type' => 'giftcard',
            'action' => 'Gift card',
            'icon' => 'gift',
            'recipientName' => $user->name,
            'recipientNumber' => $email,
            'recipientMask' => $this->maskEmail($email),
            'country' => $product['countries'][0] ?? 'US',
            'countryName' => $product['countries'][0] ?? 'US',
            'productId' => (string) $product['id'],
            'brand' => $product['brand'],
            'operator' => $product['brand'],
            'product' => '$'.number_format($denom, 2).' '.$product['brand'].' gift card',
            'denom' => $denom,
            'quantity' => 1,
            'deliverVia' => 'email',
            'localAmount' => $denom,
            'cur' => 'USD',
            'usd' => Money::toDecimal($faceMinor),
            'fee' => Money::toDecimal($feeMinor),
            'discount' => 0,
            'total' => Money::toDecimal($faceMinor + $feeMinor),
            'eta' => 'Instant – by email',
            'highValue' => ($faceMinor + $feeMinor) >= 10000,
            'status' => 'review',
        ];
    }

    /**
     * Gift-card products, cached per provider driver to match the catalog page
     * and avoid a live provider round-trip on every drafted card.
     *
     * @return list<array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}>
     */
    private function giftcardProducts(): array
    {
        return Cache::remember(
            'giftcards:products:'.ProviderRegistry::activeId('giftcard'),
            now()->addHour(),
            fn (): array => $this->giftcardProvider->listProducts(null, 60),
        );
    }

    /**
     * The value in $denoms closest to $target.
     *
     * @param  list<float>  $denoms
     */
    private function nearest(array $denoms, float $target): float
    {
        return collect($denoms)->sortBy(fn (float $d): float => abs($d - $target))->first() ?? $target;
    }

    private function maskEmail(string $email): string
    {
        [$name, $domain] = array_pad(explode('@', $email, 2), 2, '');

        if ($domain === '') {
            return $email;
        }

        return substr($name, 0, 2).'•••@'.$domain;
    }

    /**
     * Best-guess ISO country for a named currency (covers the markets the app
     * serves), or null when it can't be mapped.
     */
    private function countryForCurrency(string $currency): ?string
    {
        return match (strtoupper($currency)) {
            'BDT' => 'BD',
            'NGN' => 'NG',
            'INR' => 'IN',
            'KES' => 'KE',
            'GHS' => 'GH',
            'PHP' => 'PH',
            'PKR' => 'PK',
            'IDR' => 'ID',
            'EGP' => 'EG',
            'ZAR' => 'ZA',
            'USD' => 'US',
            default => null,
        };
    }

    /**
     * Best-guess ISO country from an international dialling prefix (e.g. +880 ⇒
     * BD). Only fires for numbers written in E.164 form; null otherwise.
     */
    private function countryForPhone(string $phone): ?string
    {
        $digits = (string) preg_replace('/\D/', '', $phone);

        if (! str_starts_with(trim($phone), '+') && ! str_starts_with($digits, '00')) {
            return null;
        }

        $digits = ltrim($digits, '0');

        foreach (['880' => 'BD', '234' => 'NG', '254' => 'KE', '233' => 'GH', '91' => 'IN', '92' => 'PK', '63' => 'PH', '62' => 'ID', '20' => 'EG', '27' => 'ZA', '1' => 'US'] as $code => $iso) {
            if (str_starts_with($digits, $code)) {
                return $iso;
            }
        }

        return null;
    }

    private function resolveRecipient(User $user, string $hint): ?Recipient
    {
        $needle = strtolower($hint);
        $hintDigits = preg_replace('/\D/', '', $hint);

        return $user->recipients()->get()->first(function (Recipient $r) use ($needle, $hintDigits): bool {
            if (str_contains(strtolower($r->name), $needle)) {
                return true;
            }

            if (in_array($needle, array_map('strtolower', $r->rel ?? []), true)) {
                return true;
            }

            return $hintDigits !== '' && preg_replace('/\D/', '', $r->recipient) === $hintDigits;
        });
    }

    private function mask(string $raw): string
    {
        $digits = preg_replace('/\D/', '', $raw);

        if (strlen($digits) < 6) {
            return $raw;
        }

        return substr($raw, 0, 5).' ••• '.substr($digits, -3);
    }

    private function balanceReply(User $user): string
    {
        $balance = $user->wallet ? Money::toDecimal($user->wallet->balance_minor) : 0.0;

        return 'Your wallet balance is **$'.number_format($balance, 2).'**.';
    }

    private function statusReply(User $user): string
    {
        $txn = $user->transactions()->latest('id')->first();

        if ($txn === null) {
            return "You don't have any transactions yet.";
        }

        return 'Your most recent transaction is **'.$txn->reference.'** — '.$txn->type->label()
            .' of $'.number_format(Money::toDecimal($txn->amount_usd_minor), 2)
            .' · status **'.$txn->status->value.'**.';
    }

    /**
     * Recent conversation turns for the user, reconstructed from the audit log
     * so follow-ups ("send it to my dad too") keep context across messages.
     * Oldest first; only turns from the last 30 minutes are considered current.
     *
     * @return list<array{role: string, content: string}>
     */
    private function history(User $user, int $turns = 6): array
    {
        $rows = AiActivity::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMinutes(30))
            ->latest('id')
            ->limit($turns)
            ->get()
            ->reverse();

        $messages = [];

        foreach ($rows as $row) {
            $messages[] = ['role' => 'user', 'content' => (string) $row->prompt];

            if (filled($row->reply)) {
                $messages[] = ['role' => 'assistant', 'content' => (string) $row->reply];
            }
        }

        return $messages;
    }

    private function systemPrompt(User $user): string
    {
        $list = $user->recipients()->limit(10)->get()
            ->map(fn (Recipient $r): string => "- {$r->name}: {$r->recipient} ({$r->country})")
            ->implode("\n");

        return <<<PROMPT
        You are TopUp Copilot for Tappy, a global airtime and gift-card app.
        The user is {$user->name}. Their saved recipients:
        {$list}

        Understand the request and reply with ONLY a single JSON object, no other text:
        {"intent":"topup|giftcard|balance|status|help|chat",
         "reply":"<short friendly reply>",
         "recipient":"<phone number or a saved recipient name, for a top-up>",
         "amount":<number if stated>,
         "currency":"USD|BDT|NGN|INR|... if stated",
         "brand":"<gift card brand, for a giftcard>"}
        Resolve relationship words like "mum" to a saved recipient name when possible.
        Use the conversation so far to resolve follow-ups (e.g. "send the same to my dad").
        PROMPT;
    }

    /**
     * @return array<string, mixed>
     */
    private function parseJson(string $raw): array
    {
        if (preg_match('/\{.*\}/s', $raw, $m)) {
            $decoded = json_decode($m[0], true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [
            'intent' => 'chat',
            'reply' => $raw !== ''
                ? $raw
                : 'I can help with top-ups, gift cards and checking transactions. What would you like to do?',
        ];
    }
}
