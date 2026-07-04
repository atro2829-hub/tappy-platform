<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DetectOperatorRequest extends FormRequest
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
            'phone' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
        ];
    }
}
