<?php

namespace Database\Factories;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\KondisiBarang;
use App\Models\Lokasi;
use App\Models\Satuan;
use App\Models\StatusBarang;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Barang>
 */
class BarangFactory extends Factory
{
    protected $model = Barang::class;

    public function definition(): array
    {
        return [
            'kategori_barang_id' => KategoriBarang::inRandomOrder()->value('id'),
            'satuan_id' => Satuan::inRandomOrder()->value('id'),
            'lokasi_id' => Lokasi::inRandomOrder()->value('id'),
            'kondisi_barang_id' => KondisiBarang::inRandomOrder()->value('id'),
            'status_barang_id' => StatusBarang::inRandomOrder()->value('id'),
            'kode_barang' => 'BRG-'.fake()->unique()->numerify('####'),
            'nama_barang' => fake()->randomElement([
                'Laptop ASUS VivoBook 14', 'Printer Epson EcoTank L3210',
                'Meja Kantor 120cm', 'Kursi Kantor Hidrolik', 'Proyektor Epson EB-X49',
                'AC Split 1 PK', 'Kamera CCTV 4MP', 'Genset 5000 Watt',
                'Papan Tulis Whiteboard', 'Lemari Arsip 4 Pintu', 'PC All-in-One HP',
            ]),
            'merk' => fake()->randomElement([
                'ASUS', 'Epson', 'Sharp', 'Panasonic', 'Honda', 'Toyota',
                'IKEA', 'Brother', 'Canon', 'Daikin', 'Krisbow',
            ]),
            'spesifikasi' => fake()->sentence(8),
            'jumlah' => fake()->numberBetween(1, 30),
            'tahun_perolehan' => fake()->numberBetween(2018, 2026),
            'sumber_perolehan' => fake()->randomElement(['APBD', 'APBN', 'Hibah', 'Swadaya']),
            'harga_perolehan' => fake()->numberBetween(500000, 500000000),
            'foto' => null,
            'dokumen' => null,
        ];
    }
}
