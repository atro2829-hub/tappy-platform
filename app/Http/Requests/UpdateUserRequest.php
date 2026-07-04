<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Admin;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['active', 'suspended'])],
            'kyc_status' => ['sometimes', Rule::in(['approved', 'pending', 'review', 'rejected'])],
            'role' => ['sometimes', Rule::enum(Role::class)],
        ];
    }
}
