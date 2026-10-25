<?php

namespace Database\Factories;

//
use App\Models\KategoriBarang;
use App\Models\Perencanaan;
use App\Models\Periode;
use App\Models\Prioritas;
use App\Models\Satuan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

//
/**
 * @extends Factory<Perencanaan>
 */
class PerencanaanFactory extends Factory
{
    protected $model = Perencanaan::class;

    //
    public function definition(): array
    {
        $barang = fake()->randomElement([
            'Laptop', 'Printer', 'Meja Kerja', 'Kursi Kantor', 'Proyektor',
            'AC Split', 'Kamera CCTV', 'Genset', 'Papan Tulis', 'Lemari Arsip',
            'Komputer PC',
        ]);

        //
        return [
            'user_id' => User::inRandomOrder()->value('id'),
            'kategori_barang_id' => KategoriBarang::inRandomOrder()->value('id'),
            'satuan_id' => Satuan::inRandomOrder()->value('id'),
            'prioritas_id' => Prioritas::inRandomOrder()->value('id'),
            'periode_id' => Periode::inRandomOrder()->value('id'),
            'nama_kebutuhan' => 'Kebutuhan '.$barang.' '.fake()->randomElement([
                'Ruang Rapat', 'Lab Komputer', 'Perpustakaan', 'Aula', 'Gudang',
            ]),
            'jumlah' => fake()->numberBetween(1, 50),
            'alasan' => fake()->sentence(10),
            'status' => fake()->randomElement(['draft', 'diajukan']),
        ];
    }
}
