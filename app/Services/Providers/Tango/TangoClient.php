<?php

namespace App\Services\Providers\Tango;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the Tango Card RaaS API v2 (gift cards / rewards).
 *
 * Authentication is HTTP Basic (Platform Name + Platform Key). Tango uses a
 * separate integration host for sandbox, selected by the `sandbox` flag.
 *
 * @see https://developers.tangocard.com/docs/api-endpoint-overview
 */
class TangoClient
{
    private const PRODUCTION_URL = 'https://api.tangocard.com/raas/v2';

    private const SANDBOX_URL = 'https://integration-api.tangocard.com/raas/v2';

    public function __construct(
        private readonly string $platformName,
        private readonly string $platformKey,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.tango.platform_name'),
            (string) config('services.tango.platform_key'),
            (bool) config('services.tango.sandbox', true),
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
     * A request pre-configured with Basic auth. Only connection failures retry:
     * an order's externalRefID makes it idempotent, but a 4xx/5xx means Tango
     * already saw the request.
     */
    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->withBasicAuth($this->platformName, $this->platformKey)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, fn (Throwable $e): bool => $e instanceof ConnectionException, throw: false)
            ->asJson();
    }
}
