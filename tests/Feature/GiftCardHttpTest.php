<?php

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Reloadly\ReloadlyClient;
use App\Services\Providers\Reloadly\ReloadlyGiftCardProvider;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

function giftPayload(array $overrides = []): array
{
    return array_merge([
        'product_id' => 'gc_amazon',
        'brand' => 'Amazon',
        'denom' => 25,
        'quantity' => 2,
        'recipient' => 'friend@example.com',
        'deliver_via' => 'email',
        'country' => 'US',
    ], $overrides);
}

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->wallet = Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);
});

it('purchases a gift card and debits face value + 4% fee', function () {
    // face = 25 * 2 = $50 (5000 minor); fee = 4% = $2 (200); total = $52 (5200)
    $this->actingAs($this->user)->postJson(route('giftcards.store'), giftPayload())
        ->assertSuccessful()->assertJsonPath('status', 'success');

    $txn = Transaction::query()->first();

    expect($txn->type)->toBe(TransactionType::GiftCard)
        ->and($txn->amount_usd_minor)->toBe(5000)
        ->and($txn->fee_minor)->toBe(200)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100000 - 5200);
});

it('refunds the wallet when the gift card fails', function () {
    $this->actingAs($this->user)
        ->postJson(route('giftcards.store'), giftPayload(['recipient' => 'fail@example.com']))
        ->assertSuccessful();

    $txn = Transaction::query()->first();

    expect($txn->status)->toBe(TransactionStatus::Failed)
        ->and($this->wallet->fresh()->balance_minor)->toBe(100000);
});

it('returns 422 when the wallet cannot afford the gift card', function () {
    $this->wallet->update(['balance_minor' => 100]);

    $this->actingAs($this->user)->postJson(route('giftcards.store'), giftPayload())
        ->assertStatus(422);

    expect(Transaction::count())->toBe(0);
});

it('validates the gift card request', function () {
    $this->actingAs($this->user)->post(route('giftcards.store'), ['brand' => 'Amazon'])
        ->assertSessionHasErrors(['product_id', 'denom', 'quantity', 'recipient', 'deliver_via']);
});

it('requires authentication', function () {
    $this->post(route('giftcards.store'), giftPayload())->assertRedirect(route('login'));
});

it('renders the catalog page with products', function () {
    $this->actingAs($this->user)->get(route('giftcards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('giftcards')->has('products'));
});

it('lists products from the fake provider', function () {
    $products = app(GiftCardProvider::class)->listProducts();

    expect($products)->not->toBeEmpty()
        ->and($products[0])->toHaveKeys(['id', 'brand', 'cat', 'denoms', 'countries']);
});

it('maps reloadly products to the normalized shape', function () {
    Http::fake([
        'auth.reloadly.com/*' => Http::response(['access_token' => 'tok', 'expires_in' => 86400]),
        'giftcards-sandbox.reloadly.com/products*' => Http::response(['content' => [[
            'productId' => 16627,
            'productName' => 'Netflix Portugal',
            'denominationType' => 'RANGE',
            'minSenderDenomination' => 30.41,
            'maxSenderDenomination' => 109.42,
            'senderCurrencyCode' => 'USD',
            'category' => ['name' => 'Streaming'],
            'country' => ['isoName' => 'PT'],
            'logoUrls' => ['https://cdn.example/netflix.webp'],
        ]]]),
    ]);

    $provider = new ReloadlyGiftCardProvider(
        new ReloadlyClient('id', 'secret', sandbox: true, service: 'giftcards'),
    );

    $products = $provider->listProducts();

    expect($products)->toHaveCount(1)
        ->and($products[0]['id'])->toBe('16627')
        ->and($products[0]['brand'])->toBe('Netflix Portugal')
        ->and($products[0]['cat'])->toBe('Streaming')
        ->and($products[0]['countries'])->toBe(['PT'])
        ->and($products[0]['denoms'])->not->toBeEmpty();
});
