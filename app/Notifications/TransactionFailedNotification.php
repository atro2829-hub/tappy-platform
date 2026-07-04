<?php

namespace App\Notifications;

use App\Models\Transaction;
use App\Support\Money;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Tells the customer their transaction failed and was refunded in full.
 */
class TransactionFailedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Transaction $transaction) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $refunded = $this->transaction->status->value === 'refunded';
        $amount = '$'.number_format(Money::toDecimal($this->transaction->totalChargeMinor()), 2);

        return [
            'icon' => $refunded ? 'refresh' : 'xcircle',
            'color' => $refunded ? 'info' : 'destructive',
            'title' => $refunded ? 'Transaction refunded' : 'Transaction failed',
            'desc' => $this->transaction->reference.' · '.$amount.' returned to your wallet',
            'url' => '/transactions',
        ];
    }
}
