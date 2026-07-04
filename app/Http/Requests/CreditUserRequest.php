<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreditUserRequest extends FormRequest
{
    /**
     * Only a super admin may move money in or out of another user's wallet.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Admin;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'direction' => ['required', Rule::in(['credit', 'debit'])],
            // Decimal amount in major units; capped to a sane manual ceiling.
            'amount' => ['required', 'numeric', 'min:0.01', 'max:1000000'],
            // A note is mandatory so every manual movement is accountable
            // (e.g. "Cash received — receipt #1234").
            'note' => ['required', 'string', 'min:3', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'note.required' => 'A note is required so the manual adjustment is traceable.',
        ];
    }
}
