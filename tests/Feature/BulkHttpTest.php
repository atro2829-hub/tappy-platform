<?php

use App\Jobs\ProcessBulkBatchJob;
use App\Models\BulkBatch;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\TopUpService;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

function bulkCsv(string $content): File
{
    return File::createWithContent('payouts.csv', $content);
}

it('shows a batch with its real per-row items to the owner', function () {
    $batch = BulkBatch::factory()->create(['user_id' => $this->user->id]);
    $batch->items()->create(['country' => 'NG', 'recipient' => '+2348031110001', 'amount_usd_minor' => 500, 'status' => 'success']);
    $batch->items()->create(['country' => 'KE', 'recipient' => '+254712110002', 'amount_usd_minor' => 300, 'status' => 'failed']);

    $this->actingAs($this->user)->get(route('bulk.show', $batch))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bulk')
            ->has('detail.items', 2)
            ->where('detail.batch.id', 'BATCH-'.$batch->id));
});

it('forbids viewing another user\'s batch', function () {
    $batch = BulkBatch::factory()->create();

    $this->actingAs($this->user)->get(route('bulk.show', $batch))->assertForbidden();
});

it('renders the bulk page with only the user\'s batches', function () {
    BulkBatch::factory()->count(2)->create(['user_id' => $this->user->id]);
    BulkBatch::factory()->create();

    $this->actingAs($this->user)->get(route('bulk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('bulk')->has('batches', 2));
});

it('badges only in-flight bulk batches in the sidebar', function () {
    $business = User::factory()->business()->create();
    BulkBatch::factory()->create(['user_id' => $business->id, 'status' => 'queued']);
    BulkBatch::factory()->create(['user_id' => $business->id, 'status' => 'processing']);
    BulkBatch::factory()->create(['user_id' => $business->id, 'status' => 'completed']);

    // Completed/failed batches have nothing left to act on, so only the two
    // in-flight batches show on the badge.
    $this->actingAs($business)->get(route('bulk'))
        ->assertInertia(fn (Assert $page) => $page->where('navBadges.bulk', 2));
});

it('uploads a CSV and creates a queued batch with the correct row count', function () {
    Bus::fake();

    $csv = "country,recipient,amount\nNG,+2348035550142,5.00\nKE,+254712998221,3.50\nBD,+8801712345678,2.00\n";

    $this->actingAs($this->user)
        ->post(route('bulk.store'), ['file' => bulkCsv($csv)])
        ->assertRedirect();

    $batch = BulkBatch::query()->where('user_id', $this->user->id)->first();

    expect($batch)->not->toBeNull()
        ->and($batch->name)->toBe('payouts.csv')
        ->and($batch->total)->toBe(3)
        ->and($batch->status)->toBe('queued')
        // 5.00 + 3.50 + 2.00 = 10.50 -> 1050 minor units
        ->and($batch->amount_usd_minor)->toBe(1050)
        ->and($batch->items()->count())->toBe(3);

    Bus::assertDispatched(ProcessBulkBatchJob::class);
});

it('processes a queued batch into real top-ups, debiting the wallet', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    $batch = BulkBatch::factory()->create(['user_id' => $this->user->id, 'total' => 2, 'status' => 'queued']);
    $batch->items()->createMany([
        ['country' => 'NG', 'recipient' => '+2348035550142', 'amount_usd_minor' => 500, 'status' => 'pending'],
        ['country' => 'KE', 'recipient' => '+254712998221', 'amount_usd_minor' => 350, 'status' => 'pending'],
    ]);

    (new ProcessBulkBatchJob($batch->id))->handle(app(TopUpService::class));

    $batch->refresh();

    expect($batch->status)->toBe('completed')
        ->and($batch->succeeded)->toBe(2)
        ->and($batch->failed)->toBe(0)
        ->and(Transaction::query()->where('user_id', $this->user->id)->count())->toBe(2)
        ->and($this->user->wallet()->first()->balance_minor)->toBeLessThan(100000);
});

it('resumes a partly-processed batch, only touching pending rows', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    $batch = BulkBatch::factory()->create(['user_id' => $this->user->id, 'total' => 2, 'status' => 'queued']);
    // One row already succeeded on a prior run; one still pending.
    $done = $batch->items()->create(['country' => 'NG', 'recipient' => '+2348031110001', 'amount_usd_minor' => 500, 'status' => 'succeeded', 'transaction_id' => null]);
    $batch->items()->create(['country' => 'NG', 'recipient' => '+2348035550142', 'amount_usd_minor' => 500, 'status' => 'pending']);

    (new ProcessBulkBatchJob($batch->id))->handle(app(TopUpService::class));

    $batch->refresh();
    // Only the pending row was charged (1 transaction), tally counts both done rows.
    expect(Transaction::query()->where('user_id', $this->user->id)->count())->toBe(1)
        ->and($batch->succeeded)->toBe(2)
        ->and($batch->status)->toBe('completed')
        ->and($done->fresh()->status)->toBe('succeeded');
});

it('marks an item failed when the operator country is unknown', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    $batch = BulkBatch::factory()->create(['user_id' => $this->user->id, 'total' => 1, 'status' => 'queued']);
    $batch->items()->create([
        'country' => 'ZZ', 'recipient' => '+19999999999', 'amount_usd_minor' => 500, 'status' => 'pending',
    ]);

    (new ProcessBulkBatchJob($batch->id))->handle(app(TopUpService::class));

    expect($batch->fresh()->failed)->toBe(1)
        ->and(Transaction::query()->where('user_id', $this->user->id)->count())->toBe(0);
});

it('validates the upload requires a file', function () {
    $this->actingAs($this->user)->post(route('bulk.store'), [])
        ->assertSessionHasErrors(['file']);
});

it('caps bulk CSV rows at 5000', function () {
    Bus::fake();

    $csv = "country,recipient,amount\n";
    for ($i = 0; $i < 5100; $i++) {
        $csv .= "NG,+2348035{$i},1.00\n";
    }

    $this->actingAs($this->user)->post(route('bulk.store'), ['file' => bulkCsv($csv)])
        ->assertRedirect();

    $batch = BulkBatch::query()->where('user_id', $this->user->id)->first();
    expect($batch->items()->count())->toBe(5000)
        ->and($batch->total)->toBe(5000);
});

it('rejects unsupported bulk product types', function () {
    $csv = "country,recipient,amount\nNG,+2348035550142,5.00\n";

    $this->actingAs($this->user)
        ->post(route('bulk.store'), ['file' => bulkCsv($csv), 'type' => 'giftcard'])
        ->assertSessionHasErrors(['type']);

    expect(BulkBatch::count())->toBe(0);
});

it('processes a data batch as a data transaction', function () {
    Wallet::factory()->funded(100000)->create(['user_id' => $this->user->id]);

    $batch = BulkBatch::factory()->create(['user_id' => $this->user->id, 'total' => 1, 'status' => 'queued', 'type' => 'data']);
    $batch->items()->create([
        'country' => 'NG', 'recipient' => '+2348035550142', 'amount_usd_minor' => 500, 'status' => 'pending',
    ]);

    (new ProcessBulkBatchJob($batch->id))->handle(app(TopUpService::class));

    $txn = Transaction::query()->where('user_id', $this->user->id)->first();
    expect($txn)->not->toBeNull()
        ->and($txn->type->value)->toBe('data');
});

it('rejects a non-CSV upload', function () {
    $this->actingAs($this->user)
        ->post(route('bulk.store'), ['file' => File::image('photo.jpg')])
        ->assertSessionHasErrors(['file']);

    expect(BulkBatch::count())->toBe(0);
});

it('requires authentication to view batches', function () {
    $this->get(route('bulk'))->assertRedirect(route('login'));
});

it('requires authentication to upload', function () {
    $this->post(route('bulk.store'), ['file' => bulkCsv("NG,+2348035550142,5.00\n")])
        ->assertRedirect(route('login'));
});
