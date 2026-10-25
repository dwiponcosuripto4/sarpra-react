<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPemeliharaan extends Model
{
    use HasFactory;

    protected $table = 'dokumen_pemeliharaan';

    public const UPDATED_AT = null;

    protected $fillable = [
        'pemeliharaan_id', 'user_id', 'nama_dokumen', 'file_path',
        'file_type', 'file_size',
    ];

    public function pemeliharaan(): BelongsTo
    {
        return $this->belongsTo(Pemeliharaan::class, 'pemeliharaan_id');
    }
}
