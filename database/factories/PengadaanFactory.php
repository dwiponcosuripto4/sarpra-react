<?php

namespace Database\Factories;

use App\Models\JenisPengadaan;
use App\Models\Pengadaan;
use App\Models\Perencanaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pengadaan>
 */
class PengadaanFactory extends Factory
{
    protected $model = Pengadaan::class;

    public function definition(): array
    {
        return [
            'perencanaan_id' => fake()->optional(0.7)->randomElement(
                Perencanaan::pluck('id')->all() ?: [null]
            ),
            'jenis_pengadaan_id' => JenisPengadaan::inRandomOrder()->value('id'),
            'user_id' => User::inRandomOrder()->value('id'),
            'nomor_pengadaan' => 'PDN-'.fake()->unique()->numerify('######'),
            'tanggal_pengajuan' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'alasan' => fake()->sentence(10),
            'status' => fake()->randomElement([
                'draft', 'diajukan', 'menunggu_persetujuan', 'disetujui',
                'ditolak', 'diproses', 'selesai',
            ]),
        ];
    }
}
