<?php

namespace Database\Factories;

//
use App\Models\Barang;
use App\Models\JenisPemeliharaan;
use App\Models\Pemeliharaan;
use App\Models\Prioritas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

//
/**
 * @extends Factory<Pemeliharaan>
 */
class PemeliharaanFactory extends Factory
{
    protected $model = Pemeliharaan::class;

    //
    public function definition(): array
    {
        $status = fake()->randomElement(['diajukan', 'dalam_pemeliharaan', 'selesai', 'ditolak']);

        //
        return [
            'barang_id' => Barang::inRandomOrder()->value('id'),
            'jenis_pemeliharaan_id' => JenisPemeliharaan::inRandomOrder()->value('id'),
            'prioritas_id' => Prioritas::inRandomOrder()->value('id'),
            'user_id' => User::inRandomOrder()->value('id'),
            'nomor_pemeliharaan' => 'PM-'.fake()->unique()->numerify('######'),
            'tanggal_pengajuan' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'masalah' => fake()->randomElement([
                'Layar laptop retak dan perlu diganti',
                'Printer sering paper jam saat mencetak',
                'AC tidak dingin, freon kemungkinan habis',
                'Kamera CCTV mati total',
                'Kaki kursi patah',
                'Proyektor gambar buram',
                'Genset sulit dinyalakan',
                'Kunci lemari arsip rusak',
            ]),
            'estimasi_biaya' => fake()->numberBetween(100000, 20000000),
            'status' => $status,
        ];
    }
}
