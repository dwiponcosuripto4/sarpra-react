<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Barang extends Model
{
    use HasFactory;

    protected $table = 'barang';

    protected $fillable = [
        'kategori_barang_id', 'satuan_id', 'lokasi_id', 'kondisi_barang_id',
        'status_barang_id', 'pengadaan_id', 'perencanaan_id', 'kode_barang',
        'nama_barang', 'merk', 'spesifikasi', 'jumlah', 'tahun_perolehan',
        'sumber_perolehan', 'harga_perolehan', 'foto', 'dokumen',
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_barang_id');
    }

    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class, 'satuan_id');
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(KondisiBarang::class, 'kondisi_barang_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(StatusBarang::class, 'status_barang_id');
    }
}
