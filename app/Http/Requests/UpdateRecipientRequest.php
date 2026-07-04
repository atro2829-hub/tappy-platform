<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipientRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:80'],
            'country' => ['sometimes', 'required', 'string', 'size:2'],
            'recipient' => ['sometimes', 'required', 'string', 'max:60'],
            'operator' => ['nullable', 'string', 'max:80'],
            'operator_id' => ['nullable', 'string', 'max:40'],
            'favorite' => ['boolean'],
        ];
    }
}
