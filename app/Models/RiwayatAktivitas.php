<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatAktivitas extends Model
{
    use HasFactory;

    protected $table = 'riwayat_aktivitas';

    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'activity', 'description', 'module', 'reference_type',
        'reference_id', 'ip_address', 'user_agent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Status tampilan turunan dari jenis aktivitas.
     *
     * @return array{label: string, dot: string, kelas: string}
     */
    public function statusTampilan(): array
    {
        return match ($this->activity) {
            'tolak' => [
                'label' => 'Gagal / Peringatan',
                'dot' => 'bg-red-500',
                'kelas' => 'bg-red-50 text-red-700 border-red-200',
            ],
            'ajukan' => [
                'label' => 'Diproses',
                'dot' => 'bg-blue-500 animate-pulse',
                'kelas' => 'bg-blue-50 text-blue-700 border-blue-200',
            ],
            default => [
                'label' => 'Berhasil',
                'dot' => 'bg-emerald-500',
                'kelas' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
            ],
        };
    }
}
