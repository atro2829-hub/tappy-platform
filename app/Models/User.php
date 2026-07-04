<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'role', 'status', 'kyc_status', 'business_name', 'country'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => Role::class,
        ];
    }

    /**
     * Whether the account has been suspended by an admin.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * The user's funding wallet.
     *
     * @return HasOne<Wallet, $this>
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * @return HasMany<Recipient, $this>
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(Recipient::class);
    }

    /**
     * @return HasMany<ApiKey, $this>
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    /**
     * @return HasMany<WebhookEvent, $this>
     */
    public function webhookEvents(): HasMany
    {
        return $this->hasMany(WebhookEvent::class);
    }

    /**
     * @return HasOne<WebhookEndpoint, $this>
     */
    public function webhookEndpoint(): HasOne
    {
        return $this->hasOne(WebhookEndpoint::class);
    }

    /**
     * Return the user's webhook endpoint, creating a default one (fresh signing
     * secret, all events subscribed, no URL yet) on first access.
     */
    public function webhookEndpointOrCreate(): WebhookEndpoint
    {
        return $this->webhookEndpoint()->firstOrCreate([], [
            'secret' => WebhookEndpoint::generateSecret(),
            'events' => WebhookEndpoint::AVAILABLE_EVENTS,
        ]);
    }

    /**
     * @return HasMany<Automation, $this>
     */
    public function automations(): HasMany
    {
        return $this->hasMany(Automation::class);
    }

    /**
     * @return HasMany<BulkBatch, $this>
     */
    public function bulkBatches(): HasMany
    {
        return $this->hasMany(BulkBatch::class);
    }

    /**
     * Downstream customers served by this user (when acting as a reseller).
     *
     * @return HasMany<Customer, $this>
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'reseller_id');
    }

    /**
     * KYC documents the user has uploaded for verification.
     *
     * @return HasMany<KycDocument, $this>
     */
    public function kycDocuments(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }
}
