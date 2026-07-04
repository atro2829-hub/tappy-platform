<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipientRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:80'],
            'country' => ['required', 'string', 'size:2'],
            'recipient' => ['required', 'string', 'max:60'],
            'operator' => ['nullable', 'string', 'max:80'],
            'operator_id' => ['nullable', 'string', 'max:40'],
            'favorite' => ['boolean'],
        ];
    }
}
