<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run due recurring top-up automations once a day.
Schedule::command('automations:run')->daily();

// Top up wallets that have fallen below their auto-reload threshold.
Schedule::command('wallet:auto-reload')->hourly();

// Re-poll in-flight transactions so asynchronous providers (e.g. Giftbit, which
// returns "processing" on order and settles seconds later) are confirmed quickly
// rather than sitting in processing for up to an hour. This only refunds once a
// transaction is past the hard timeout (24h) — recent ones are polled, never
// refunded — so a tight window is safe.
Schedule::command('transactions:reconcile --minutes=2')->everyFiveMinutes();
