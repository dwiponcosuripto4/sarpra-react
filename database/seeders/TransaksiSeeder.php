<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\DetailPengadaan;
use App\Models\Pemeliharaan;
use App\Models\Pengadaan;
use App\Models\Perencanaan;
use App\Models\PersetujuanPengadaan;
use App\Models\RiwayatAktivitas;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransaksiSeeder extends Seeder
{
    /**
     * Seed 1 baris demo per tabel transaksi (aman dijalankan berulang).
     * Setiap baris yang dibuat juga dicatat ke riwayat_aktivitas
     * seolah-olah dikerjakan user demo via aplikasi.
     * Urutan mengikuti alur bisnis: Perencanaan → Pengadaan →
     * Inventarisasi → Pemeliharaan.
     */
    public function run(): void
    {
        $pengelolaId = User::where('email', 'pengelola@sarpra.go.id')->value('id')
            ?? User::inRandomOrder()->value('id');
        $pimpinanId = User::where('email', 'pimpinan@sarpra.go.id')->value('id')
            ?? User::inRandomOrder()->value('id');

        $catat = fn (array $data) => RiwayatAktivitas::create([
            'ip_address' => '127.0.0.1',
            'user_agent' => 'seeder',
            ...$data,
        ]);

        // Perencanaan.
        $rencana = Perencanaan::factory()->count(1)->create()->first();
        $catat([
            'user_id' => $pengelolaId,
            'activity' => 'tambah',
            'description' => "Membuat usulan kebutuhan {$rencana->nama_kebutuhan}.",
            'module' => 'perencanaan',
            'reference_type' => 'perencanaan',
            'reference_id' => $rencana->id,
        ]);

        // Pengadaan.
        $pengadaan = Pengadaan::factory()->count(1)->create()->first();
        $catat([
            'user_id' => $pengelolaId,
            'activity' => 'tambah',
            'description' => "Membuat pengajuan pengadaan {$pengadaan->nomor_pengadaan}.",
            'module' => 'pengadaan',
            'reference_type' => 'pengadaan',
            'reference_id' => $pengadaan->id,
        ]);

        $detail = DetailPengadaan::factory()->count(1)->create([
            'pengadaan_id' => $pengadaan->id,
        ])->first();
        $catat([
            'user_id' => $pengelolaId,
            'activity' => 'tambah',
            'description' => "Menambahkan rincian {$detail->nama_barang} ke {$pengadaan->nomor_pengadaan}.",
            'module' => 'pengadaan',
            'reference_type' => 'pengadaan',
            'reference_id' => $pengadaan->id,
        ]);

        // Satu keputusan pimpinan untuk setiap pengadaan yang belum diputus.
        foreach (Pengadaan::doesntHave('persetujuan')->get() as $item) {
            $putusan = PersetujuanPengadaan::factory()->create([
                'pengadaan_id' => $item->id,
                'pimpinan_id' => $pimpinanId,
            ]);
            $catat([
                'user_id' => $pimpinanId,
                'activity' => $putusan->status === 'ditolak' ? 'tolak' : 'setujui',
                'description' => ($putusan->status === 'ditolak' ? 'Menolak' : 'Menyetujui').
                    " pengajuan pengadaan {$item->nomor_pengadaan}.",
                'module' => 'pengadaan',
                'reference_type' => 'pengadaan',
                'reference_id' => $item->id,
            ]);
        }

        // Inventarisasi.
        $barang = Barang::factory()->count(1)->create()->first();
        $catat([
            'user_id' => $pengelolaId,
            'activity' => 'tambah',
            'description' => "Mencatat barang {$barang->kode_barang} ({$barang->nama_barang}) ke inventaris.",
            'module' => 'barang',
            'reference_type' => 'barang',
            'reference_id' => $barang->id,
        ]);

        // Pemeliharaan.
        $tiket = Pemeliharaan::factory()->count(1)->create(['barang_id' => $barang->id])->first();
        $catat([
            'user_id' => $pengelolaId,
            'activity' => 'ajukan',
            'description' => "Mengajukan pemeliharaan untuk {$barang->kode_barang}.",
            'module' => 'pemeliharaan',
            'reference_type' => 'pemeliharaan',
            'reference_id' => $tiket->id,
        ]);

        // Riwayat aktivitas demo acak (factory) tetap dinonaktifkan untuk
        // testing manual. Hapus komentar di bawah untuk seeding demo.
        // RiwayatAktivitas::factory()->count(11)->create();
    }
}
