<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRiskRulesRequest extends FormRequest
{
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
            'largeAmount' => ['required', 'numeric', 'min:1', 'max:1000000'],
            'highAmount' => ['required', 'numeric', 'min:1', 'max:1000000'],
            'flagFailed' => ['required', 'boolean'],
            'flagRefunded' => ['required', 'boolean'],
        ];
    }
}
