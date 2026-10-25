<?php

namespace Database\Factories;

//
use App\Models\Pengadaan;
use App\Models\PersetujuanPengadaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

//
/**
 * @extends Factory<PersetujuanPengadaan>
 */
class PersetujuanPengadaanFactory extends Factory
{
    protected $model = PersetujuanPengadaan::class;

    //
    public function definition(): array
    {
        return [
            'pengadaan_id' => Pengadaan::inRandomOrder()->value('id'),
            'pimpinan_id' => User::inRandomOrder()->value('id'),
            'status' => fake()->randomElement(['disetujui', 'disetujui', 'ditolak']),
            'catatan' => fake()->optional()->sentence(8),
            'tanggal_persetujuan' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
