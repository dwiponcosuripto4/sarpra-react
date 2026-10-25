<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersetujuanPengadaan extends Model
{
    use HasFactory;

    protected $table = 'persetujuan_pengadaan';

    protected $fillable = [
        'pengadaan_id', 'pimpinan_id', 'status', 'catatan', 'tanggal_persetujuan',
    ];

    protected function casts(): array
    {
        return ['tanggal_persetujuan' => 'datetime'];
    }

    public function pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }

    public function pimpinan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pimpinan_id');
    }
}
