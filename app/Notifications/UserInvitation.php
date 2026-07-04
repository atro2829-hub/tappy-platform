<?php

namespace App\Notifications;

use App\Support\SystemSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Emails an admin-invited user a secure link to set their password (the account
 * is created with a random one), so the invitation works out of the box.
 */
class UserInvitation extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = SystemSettings::appName();
        $url = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject("You've been invited to {$appName}")
            ->greeting("Welcome to {$appName}!")
            ->line('An administrator has created an account for you. Set a password to get started.')
            ->action('Set your password', $url)
            ->line('If you weren’t expecting this invitation, you can safely ignore this email.');
    }
}
