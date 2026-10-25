<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Tiga role SARPRA sesuai PRD.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrator',
                'description' => 'Mengelola pengguna, data master, konfigurasi, dan aktivitas sistem.',
            ],
            [
                'name' => 'Pengelola Sarana & Prasarana',
                'description' => 'Menjalankan proses operasional: perencanaan, pengadaan, inventaris, pemeliharaan.',
            ],
            [
                'name' => 'Pimpinan',
                'description' => 'Persetujuan pengadaan serta monitoring aset dan laporan.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}
