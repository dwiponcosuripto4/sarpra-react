<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

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
        ])->validate();

        // Registrasi mandiri tidak memilih role: tetapkan Pengelola sebagai
        // default. Administrator dapat mengubahnya via Manajemen Pengguna.
        $roleId = Role::where('name', 'Pengelola Sarana & Prasarana')->value('id')
            ?? Role::orderBy('id')->value('id')
            ?? Role::create([
                'name' => 'Pengelola Sarana & Prasarana',
                'description' => 'Menjalankan proses operasional SARPRA.',
            ])->id;

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role_id' => $roleId,
        ]);
    }
}
