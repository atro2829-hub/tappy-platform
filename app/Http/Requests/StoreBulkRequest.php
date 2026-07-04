<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
            // The bulk CSV (country, recipient, amount) only carries enough data
            // for top-ups. Gift cards / utilities need per-row product/biller
            // fields, so they aren't accepted through this importer.
            'type' => ['nullable', 'string', 'in:airtime,data'],
        ];
    }
}
