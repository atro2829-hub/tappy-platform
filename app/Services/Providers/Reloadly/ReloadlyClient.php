<?php

namespace App\Services\Providers\Reloadly;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the Reloadly APIs (airtime, gift cards, utilities).
 *
 * Handles OAuth2 client-credentials auth — the token is cached per service +
 * environment until shortly before it expires — and exposes generic GET/POST;
 * the endpoint paths live in the per-service providers.
 */
class ReloadlyClient
{
    private const AUTH_URL = 'https://auth.reloadly.com/oauth/token';

    /**
     * Base URLs (which double as the OAuth "audience") + versioned Accept header per service.
     *
     * @var array<string, array{sandbox: string, production: string, accept: string}>
     */
    private const SERVICES = [
        'airtime' => [
            'sandbox' => 'https://topups-sandbox.reloadly.com',
            'production' => 'https://topups.reloadly.com',
            'accept' => 'application/com.reloadly.topups-v1+json',
        ],
        'giftcards' => [
            'sandbox' => 'https://giftcards-sandbox.reloadly.com',
            'production' => 'https://giftcards.reloadly.com',
            'accept' => 'application/com.reloadly.giftcards-v1+json',
        ],
    ];

    public function __construct(
        private readonly string $clientId,
        private readonly string $clientSecret,
        private readonly bool $sandbox = true,
        private readonly string $service = 'airtime',
    ) {}

    public static function fromConfig(string $service = 'airtime'): self
    {
        return new self(
            (string) config('services.reloadly.client_id'),
            (string) config('services.reloadly.client_secret'),
            (bool) config('services.reloadly.sandbox', true),
            $service,
        );
    }

    /**
     * The service base URL, which doubles as the OAuth "audience".
     */
    public function baseUrl(): string
    {
        $service = self::SERVICES[$this->service];

        return $this->sandbox ? $service['sandbox'] : $service['production'];
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, array $query = []): array
    {
        return $this->http()->get($path, $query)->throw()->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function post(string $path, array $body = []): array
    {
        return $this->http()->post($path, $body)->throw()->json() ?? [];
    }

    /**
     * Only retry when the request never reached Reloadly (a connection-level
     * failure). A 4xx/5xx response means the server saw the request: resending
     * a non-idempotent write — e.g. utility `/pay`, which consumes its
     * `referenceId` even on a rejected attempt — risks a double-charge or masks
     * the real outcome behind a "reference already used" error.
     */
    private static function retryOnConnectionFailureOnly(Throwable $e): bool
    {
        return $e instanceof ConnectionException;
    }

    /**
     * A request pre-configured with the bearer token and versioned Accept header.
     */
    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->withToken($this->accessToken())
            ->withHeaders(['Accept' => self::SERVICES[$this->service]['accept']])
            // Bound every call so a slow/hung provider can't tie up a worker.
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, self::retryOnConnectionFailureOnly(...), throw: false)
            ->asJson();
    }

    /**
     * A cached OAuth access token, fetched on demand and reused until expiry.
     */
    private function accessToken(): string
    {
        $key = 'reloadly:'.$this->service.':token:'.($this->sandbox ? 'sandbox' : 'production');

        $cached = Cache::get($key);

        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $response = Http::acceptJson()->asJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, self::retryOnConnectionFailureOnly(...), throw: false)
            ->post(self::AUTH_URL, [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'grant_type' => 'client_credentials',
                'audience' => $this->baseUrl(),
            ])->throw();

        $token = (string) $response->json('access_token');
        $expiresIn = (int) $response->json('expires_in', 3600);

        Cache::put($key, $token, now()->addSeconds(max(60, $expiresIn - 60)));

        return $token;
    }
}
