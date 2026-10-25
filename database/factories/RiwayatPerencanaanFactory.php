<?php

namespace Database\Factories;

use App\Models\Perencanaan;
use App\Models\RiwayatPerencanaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RiwayatPerencanaan>
 */
class RiwayatPerencanaanFactory extends Factory
{
    protected $model = RiwayatPerencanaan::class;

    public function definition(): array
    {
        return [
            'perencanaan_id' => Perencanaan::inRandomOrder()->value('id'),
            'user_id' => User::inRandomOrder()->value('id'),
            'status' => fake()->randomElement(['draft', 'diajukan']),
            'catatan' => fake()->optional()->sentence(),
        ];
    }
}
