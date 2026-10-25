<?php

namespace Database\Factories;

//
use App\Models\DetailPengadaan;
use App\Models\KategoriBarang;
use App\Models\Pengadaan;
use App\Models\Satuan;
use Illuminate\Database\Eloquent\Factories\Factory;

//
/**
 * @extends Factory<DetailPengadaan>
 */
class DetailPengadaanFactory extends Factory
{
    protected $model = DetailPengadaan::class;

    //
    public function definition(): array
    {
        $jumlah = fake()->numberBetween(1, 20);
        $harga = fake()->numberBetween(500000, 150000000);

        //
        return [
            'pengadaan_id' => Pengadaan::inRandomOrder()->value('id'),
            'kategori_barang_id' => KategoriBarang::inRandomOrder()->value('id'),
            'satuan_id' => Satuan::inRandomOrder()->value('id'),
            'nama_barang' => fake()->randomElement([
                'Laptop ASUS VivoBook 14', 'Printer Epson EcoTank L3210',
                'Meja Kantor 120cm', 'Kursi Kantor Hidrolik', 'Proyektor Epson EB-X49',
                'AC Split 1 PK', 'Kamera CCTV 4MP', 'Genset 5000 Watt',
                'Papan Tulis Whiteboard', 'Lemari Arsip 4 Pintu', 'PC All-in-One HP',
            ]),
            'spesifikasi' => fake()->sentence(8),
            'jumlah' => $jumlah,
            'estimasi_harga' => $harga,
            'subtotal' => $jumlah * $harga,
        ];
    }
}
