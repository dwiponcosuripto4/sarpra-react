<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriBarang extends Model
{
    use HasFactory;

    protected $table = 'kategori_barang';

    protected $fillable = ['name', 'description'];

    public function barangs(): HasMany
    {
        return $this->hasMany(Barang::class, 'kategori_barang_id');
    }
}
