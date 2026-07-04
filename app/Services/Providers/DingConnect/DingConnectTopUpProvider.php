<?php

namespace App\Services\Providers\DingConnect;

use App\Enums\TransactionStatus;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\Data\OperatorDetail;
use App\Services\Providers\Data\TopUpOrder;
use App\Services\Providers\Data\TopUpResult;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * DingConnect-backed top-up provider. Maps DingConnect's provider/product/transfer
 * model onto Tappy's provider-agnostic DTOs.
 *
 * DingConnect splits "who to send to" (a ProviderCode, auto-detected from the
 * number) from "what to send" (a SkuCode). Tappy carries a single opaque
 * `operatorId`, so this adapter resolves the number's provider, picks its primary
 * top-up product, and uses that product's **SkuCode as the operatorId** — which
 * round-trips straight back into SendTransfer.
 *
 * Send values are expressed in USD (SendCurrencyIso=USD), matching how the
 * USD-funded wallet prices orders.
 *
 * Status: built to the published V1 spec; live-sandbox verification is pending
 * credentials. The DistributorRef is the idempotency key (a repeat trips
 * DingConnect's DuplicateTransactionPrevented guard rather than double-charging).
 */
class DingConnectTopUpProvider implements TopUpProvider
{
    /** ProcessingState values that mean "not settled yet". */
    private const PENDING_STATES = ['SUBMITTED', 'PROCESSING', 'CANCELLING'];

    /** ProcessingState values that mean the transfer failed. */
    private const FAILED_STATES = ['FAILED', 'CANCELLED', 'PROVIDERTIMEDOUT'];

    /** Product Benefits that identify a deliverable airtime/data top-up. */
    private const TELECOM_BENEFITS = ['Mobile', 'Minutes', 'Data', 'Sms', 'Bundle', 'Combo', 'Talktime', 'Topup', 'Credit'];

    /** Benefits that specifically identify voice/airtime (preferred over data). */
    private const AIRTIME_BENEFITS = ['Mobile', 'Minutes', 'Talktime', 'Topup', 'Credit'];

    public function __construct(private readonly DingConnectClient $client) {}

    public function detectOperator(string $phone, string $countryIso): ?OperatorDetail
    {
        $iso = strtoupper($countryIso);
        $account = ltrim($phone, '+');

        try {
            $providers = $this->client->get('/api/V1/GetProviders', [
                'accountNumber' => $account,
                'countryIsos' => $iso,
            ]);

            $candidates = $this->items($providers);

            if ($candidates === []) {
                return null;
            }

            // DingConnect returns EVERY biller whose number format matches the
            // account — electricity, TV and gift sellers included. Fetch the
            // country's catalog (cached, as it rarely changes) and narrow it to
            // the matched providers.
            $products = Cache::remember(
                'dingconnect:products:'.$iso,
                now()->addHour(),
                fn (): array => $this->client->get('/api/V1/GetProducts', ['countryIsos' => $iso]),
            );
        } catch (Throwable) {
            return null;
        }

        $candidateCodes = array_values(array_filter(array_map(
            static fn (array $candidate): string => (string) ($candidate['ProviderCode'] ?? ''),
            $candidates,
        )));

        $nameByCode = [];
        foreach ($candidates as $candidate) {
            $nameByCode[(string) ($candidate['ProviderCode'] ?? '')] = (string) ($candidate['Name'] ?? '');
        }

        $deliverable = array_values(array_filter(
            $this->items($products),
            function (array $product) use ($candidateCodes): bool {
                $code = (string) ($product['ProviderCode'] ?? '');

                if ($code !== '' && $candidateCodes !== [] && ! in_array($code, $candidateCodes, true)) {
                    return false;
                }

                return $this->isDeliverableTopUp($product);
            },
        ));

        $product = $this->selectProduct($deliverable);

        if ($product === null || blank($product['SkuCode'] ?? null)) {
            return null;
        }

        $providerName = $nameByCode[(string) ($product['ProviderCode'] ?? '')]
            ?? (string) ($candidates[0]['Name'] ?? $product['SkuCode']);

        $min = is_array($product['Minimum'] ?? null) ? $product['Minimum'] : [];
        $max = is_array($product['Maximum'] ?? null) ? $product['Maximum'] : [];

        $minSend = (float) ($min['SendValue'] ?? 0);
        $maxSend = (float) ($max['SendValue'] ?? $minSend);
        $maxReceive = (float) ($max['ReceiveValue'] ?? 0);

        return new OperatorDetail(
            operatorId: (string) $product['SkuCode'],
            name: $providerName !== '' ? $providerName : (string) $product['SkuCode'],
            countryIso: $iso,
            denominationType: $minSend > 0 && $minSend === $maxSend ? 'FIXED' : 'RANGE',
            localCurrency: (string) ($max['ReceiveCurrencyIso'] ?? $min['ReceiveCurrencyIso'] ?? 'USD'),
            fxRate: $maxSend > 0 ? round($maxReceive / $maxSend, 6) : 1.0,
            minLocal: $this->floatOrNull($min['ReceiveValue'] ?? null),
            maxLocal: $this->floatOrNull($max['ReceiveValue'] ?? null),
            fixedAmounts: $minSend > 0 && $minSend === $maxSend ? [$minSend] : [],
        );
    }

    public function sendTopUp(TopUpOrder $order): TopUpResult
    {
        try {
            $resp = $this->client->post('/api/V1/SendTransfer', [
                'SkuCode' => $order->operatorId,
                'SendValue' => $order->amount,
                'SendCurrencyIso' => 'USD',
                'AccountNumber' => ltrim($order->recipientPhone, '+'),
                'DistributorRef' => $order->customIdentifier,
                'ValidateOnly' => $this->client->isSandbox(),
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

    public function getTransaction(string $providerTransactionId): TopUpResult
    {
        // ListTransferRecords takes a flat filter (no wrapper); Take is required.
        $resp = $this->client->post('/api/V1/ListTransferRecords', [
            'TransferRef' => $providerTransactionId,
            'Take' => 1,
        ]);

        $record = $this->items($resp)[0] ?? null;

        if ($record === null) {
            return new TopUpResult(
                status: TransactionStatus::Processing,
                providerTransactionId: $providerTransactionId,
                providerStatus: 'PENDING',
                raw: $resp,
            );
        }

        return $this->toResult(['ResultCode' => 1, 'TransferRecord' => $record], $providerTransactionId);
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function toResult(array $resp, ?string $fallbackId = null): TopUpResult
    {
        $resultCode = (int) ($resp['ResultCode'] ?? 0);
        $record = is_array($resp['TransferRecord'] ?? null) ? $resp['TransferRecord'] : [];
        $processingState = (string) ($record['ProcessingState'] ?? '');
        $state = strtoupper($processingState);
        $transferRef = $record['TransferId']['TransferRef'] ?? null;

        $status = match (true) {
            $resultCode !== 1 => TransactionStatus::Failed,
            in_array($state, self::FAILED_STATES, true) => TransactionStatus::Failed,
            in_array($state, self::PENDING_STATES, true) => TransactionStatus::Processing,
            // "Complete" is the only success state; an empty state on a ResultCode=1
            // response is a ValidateOnly (sandbox) success that issues no transfer.
            $state === 'COMPLETE' || $state === '' => TransactionStatus::Success,
            default => TransactionStatus::Processing,
        };

        return new TopUpResult(
            status: $status,
            providerTransactionId: $transferRef !== null ? (string) $transferRef : $fallbackId,
            providerStatus: $processingState !== '' ? $processingState : ($resultCode === 1 ? 'Complete' : 'Failed'),
            message: $this->responseMessage($resp),
            raw: $resp,
        );
    }

    /**
     * Pick the product to fulfil against. Airtime is preferred over data, and a
     * ranged SKU (Minimum.SendValue < Maximum.SendValue) over a fixed one because
     * SendTransfer honours whatever amount the customer chose.
     *
     * @param  list<array<string, mixed>>  $products
     * @return array<string, mixed>|null
     */
    private function selectProduct(array $products): ?array
    {
        if ($products === []) {
            return null;
        }

        usort($products, fn (array $a, array $b): int => [$this->isAirtime($b), $this->isRanged($b)]
            <=> [$this->isAirtime($a), $this->isRanged($a)]);

        return $products[0];
    }

    /**
     * Whether a product is a plain airtime/data top-up. DingConnect tags each
     * product with Benefits; anything that is explicitly non-telecom (electricity,
     * TV, gift/DigitalProduct) or needs extra biller settings can't be fulfilled
     * by a bare SendTransfer and is rejected here.
     *
     * @param  array<string, mixed>  $product
     */
    private function isDeliverableTopUp(array $product): bool
    {
        $benefits = $product['Benefits'] ?? null;

        if (is_array($benefits) && $benefits !== [] && array_intersect($benefits, self::TELECOM_BENEFITS) === []) {
            return false;
        }

        // SendTransfer carries only SkuCode + value + number; products needing
        // extra settings (meter type, bill lookup, …) can't be delivered blindly.
        return empty($product['SettingDefinitions']);
    }

    /**
     * @param  array<string, mixed>  $product
     */
    private function isAirtime(array $product): int
    {
        $benefits = $product['Benefits'] ?? [];

        return is_array($benefits) && array_intersect($benefits, self::AIRTIME_BENEFITS) !== [] ? 1 : 0;
    }

    /**
     * @param  array<string, mixed>  $product
     */
    private function isRanged(array $product): int
    {
        $min = (float) ($product['Minimum']['SendValue'] ?? 0);
        $max = (float) ($product['Maximum']['SendValue'] ?? $min);

        return $max > $min ? 1 : 0;
    }

    /**
     * The first list of records in a DingConnect envelope (it nests them under
     * varying keys depending on the endpoint).
     *
     * @param  array<string, mixed>  $resp
     * @return list<array<string, mixed>>
     */
    private function items(array $resp): array
    {
        // GetProviders, GetProducts and ListTransferRecords all nest their list
        // under "Items".
        if (is_array($resp['Items'] ?? null)) {
            return array_values(array_filter($resp['Items'], 'is_array'));
        }

        return array_is_list($resp) ? array_values(array_filter($resp, 'is_array')) : [];
    }

    /**
     * @param  array<string, mixed>  $resp
     */
    private function responseMessage(array $resp): ?string
    {
        return $this->formatErrors($resp['ErrorCodes'] ?? null);
    }

    private function errorMessage(RequestException $e): string
    {
        return $this->formatErrors($e->response->json('ErrorCodes')) ?? $e->getMessage();
    }

    /**
     * DingConnect returns errors as objects (`[{Code, Context}]`), so flatten each
     * into a "Code (Context)" string rather than coercing the array to "Array".
     */
    private function formatErrors(mixed $errors): ?string
    {
        if (! is_array($errors) || $errors === []) {
            return null;
        }

        $messages = array_map(function (mixed $error): string {
            if (is_array($error)) {
                $code = (string) ($error['Code'] ?? '');
                $context = (string) ($error['Context'] ?? '');

                return $context !== '' ? "{$code} ({$context})" : $code;
            }

            return (string) $error;
        }, $errors);

        $messages = array_values(array_filter($messages, fn (string $m): bool => $m !== ''));

        return $messages === [] ? null : implode(', ', $messages);
    }

    private function floatOrNull(mixed $value): ?float
    {
        return $value === null ? null : (float) $value;
    }
}
