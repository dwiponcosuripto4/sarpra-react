<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPerencanaan extends Model
{
    use HasFactory;

    protected $table = 'riwayat_perencanaan';

    public const UPDATED_AT = null;

    protected $fillable = ['perencanaan_id', 'user_id', 'status', 'catatan'];

    public function perencanaan(): BelongsTo
    {
        return $this->belongsTo(Perencanaan::class, 'perencanaan_id');
    }
}
