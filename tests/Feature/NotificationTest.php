<?php

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\KycDecisionNotification;
use App\Notifications\TransactionFailedNotification;
use App\Services\Providers\Data\TopUpResult;
use App\Services\SettlementService;
use Illuminate\Support\Facades\Notification;

it('notifies the customer when a transaction fails and is refunded', function () {
    Notification::fake();

    $user = User::factory()->create();
    Wallet::factory()->funded(100000)->create(['user_id' => $user->id]);
    $txn = Transaction::factory()->processing()->create([
        'user_id' => $user->id,
        'amount_usd_minor' => 1000,
        'fee_minor' => 50,
    ]);

    app(SettlementService::class)->settle($txn, new TopUpResult(
        status: TransactionStatus::Failed,
        providerTransactionId: null,
        providerStatus: 'FAILED',
        raw: [],
    ));

    Notification::assertSentTo($user, TransactionFailedNotification::class);
});

it('notifies the user when their KYC decision is made', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['kyc_status' => 'pending']);

    $this->actingAs($admin)->patch(route('admin.users.update', $user), ['kyc_status' => 'approved']);

    Notification::assertSentTo($user, KycDecisionNotification::class);
});

it('marks all notifications read', function () {
    $user = User::factory()->create();
    $user->notify(new KycDecisionNotification('approved'));

    expect($user->unreadNotifications()->count())->toBe(1);

    $this->actingAs($user)->post(route('notifications.read'))->assertRedirect();

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('exposes unread notification count as a shared prop', function () {
    $user = User::factory()->create();
    $user->notify(new KycDecisionNotification('rejected'));

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('unreadNotifications', 1));
});
