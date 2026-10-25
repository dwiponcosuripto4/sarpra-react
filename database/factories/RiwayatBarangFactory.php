<?php

namespace Database\Factories;

use App\Models\Barang;
use App\Models\KondisiBarang;
use App\Models\Lokasi;
use App\Models\RiwayatBarang;
use App\Models\StatusBarang;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RiwayatBarang>
 */
class RiwayatBarangFactory extends Factory
{
    protected $model = RiwayatBarang::class;

    public function definition(): array
    {
        return [
            'barang_id' => Barang::inRandomOrder()->value('id'),
            'user_id' => User::inRandomOrder()->value('id'),
            'kondisi_barang_id' => KondisiBarang::inRandomOrder()->value('id'),
            'status_barang_id' => StatusBarang::inRandomOrder()->value('id'),
            'lokasi_id' => Lokasi::inRandomOrder()->value('id'),
            'catatan' => fake()->sentence(8),
        ];
    }
}
