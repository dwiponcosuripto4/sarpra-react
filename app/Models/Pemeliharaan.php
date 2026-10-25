<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pemeliharaan extends Model
{
    use HasFactory;

    protected $table = 'pemeliharaan';

    protected $fillable = [
        'barang_id', 'jenis_pemeliharaan_id', 'prioritas_id', 'user_id',
        'nomor_pemeliharaan', 'tanggal_pengajuan', 'masalah',
        'estimasi_biaya', 'status',
    ];

    protected function casts(): array
    {
        return ['tanggal_pengajuan' => 'date'];
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function jenis(): BelongsTo
    {
        return $this->belongsTo(JenisPemeliharaan::class, 'jenis_pemeliharaan_id');
    }

    public function prioritas(): BelongsTo
    {
        return $this->belongsTo(Prioritas::class, 'prioritas_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function dokumen(): HasMany
    {
        return $this->hasMany(DokumenPemeliharaan::class, 'pemeliharaan_id');
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatPemeliharaan::class, 'pemeliharaan_id');
    }
}
