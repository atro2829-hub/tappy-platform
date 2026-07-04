<?php

namespace App\Http\Requests;

use App\Services\GiftCardPurchaseInput;
use App\Support\Money;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseGiftCardRequest extends FormRequest
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
            'product_id' => ['required', 'string', 'max:64'],
            'brand' => ['required', 'string', 'max:120'],
            'denom' => ['required', 'numeric', 'min:1', 'max:2000'],
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'recipient' => ['required', 'string', 'max:160'],
            'deliver_via' => ['required', Rule::in(['email', 'sms'])],
            'country' => ['nullable', 'string', 'size:2'],
            'message' => ['nullable', 'string', 'max:200'],
            'idempotency_key' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function toInput(): GiftCardPurchaseInput
    {
        $validated = $this->validated();

        return new GiftCardPurchaseInput(
            productId: $validated['product_id'],
            brand: $validated['brand'],
            denomMinor: Money::toMinor((float) $validated['denom']),
            quantity: (int) $validated['quantity'],
            recipient: $validated['recipient'],
            deliverVia: $validated['deliver_via'],
            countryIso: strtoupper($validated['country'] ?? 'US'),
            message: $validated['message'] ?? null,
            idempotencyKey: $validated['idempotency_key'] ?? null,
        );
    }
}
