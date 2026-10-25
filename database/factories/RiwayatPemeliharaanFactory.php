<?php

namespace Database\Factories;

use App\Models\Pemeliharaan;
use App\Models\RiwayatPemeliharaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RiwayatPemeliharaan>
 */
class RiwayatPemeliharaanFactory extends Factory
{
    protected $model = RiwayatPemeliharaan::class;

    public function definition(): array
    {
        $selesai = fake()->boolean(40);

        return [
            'pemeliharaan_id' => Pemeliharaan::inRandomOrder()->value('id'),
            'user_id' => User::inRandomOrder()->value('id'),
            'tanggal' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'jenis_tindakan' => fake()->randomElement(['Pengecekan', 'Perbaikan', 'Penggantian Sparepart', 'Kalibrasi']),
            'masalah' => fake()->sentence(6),
            'tindakan' => fake()->sentence(8),
            'biaya' => $selesai ? fake()->numberBetween(100000, 20000000) : null,
            'pelaksana' => fake()->randomElement(['Teknisi Internal', 'CV Maju Jaya Servis', 'PT Sarana Teknik']),
            'status' => $selesai ? 'selesai' : fake()->randomElement(['diajukan', 'dalam_pemeliharaan', 'ditolak']),
            'catatan' => fake()->optional()->sentence(),
            'dokumen_sebelum' => null,
            'dokumen_sesudah' => null,
        ];
    }
}
