<?php

namespace App\Services\Providers\Giftbit;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin HTTP client for the Giftbit API (papi/v1) — gift cards via campaigns.
 *
 * Authentication is a bearer API token. Giftbit runs a separate testbed host
 * from production, selected by the `sandbox` flag.
 *
 * @see https://www.giftbit.com/gift-card-api
 */
class GiftbitClient
{
    private const PRODUCTION_URL = 'https://api.giftbit.com/papi/v1';

    private const SANDBOX_URL = 'https://api-testbed.giftbit.com/papi/v1';

    public function __construct(
        private readonly string $apiKey,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.giftbit.api_key'),
            (bool) config('services.giftbit.sandbox', true),
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
     * Fetch several paths concurrently, keyed by path. The brand catalog omits
     * pricing, so detail must be pulled per brand; doing it in a pool keeps the
     * (hourly-cached) catalog build fast. Failed responses map to an empty array.
     *
     * @param  list<string>  $paths
     * @return array<string, array<string, mixed>>
     */
    public function getMany(array $paths): array
    {
        $paths = array_values(array_unique(array_filter($paths)));
        $results = [];

        foreach (array_chunk($paths, 15) as $chunk) {
            $responses = Http::pool(fn (Pool $pool): array => array_map(
                fn (string $path) => $pool->as($path)
                    ->baseUrl($this->baseUrl())
                    ->withToken($this->apiKey)
                    ->acceptJson()
                    ->connectTimeout(5)
                    ->timeout(15)
                    ->get($path),
                $chunk,
            ));

            foreach ($chunk as $path) {
                $resp = $responses[$path] ?? null;
                $results[$path] = $resp instanceof Response && $resp->successful()
                    ? ($resp->json() ?? [])
                    : [];
            }
        }

        return $results;
    }

    /**
     * A request pre-configured with the bearer token. Only connection failures
     * retry: a campaign's client `id` makes it idempotent, but a 4xx/5xx means
     * Giftbit already saw the request.
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
