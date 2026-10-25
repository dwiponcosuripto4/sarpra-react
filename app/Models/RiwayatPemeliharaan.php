<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPemeliharaan extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pemeliharaan';

    public const UPDATED_AT = null;

    protected $fillable = [
        'pemeliharaan_id', 'user_id', 'tanggal', 'jenis_tindakan', 'masalah',
        'tindakan', 'biaya', 'pelaksana', 'status', 'catatan',
        'dokumen_sebelum', 'dokumen_sesudah',
    ];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }

    public function pemeliharaan(): BelongsTo
    {
        return $this->belongsTo(Pemeliharaan::class, 'pemeliharaan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
