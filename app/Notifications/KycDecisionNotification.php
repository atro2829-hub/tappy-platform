<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Tells a user the outcome of their KYC review (approved / rejected / review).
 */
class KycDecisionNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $decision) {}

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
        return match ($this->decision) {
            'approved' => [
                'icon' => 'shieldcheck',
                'color' => 'success',
                'title' => 'KYC approved',
                'desc' => 'Your account is verified — you can now transact at full limits.',
                'url' => '/dashboard',
            ],
            'rejected' => [
                'icon' => 'xcircle',
                'color' => 'destructive',
                'title' => 'KYC rejected',
                'desc' => 'Your verification was not approved. Please resubmit your documents.',
                'url' => '/support',
            ],
            default => [
                'icon' => 'clock',
                'color' => 'warning',
                'title' => 'KYC under review',
                'desc' => 'We need a little more information to verify your account.',
                'url' => '/support',
            ],
        };
    }
}
