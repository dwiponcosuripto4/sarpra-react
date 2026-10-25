<?php

namespace Database\Factories;

use App\Models\Pengadaan;
use App\Models\RiwayatPengadaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RiwayatPengadaan>
 */
class RiwayatPengadaanFactory extends Factory
{
    protected $model = RiwayatPengadaan::class;

    public function definition(): array
    {
        return [
            'pengadaan_id' => Pengadaan::inRandomOrder()->value('id'),
            'status' => fake()->randomElement([
                'draft', 'diajukan', 'menunggu_persetujuan', 'disetujui',
                'ditolak', 'diproses', 'selesai',
            ]),
            'catatan' => fake()->optional()->sentence(),
            'user_id' => User::inRandomOrder()->value('id'),
        ];
    }
}
