<?php

namespace App\Http\Requests;

use App\Enums\TransactionType;
use App\Services\TopUpPurchaseInput;
use App\Support\Money;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseTopUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'country' => ['required', 'string', 'size:2'],
            'recipient' => ['required', 'string', 'max:20'],
            'operator_id' => ['required', 'string', 'max:32'],
            'operator_name' => ['required', 'string', 'max:120'],
            'amount' => ['required', 'numeric', 'min:0.5', 'max:1000'],
            'type' => ['nullable', Rule::enum(TransactionType::class)],
            'local_amount' => ['nullable', 'numeric', 'min:0'],
            'local_currency' => ['nullable', 'string', 'size:3'],
            'recipient_name' => ['nullable', 'string', 'max:120'],
            'idempotency_key' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function toInput(): TopUpPurchaseInput
    {
        $validated = $this->validated();

        return new TopUpPurchaseInput(
            countryIso: strtoupper($validated['country']),
            recipientPhone: $validated['recipient'],
            amountUsdMinor: Money::toMinor((float) $validated['amount']),
            operatorId: $validated['operator_id'],
            operatorName: $validated['operator_name'],
            type: isset($validated['type'])
                ? TransactionType::from($validated['type'])
                : TransactionType::Airtime,
            localAmountMinor: isset($validated['local_amount'])
                ? Money::toMinor((float) $validated['local_amount'])
                : null,
            localCurrency: $validated['local_currency'] ?? null,
            recipientName: $validated['recipient_name'] ?? null,
            idempotencyKey: $validated['idempotency_key'] ?? null,
        );
    }
}
