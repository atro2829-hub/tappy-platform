<?php

namespace App\Services\Providers\Tango;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Data\GiftCardOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Throwable;

/**
 * Tango Card (RaaS)-backed gift-card provider. Flattens Tango's brand/item
 * catalog and maps its order model onto Tappy's provider-agnostic shapes.
 *
 * The Tappy product id is the Tango item `utid`. Orders are funded from a
 * configured Tango account (accountIdentifier + customerIdentifier); the
 * externalRefID is the idempotency key.
 *
 * Status: built to the published RaaS v2 spec; live-sandbox verification pending
 * credentials.
 */
class TangoGiftCardProvider implements GiftCardProvider
{
    public function __construct(
        private readonly TangoClient $client,
        private readonly string $accountIdentifier,
        private readonly string $customerIdentifier,
    ) {}

    public function listProducts(?string $countryIso = null, int $size = 50): array
    {
        try {
            $resp = $this->client->get('/catalogs');
        } catch (Throwable) {
            return [];
        }

        $brands = is_array($resp['brands'] ?? null) ? $resp['brands'] : [];
        $products = [];

        foreach ($brands as $brand) {
            if (! is_array($brand)) {
                continue;
            }

            foreach (is_array($brand['items'] ?? null) ? $brand['items'] : [] as $item) {
                if (! is_array($item) || blank($item['utid'] ?? null)) {
                    continue;
                }

                $product = $this->mapItem($brand, $item);

                if ($countryIso !== null && $product['countries'] !== [] && ! in_array(strtoupper($countryIso), $product['countries'], true)) {
                    continue;
                }

                $products[] = $product;

                if (count($products) >= $size) {
                    return $products;
                }
            }
        }

        return $products;
    }

    /**
     * @param  array<string, mixed>  $brand
     * @param  array<string, mixed>  $item
     * @return array{id: string, brand: string, cat: string, denoms: list<float>, countries: list<string>, logo: string|null}
     */
    private function mapItem(array $brand, array $item): array
    {
        $countries = array_values(array_filter(array_map(
            fn ($c): string => strtoupper((string) $c),
            is_array($item['countries'] ?? null) ? $item['countries'] : [],
        )));

        $images = is_array($brand['imageUrls'] ?? null) ? array_values($brand['imageUrls']) : [];

        return [
            'id' => (string) $item['utid'],
            'brand' => (string) ($brand['brandName'] ?? $item['rewardName'] ?? 'Gift card'),
            'cat' => 'Gift card',
            'denoms' => $this->denominations($item),
            'countries' => $countries,
            'logo' => isset($images[0]) ? (string) $images[0] : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return list<float>
     */
    private function denominations(array $item): array
    {
        if (($item['valueType'] ?? '') === 'FIXED_VALUE' && isset($item['faceValue'])) {
            return [(float) $item['faceValue']];
        }

        $min = (float) ($item['minValue'] ?? 0);
        $max = (float) ($item['maxValue'] ?? 0);

        if ($min > 0 && $min < $max) {
            return [$min, round(($min + $max) / 2, 2), $max];
        }

        return $min > 0 ? [$min] : [];
    }

    public function order(GiftCardOrder $order): TopUpResult
    {
        // One Tango order delivers one reward, so quantity > 1 becomes one order
        // per unit (each with its own externalRefID for idempotency). A failure
        // short-circuits; the result reflects the last order.
        $quantity = max(1, $order->quantity);
        $result = null;

        for ($unit = 1; $unit <= $quantity; $unit++) {
            $reference = $quantity === 1 ? $order->customIdentifier : $order->customIdentifier.'-'.$unit;
            $result = $this->orderOne($order, $reference);

            if ($result->status === TransactionStatus::Failed) {
                return $result;
            }
        }

        return $result;
    }

    private function orderOne(GiftCardOrder $order, string $reference): TopUpResult
    {
        try {
            $resp = $this->client->post('/orders', [
                'accountIdentifier' => $this->accountIdentifier,
                'customerIdentifier' => $this->customerIdentifier,
                'utid' => $order->productId,
                'amount' => $order->unitPriceUsd,
                // sendEmail is deprecated; deliveryMethod is the required field.
                'deliveryMethod' => $order->deliverVia === 'email' ? 'EMAIL' : 'NONE',
                'externalRefID' => $reference,
                'recipient' => [
                    'email' => $order->recipient,
                    'firstName' => 'Tappy',
                    'lastName' => 'Recipient',
                ],
                'sender' => [
                    'firstName' => $order->senderName ?? 'Tappy',
                    'lastName' => '',
                    'email' => $order->recipient,
                ],
            ]);
        } catch (RequestException $e) {
            return new TopUpResult(
                status: TransactionStatus::Failed,
                providerStatus: 'FAILED',
                message: $this->errorMessage($e),
                raw: ['error' => $e->response->json() ?? $e->getMessage()],
            );
        }

        return $this->toResult($resp);
    }

    public function getOrder(string $providerTransactionId): TopUpResult
    {
        return $this->toResult($this->client->get('/orders/'.$providerTransactionId), $providerTransactionId);
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $state = strtoupper((string) ($resp['status'] ?? ''));

        $status = match ($state) {
            'COMPLETE', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'FULFILLED' => TransactionStatus::Success,
            'PENDING', 'PROCESSING' => TransactionStatus::Processing,
            default => TransactionStatus::Failed,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: isset($resp['referenceOrderID']) ? (string) $resp['referenceOrderID'] : $fallbackId,
            providerStatus: $resp['status'] ?? null,
            message: isset($resp['message']) ? (string) $resp['message'] : null,
            raw: $resp,
        );
    }

    private function errorMessage(RequestException $e): string
    {
        $message = $e->response->json('message') ?? $e->response->json('errors.0.message');

        return is_string($message) && $message !== '' ? $message : $e->getMessage();
    }
}
