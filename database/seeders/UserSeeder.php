<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Satu akun demo per role + 11 user factory.
     * Password semua akun demo: "password".
     */
    public function run(): void
    {
        $demos = [
            [
                'name' => 'Administrator SARPRA',
                'email' => 'admin@sarpra.go.id',
                'role' => 'Administrator',
            ],
            [
                'name' => 'Pengelola Sarpras',
                'email' => 'pengelola@sarpra.go.id',
                'role' => 'Pengelola Sarana & Prasarana',
            ],
            [
                'name' => 'Pimpinan Direktorat',
                'email' => 'pimpinan@sarpra.go.id',
                'role' => 'Pimpinan',
            ],
        ];

        foreach ($demos as $demo) {
            User::updateOrCreate(
                ['email' => $demo['email']],
                [
                    'name' => $demo['name'],
                    'password' => Hash::make('password'),
                    'role_id' => Role::where('name', $demo['role'])->value('id'),
                    'is_active' => true,
                ]
            );
        }

        // 1 user dummy tambahan. Hapus komentar di bawah untuk menonaktifkan.
        User::factory()->count(1)->create();
    }
}
