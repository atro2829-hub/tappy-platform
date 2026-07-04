<?php

namespace App\Http\Requests;

use App\Support\Money;
use Illuminate\Foundation\Http\FormRequest;

class FundWalletRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:1', 'max:100000'],
            'idempotency_key' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function amountMinor(): int
    {
        return Money::toMinor((float) $this->validated('amount'));
    }
}
