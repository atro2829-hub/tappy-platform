<?php

namespace App\Services\Providers\Tillo;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin, request-signing HTTP client for the Tillo API v2 (gift cards).
 *
 * Every request carries an HMAC-SHA256 signature (hex) of a dash-joined string:
 *   {API-Key}-{METHOD}-{endpoint-slug}-{...ordered params...}-{timestamp_ms}
 * sent alongside the API-Key and Timestamp headers.
 *
 * @see https://tillo.tech/gift-card-quick-start-guide/auth.html
 */
class TilloClient
{
    private const PRODUCTION_URL = 'https://api.tillo.io/api/v2';

    private const SANDBOX_URL = 'https://sandbox.tillo.dev/api/v2';

    public function __construct(
        private readonly string $apiKey,
        private readonly string $secret,
        private readonly bool $sandbox = true,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('services.tillo.api_key'),
            (string) config('services.tillo.secret'),
            (bool) config('services.tillo.sandbox', true),
        );
    }

    public function baseUrl(): string
    {
        return $this->sandbox ? self::SANDBOX_URL : self::PRODUCTION_URL;
    }

    /**
     * Signed GET. $signatureParts are the ordered values that sit between the
     * endpoint slug and the timestamp in the signature string.
     *
     * @param  list<string>  $signatureParts
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, string $slug, array $signatureParts = [], array $query = []): array
    {
        return $this->send('GET', $path, $slug, $signatureParts, query: $query);
    }

    /**
     * Signed POST.
     *
     * @param  list<string>  $signatureParts
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function post(string $path, string $slug, array $signatureParts = [], array $body = []): array
    {
        return $this->send('POST', $path, $slug, $signatureParts, body: $body);
    }

    /**
     * @param  list<string>  $signatureParts
     * @param  array<string, mixed>  $query
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, string $slug, array $signatureParts, array $query = [], array $body = []): array
    {
        $timestamp = (string) (int) round(microtime(true) * 1000);
        $signatureString = implode('-', [$this->apiKey, $method, $slug, ...$signatureParts, $timestamp]);
        $signature = hash_hmac('sha256', $signatureString, $this->secret);

        $request = $this->http($signature, $timestamp);

        $response = $method === 'GET'
            ? $request->get($path, $query)
            : $request->post($path, $body);

        return $response->throw()->json() ?? [];
    }

    private function http(string $signature, string $timestamp): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->withHeaders([
                'API-Key' => $this->apiKey,
                'Signature' => $signature,
                'Timestamp' => $timestamp,
                'Accept' => 'application/json',
            ])
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, fn (Throwable $e): bool => $e instanceof ConnectionException, throw: false)
            ->asJson();
    }
}
