<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPengadaan extends Model
{
    use HasFactory;

    protected $table = 'dokumen_pengadaan';

    public const UPDATED_AT = null;

    protected $fillable = [
        'pengadaan_id', 'user_id', 'nama_dokumen', 'file_path',
        'file_type', 'file_size',
    ];

    public function pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }
}
