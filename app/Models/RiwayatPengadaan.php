<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPengadaan extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pengadaan';

    public const UPDATED_AT = null;

    protected $fillable = ['pengadaan_id', 'user_id', 'status', 'catatan'];

    public function pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
