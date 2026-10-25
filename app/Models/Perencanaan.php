<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Perencanaan extends Model
{
    use HasFactory;

    protected $table = 'perencanaan';

    protected $fillable = [
        'user_id', 'kategori_barang_id', 'satuan_id', 'prioritas_id',
        'periode_id', 'nama_kebutuhan', 'jumlah', 'alasan', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_barang_id');
    }

    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class, 'satuan_id');
    }

    public function prioritas(): BelongsTo
    {
        return $this->belongsTo(Prioritas::class, 'prioritas_id');
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(Periode::class, 'periode_id');
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatPerencanaan::class, 'perencanaan_id');
    }
}
