<?php

namespace App\Services\Providers\DtOne;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the DT One DVS API v1 (global airtime, data, bundles).
 *
 * Authentication is HTTP Basic (API key + secret). DT One runs a separate
 * pre-production host for sandbox testing, selected by the `sandbox` flag.
 *
 * @see https://dvs-api-doc.dtone.com/
 */
class DtOneClient
{
    private const PRODUCTION_URL = 'https://dvs-api.dtone.com/v1';

    private const SANDBOX_URL = 'https://preprod-dvs-api.dtone.com/v1';

    public function __construct(
        private readonly string $apiKey,
        private readonly string $apiSecret,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.dtone.api_key'),
            (string) config('services.dtone.api_secret'),
            (bool) config('services.dtone.sandbox', true),
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
     * A request pre-configured with Basic auth and timeouts. Only connection
     * failures retry: transactions are made idempotent by `external_id`, but a
     * 4xx/5xx means DT One already saw (and may have actioned) the request.
     */
    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->withBasicAuth($this->apiKey, $this->apiSecret)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, fn (Throwable $e): bool => $e instanceof ConnectionException, throw: false)
            ->asJson();
    }
}
