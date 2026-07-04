<?php

namespace App\Services\Providers\DingConnect;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the DingConnect V1 API (airtime, data, bundles).
 *
 * Authentication is a single API key sent in the `api_key` header — there is no
 * OAuth handshake. DingConnect uses one host for live and test; "sandbox" here
 * means every SendTransfer is sent with ValidateOnly=true (a provider-side
 * dry-run that never moves money), so buyers can exercise the flow safely.
 *
 * @see https://www.dingconnect.com/Api/Description
 */
class DingConnectClient
{
    private const BASE_URL = 'https://api.dingconnect.com';

    public function __construct(
        private readonly string $apiKey,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.dingconnect.api_key'),
            (bool) config('services.dingconnect.sandbox', true),
        );
    }

    /** Whether transfers are restricted to provider-side dry-runs. */
    public function isSandbox(): bool
    {
        return $this->sandbox;
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
     * A request pre-configured with the API key header and timeouts.
     *
     * Only connection-level failures are retried: a 4xx/5xx means DingConnect
     * saw the request, and resending a SendTransfer whose DistributorRef was
     * already consumed would trip "DuplicateTransactionPrevented" rather than
     * recover.
     */
    private function http(): PendingRequest
    {
        return Http::baseUrl(self::BASE_URL)
            ->withHeaders(['api_key' => $this->apiKey])
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, fn (Throwable $e): bool => $e instanceof ConnectionException, throw: false)
            ->asJson();
    }
}
