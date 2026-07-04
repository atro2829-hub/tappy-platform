<?php

use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('paginates transactions server-side with a true total', function () {
    Transaction::factory()->count(45)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->get(route('transactions'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions')
            ->has('transactions', 20) // one page
            ->where('pagination.total', 45)
            ->where('pagination.lastPage', 3)
            ->where('pagination.currentPage', 1));
});

it('returns the requested page', function () {
    Transaction::factory()->count(25)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->get(route('transactions', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pagination.currentPage', 2)
            ->has('transactions', 5));
});

it('filters by search across all transactions, not just the first page', function () {
    Transaction::factory()->count(30)->create(['user_id' => $this->user->id]);
    Transaction::factory()->create([
        'user_id' => $this->user->id,
        'reference' => 'TXN-FINDME-001',
    ]);

    $this->actingAs($this->user)->get(route('transactions', ['search' => 'FINDME']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pagination.total', 1)
            ->has('transactions', 1));
});

it('filters by status', function () {
    Transaction::factory()->count(3)->success()->create(['user_id' => $this->user->id]);
    Transaction::factory()->count(2)->failed()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->get(route('transactions', ['status' => 'failed']))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 2));
});

it('only ever lists the acting user\'s transactions', function () {
    Transaction::factory()->count(3)->create(['user_id' => $this->user->id]);
    Transaction::factory()->count(5)->create();

    $this->actingAs($this->user)->get(route('transactions'))
        ->assertInertia(fn (Assert $page) => $page->where('pagination.total', 3));
});

it('returns a transaction status by reference for the owner', function () {
    $txn = Transaction::factory()->processing()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->getJson(route('transactions.status', $txn->reference))
        ->assertOk()
        ->assertJson(['reference' => $txn->reference, 'status' => 'processing']);
});

it('does not expose another user\'s transaction status', function () {
    $txn = Transaction::factory()->create();

    $this->actingAs($this->user)->getJson(route('transactions.status', $txn->reference))
        ->assertNotFound();
});
