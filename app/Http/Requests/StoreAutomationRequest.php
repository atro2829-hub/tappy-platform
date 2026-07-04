<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAutomationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'type' => ['required', 'string', 'in:auto-reload,scheduled'],
            'trigger' => ['required', 'string', 'max:120'],
            'action' => ['required', 'string', 'max:120'],
            'enabled' => ['boolean'],
            // Display config the screen renders; all optional.
            'recipient' => ['nullable', 'string', 'max:60'],
            'country' => ['nullable', 'string', 'size:2'],
            'operator' => ['nullable', 'string', 'max:80'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'cur' => ['nullable', 'string', 'size:3'],
            'freq' => ['nullable', 'string', 'max:40'],
            'next' => ['nullable', 'string', 'max:40'],
            'reminder' => ['nullable', 'string', 'max:40'],
        ];
    }
}
