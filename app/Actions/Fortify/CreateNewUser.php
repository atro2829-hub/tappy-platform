<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /** Account types a visitor may self-select (never "admin"). */
    private const ACCOUNT_TYPES = ['customer', 'business', 'reseller'];

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'account_type' => ['required', Rule::in(self::ACCOUNT_TYPES)],
            'business_name' => ['nullable', 'required_unless:account_type,customer', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'size:2'],
        ], [
            'business_name.required_unless' => 'Please enter your business name.',
        ])->validate();

        $accountType = $input['account_type'];

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $accountType,
            'business_name' => $accountType === 'customer' ? null : ($input['business_name'] ?? null),
            'country' => $input['country'] ?? null,
        ]);
    }
}
