<?php

namespace Database\Seeders;

use App\Models\JenisPemeliharaan;
use App\Models\JenisPengadaan;
use App\Models\KategoriBarang;
use App\Models\KondisiBarang;
use App\Models\Lokasi;
use App\Models\Periode;
use App\Models\Prioritas;
use App\Models\Satuan;
use App\Models\StatusBarang;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Data master deterministik (bukan factory) agar konsisten.
     */
    public function run(): void
    {
        foreach ([
            'Komputer & Laptop', 'Printer & Scanner', 'Mebel Kantor',
            'Kendaraan Dinas', 'ATK', 'Peralatan Laboratorium',
            'Peralatan Olahraga', 'Audio Visual', 'Jaringan & Server',
            'Alat Kebersihan', 'Genset & Kelistrikan',
        ] as $name) {
            KategoriBarang::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach ([
            'Unit', 'Set', 'Buah', 'Paket', 'Rim', 'Lusin',
            'Meter', 'Kotak', 'Botol', 'Tabung', 'Roll',
        ] as $name) {
            Satuan::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach ([
            'Ruang Rapat A', 'Ruang Kepala Dinas', 'Gudang Utama',
            'Lab Komputer 1', 'Perpustakaan', 'Aula Serbaguna',
            'Ruang Arsip', 'Pos Satpam', 'Bengkel', 'Ruang Server',
            'Lapangan Upacara',
        ] as $name) {
            Lokasi::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (['Baik', 'Rusak Ringan', 'Rusak Berat'] as $name) {
            KondisiBarang::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (['Tersedia', 'Dipinjam', 'Dalam Perbaikan', 'Hilang', 'Dihapuskan'] as $name) {
            StatusBarang::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (['Rutin', 'Berkala', 'Perbaikan', 'Darurat', 'Kalibrasi'] as $name) {
            JenisPemeliharaan::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (['Pembelian Langsung', 'Tender', 'E-Purchasing', 'Hibah', 'Sewa'] as $name) {
            JenisPengadaan::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (['Rendah', 'Sedang', 'Tinggi', 'Mendesak'] as $name) {
            Prioritas::updateOrCreate(['name' => $name], ['description' => null]);
        }

        foreach (range(2022, 2032) as $tahun) {
            Periode::updateOrCreate(['name' => 'Tahun Anggaran '.$tahun], [
                'description' => 'Periode tahun anggaran '.$tahun,
            ]);
        }
    }
}
