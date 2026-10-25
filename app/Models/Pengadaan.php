<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pengadaan extends Model
{
    use HasFactory;

    protected $table = 'pengadaan';

    protected $fillable = [
        'perencanaan_id', 'jenis_pengadaan_id', 'user_id', 'nomor_pengadaan',
        'tanggal_pengajuan', 'alasan', 'status',
    ];

    protected function casts(): array
    {
        return ['tanggal_pengajuan' => 'date'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function perencanaan(): BelongsTo
    {
        return $this->belongsTo(Perencanaan::class, 'perencanaan_id');
    }

    public function jenis(): BelongsTo
    {
        return $this->belongsTo(JenisPengadaan::class, 'jenis_pengadaan_id');
    }

    public function detail(): HasMany
    {
        return $this->hasMany(DetailPengadaan::class, 'pengadaan_id');
    }

    public function persetujuan(): HasOne
    {
        return $this->hasOne(PersetujuanPengadaan::class, 'pengadaan_id');
    }

    public function dokumen(): HasMany
    {
        return $this->hasMany(DokumenPengadaan::class, 'pengadaan_id');
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatPengadaan::class, 'pengadaan_id');
    }
}
