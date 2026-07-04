<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAutomationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Partial update — primarily the enable/disable toggle, but any display
     * config field may be edited too.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:80'],
            'type' => ['sometimes', 'string', 'in:auto-reload,scheduled'],
            'trigger' => ['sometimes', 'string', 'max:120'],
            'action' => ['sometimes', 'string', 'max:120'],
            'enabled' => ['sometimes', 'boolean'],
            'recipient' => ['sometimes', 'nullable', 'string', 'max:60'],
            'country' => ['sometimes', 'nullable', 'string', 'size:2'],
            'operator' => ['sometimes', 'nullable', 'string', 'max:80'],
            'amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'cur' => ['sometimes', 'nullable', 'string', 'size:3'],
            'freq' => ['sometimes', 'nullable', 'string', 'max:40'],
            'next' => ['sometimes', 'nullable', 'string', 'max:40'],
            'reminder' => ['sometimes', 'nullable', 'string', 'max:40'],
        ];
    }
}
