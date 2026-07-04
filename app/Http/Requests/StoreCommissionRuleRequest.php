<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommissionRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product' => ['required', 'string', 'max:50'],
            'region' => ['required', 'string', 'max:50'],
            'tier' => ['required', 'string', 'max:50'],
            'markup_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'markup_flat' => ['required', 'numeric', 'min:0', 'max:1000'],
            'cap' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ];
    }
}
