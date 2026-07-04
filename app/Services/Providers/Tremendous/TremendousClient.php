<?php

namespace App\Services\Providers\Tremendous;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the Tremendous API v2 (gift cards & payouts).
 *
 * Authentication is a bearer API key. Tremendous runs a separate sandbox host
 * (testflight) from production, selected by the `sandbox` flag.
 *
 * @see https://developers.tremendous.com/
 */
class TremendousClient
{
    private const SANDBOX_URL = 'https://testflight.tremendous.com/api/v2';

    private const PRODUCTION_URL = 'https://api.tremendous.com/api/v2';

    public function __construct(
        private readonly string $apiKey,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.tremendous.api_key'),
            (bool) config('services.tremendous.sandbox', true),
        );
    }

    public function baseUrl(): string
    {
        return $this->sandbox ? self::SANDBOX_URL : self::PRODUCTION_URL;
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
     * A request pre-configured with the bearer token and timeouts. Only
     * connection-level failures retry: order creation is made idempotent by
     * `external_id`, but a 4xx/5xx means Tremendous already saw the request.
     */
    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->withToken($this->apiKey)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, fn (Throwable $e): bool => $e instanceof ConnectionException, throw: false)
            ->asJson();
    }
}
