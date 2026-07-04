<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCommissionRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'markup_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'markup_flat' => ['required', 'numeric', 'min:0', 'max:1000'],
            'cap' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ];
    }
}
