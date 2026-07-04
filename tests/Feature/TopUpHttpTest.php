<?php

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('shows the wallet with balance and ledger', function () {
    Wallet::factory()->funded(50000)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->get(route('wallet'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('wallet')
            ->where('wallet.balanceMinor', 50000)
        );
});

it('redirects guests away from the wallet', function () {
    $this->get(route('wallet'))->assertRedirect(route('login'));
});

it('funds the wallet', function () {
    $this->actingAs($this->user)
        ->post(route('wallet.fund'), ['amount' => 100])
        ->assertRedirect(route('wallet'));

    expect($this->user->wallet()->first()->balance_minor)->toBe(10000);
});

it('validates the fund amount', function () {
    $this->actingAs($this->user)
        ->post(route('wallet.fund'), ['amount' => -5])
        ->assertSessionHasErrors('amount');
});

it('detects an operator', function () {
    $this->actingAs($this->user)
        ->post(route('topup.detect'), ['phone' => '+2348012345678', 'country' => 'NG'])
        ->assertOk()
        ->assertJsonPath('operatorId', '341');
});

it('purchases a top-up over HTTP and debits the wallet', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->postJson(route('topup.store'), [
        'country' => 'NG',
        'recipient' => '+2348012345678',
        'operator_id' => '341',
        'operator_name' => 'MTN Nigeria',
        'amount' => 5,
    ])->assertSuccessful()->assertJsonPath('status', 'success');

    $txn = Transaction::query()->first();

    expect($txn->status)->toBe(TransactionStatus::Success)
        ->and($this->user->wallet()->first()->balance_minor)->toBe(100000 - 528);
});

it('returns 422 when the wallet cannot afford the top-up', function () {
    Wallet::factory()->funded(100)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->postJson(route('topup.store'), [
        'country' => 'NG',
        'recipient' => '+2348012345678',
        'operator_id' => '341',
        'operator_name' => 'MTN Nigeria',
        'amount' => 5,
    ])->assertStatus(422);

    expect(Transaction::count())->toBe(0);
});

it('rejects a purchase with missing fields', function () {
    $this->actingAs($this->user)
        ->post(route('topup.store'), ['country' => 'NG'])
        ->assertSessionHasErrors(['recipient', 'operator_id', 'operator_name', 'amount']);
});

it('returns 422 JSON (not a redirect) when an XHR top-up fails validation', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    // A fetch/XHR request (expects JSON, not Inertia) below the $0.50 minimum
    // must get a readable 422 — not a 302 redirect the client can't parse.
    $this->actingAs($this->user)->postJson(route('topup.store'), [
        'country' => 'BD',
        'recipient' => '+8801712345678',
        'operator_id' => '23',
        'operator_name' => 'GrameenPhone Bangladesh',
        'amount' => 0.38,
    ])->assertStatus(422)->assertJsonValidationErrors(['amount']);

    expect(Transaction::count())->toBe(0);
});

it('shows a receipt to the owner and forbids others', function () {
    $txn = Transaction::factory()->success()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->get(route('transactions.show', $txn))
        ->assertOk()
        ->assertJsonPath('reference', $txn->reference);

    $this->actingAs(User::factory()->create())
        ->get(route('transactions.show', $txn))
        ->assertForbidden();
});

it('lists the user transactions', function () {
    Transaction::factory()->count(3)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->get(route('transactions'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('transactions'));
});
