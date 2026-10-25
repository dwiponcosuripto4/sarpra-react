<?php

// DINONAKTIFKAN untuk testing manual: factory ini dimatikan agar tabel
// riwayat_aktivitas tetap kosong setelah seeding dan hanya diisi oleh
// aktivitas nyata (login + aksi pengguna). Hapus komentar di bawah ini
// untuk mengaktifkannya kembali.

// namespace Database\Factories;
//
// use App\Models\RiwayatAktivitas;
// use App\Models\User;
// use Illuminate\Database\Eloquent\Factories\Factory;
//
// /**
//  * @extends Factory<RiwayatAktivitas>
//  */
// class RiwayatAktivitasFactory extends Factory
// {
//     protected $model = RiwayatAktivitas::class;
//
//     public function definition(): array
//     {
//         return [
//             'user_id' => fake()->optional(0.9)->randomElement(
//                 User::pluck('id')->all() ?: [null]
//             ),
//             'activity' => fake()->randomElement([
//                 'login', 'tambah', 'ubah', 'hapus',
//                 'ajukan', 'setujui', 'tolak', 'ubah_status',
//             ]),
//             'description' => fake()->sentence(8),
//             'module' => fake()->randomElement([
//                 'pengguna', 'perencanaan', 'pengadaan', 'barang',
//                 'pemeliharaan', 'laporan',
//             ]),
//             'reference_type' => fake()->optional()->randomElement([
//                 'perencanaan', 'pengadaan', 'barang', 'pemeliharaan',
//             ]),
//             'reference_id' => fake()->optional()->numberBetween(1, 11),
//             'ip_address' => fake()->ipv4(),
//             'user_agent' => fake()->optional()->userAgent(),
//         ];
//     }
// }
