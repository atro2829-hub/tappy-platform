<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
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
            'subject' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:2000'],
            'txn' => ['nullable', 'string', 'max:60'],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high'])],
        ];
    }
}
