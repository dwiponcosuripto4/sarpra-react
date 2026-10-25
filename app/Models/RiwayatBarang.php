<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatBarang extends Model
{
    use HasFactory;

    protected $table = 'riwayat_barang';

    public const UPDATED_AT = null;

    protected $fillable = [
        'barang_id', 'user_id', 'kondisi_barang_id', 'status_barang_id',
        'lokasi_id', 'catatan',
    ];

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
