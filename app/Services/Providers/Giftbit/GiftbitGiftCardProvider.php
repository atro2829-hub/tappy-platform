<?php

namespace App\Services\Providers\Giftbit;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Giftbit-backed gift-card provider. Maps Giftbit's brand catalog and campaign
 * model onto Tappy's provider-agnostic shapes.
 *
 * The Tappy product id is the Giftbit brand_code. An order becomes a one-gift,
 * one-contact campaign; the client-supplied campaign `id` is the idempotency key
 * (it must be unique across orders). Prices are sent in cents.
 *
 * Status: built to the published API; live-testbed verification pending
 * credentials.
 */
class GiftbitGiftCardProvider implements GiftCardProvider
{
    /** The only campaign.status that means the order was created/delivered. */
    private const SUCCESS_STATES = ['CAMPAIGN_CREATED'];

    private const PENDING_STATES = ['API_CREATING', 'AWAITING_FUNDS'];

    public function __construct(private readonly GiftbitClient $client) {}

    /** Common denominations offered within a brand's allowed price band. */
    private const COMMON_DENOMS = [5, 10, 25, 50, 100, 150, 200, 250, 500];

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        try {
            $resp = $this->client->get('/brands', ['limit' => $size]);
        } catch (Throwable) {
            return [];
        }

        $brands = array_values(array_filter(
            is_array($resp['brands'] ?? null) ? $resp['brands'] : [],
            'is_array',
        ));

        if ($brands === []) {
            return [];
        }

        // The /brands list carries no pricing — that lives on each brand's detail
        // (variable_price + min/max band) — so fetch them concurrently and merge.
        $codes = array_values(array_filter(array_map(
            static fn (array $brand): string => (string) ($brand['brand_code'] ?? ''),
            $brands,
        )));
        $details = $this->client->getMany(array_map(static fn (string $code): string => '/brands/'.$code, $codes));

        return array_values(array_map(function (array $brand) use ($details): array {
            $code = (string) ($brand['brand_code'] ?? '');
            $detail = is_array($details['/brands/'.$code]['brand'] ?? null) ? $details['/brands/'.$code]['brand'] : [];

            return $this->mapBrand($brand, $detail);
        }, $brands));
    }

    /**
     * @param  array<string, mixed>  $brand
     * @param  array<string, mixed>  $detail
     * @return array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}
     */
    private function mapBrand(array $brand, array $detail = []): array
    {
        return [
            'id' => (string) ($brand['brand_code'] ?? ''),
            'brand' => (string) ($brand['name'] ?? 'Gift card'),
            'cat' => 'Gift card',
            'denoms' => $this->denominations($detail),
            'countries' => [],
            'logo' => isset($brand['image_url']) ? (string) $brand['image_url'] : null,
        ];
    }

    /**
     * Selectable denominations from a brand's detail. A single-value brand becomes
     * its one price; a banded brand offers the common denominations that fall
     * inside [min, max], falling back to a low/mid/high spread when none fit.
     *
     * @param  array<string, mixed>  $detail
     * @return list<float>
     */
    private function denominations(array $detail): array
    {
        $min = ((int) ($detail['min_price_in_cents'] ?? 0)) / 100;
        $max = ((int) ($detail['max_price_in_cents'] ?? 0)) / 100;

        if ($min <= 0) {
            return [];
        }

        if ($max <= $min) {
            return [(float) $min];
        }

        $common = array_values(array_filter(
            self::COMMON_DENOMS,
            static fn (int $value): bool => $value >= $min && $value <= $max,
        ));

        if ($common !== []) {
            return array_map('floatval', $common);
        }

        return [(float) $min, round(($min + $max) / 2, 2), (float) $max];
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        // One campaign issues one gift, so quantity > 1 becomes one campaign per
        // unit (each with its own unique `id` for idempotency). A failure
        // short-circuits; the result reflects the last campaign.
        $quantity = max(1, $order->quantity);
        $result = null;

        for ($unit = 1; $unit <= $quantity; $unit++) {
            $campaignId = $quantity === 1 ? $order->customIdentifier : $order->customIdentifier.'-'.$unit;
            $result = $this->issueOne($order, $campaignId);

            if ($result->status === TransactionStatus::Failed) {
                return $result;
            }
        }

        return $result;
    }

    private function issueOne(GiftCardOrder $order, string $campaignId): TopUpResult
    {
        $isEmail = $order->deliverVia === 'email';

        try {
            $resp = $this->client->post('/campaign', [
                'id' => $campaignId,
                'subject' => 'You\'ve received a gift',
                'message' => $order->message ?? 'Enjoy your gift card.',
                'contacts' => [[
                    'email' => $order->recipient,
                    'firstname' => $this->firstName($order->recipient),
                    'lastname' => '',
                ]],
                'brand_codes' => [$order->productId],
                'price_in_cents' => (int) round($order->unitPriceUsd * 100),
                'delivery_type' => $isEmail ? 'GIFTBIT_EMAIL' : 'SHORTLINK',
            ]);
        } catch (RequestException $e) {
            return new TopUpResult(
                status: TransactionStatus::Failed,
                providerStatus: 'FAILED',
                message: $this->errorMessage($e),
                raw: ['error' => $e->response->json() ?? $e->getMessage()],
            );
        }

        return $this->toResult($resp, $campaignId);
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return $this->toResult($this->client->get('/campaign/'.$providerTransactionId), $providerTransactionId);
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $campaign = is_array($resp['campaign'] ?? null) ? $resp['campaign'] : [];
        $state = strtoupper((string) ($campaign['status'] ?? ''));

        $status = match (true) {
            in_array($state, self::SUCCESS_STATES, true) => TransactionStatus::Success,
            in_array($state, self::PENDING_STATES, true) => TransactionStatus::Processing,
            default => TransactionStatus::Failed,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: isset($campaign['uuid']) ? (string) $campaign['uuid'] : $fallbackId,
            providerStatus: $campaign['status'] ?? null,
            message: isset($resp['info']['message']) ? (string) $resp['info']['message'] : null,
            raw: $resp,
        );
    }

    private function firstName(string $recipient): string
    {
        if (str_contains($recipient, '@')) {
            return ucfirst(strstr($recipient, '@', true) ?: 'Friend');
        }

        return 'Friend';
    }

    private function errorMessage(RequestException $e): string
    {
        $message = $e->response->json('error.message') ?? $e->response->json('info.message');

        return is_string($message) && $message !== '' ? $message : $e->getMessage();
    }
}
