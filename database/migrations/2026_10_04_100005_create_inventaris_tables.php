<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Modul Inventarisasi: barang + mutasi + riwayat.
     */
    public function up(): void
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_barang_id')->constrained('kategori_barang');
            $table->foreignId('satuan_id')->constrained('satuan');
            $table->foreignId('lokasi_id')->constrained('lokasi');
            $table->foreignId('kondisi_barang_id')->constrained('kondisi_barang');
            $table->foreignId('status_barang_id')->constrained('status_barang');
            $table->foreignId('pengadaan_id')->nullable()->constrained('pengadaan')->nullOnDelete();
            $table->foreignId('perencanaan_id')->nullable()->constrained('perencanaan')->nullOnDelete();
            $table->string('kode_barang', 100)->unique();
            $table->string('nama_barang', 150);
            $table->string('merk', 100)->nullable();
            $table->text('spesifikasi')->nullable();
            $table->integer('jumlah');
            $table->year('tahun_perolehan')->nullable();
            $table->string('sumber_perolehan', 100)->nullable();
            $table->decimal('harga_perolehan', 15, 2)->nullable();
            $table->string('foto', 255)->nullable();
            $table->string('dokumen', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('kondisi_barang_id')->nullable()->constrained('kondisi_barang')->nullOnDelete();
            $table->foreignId('status_barang_id')->nullable()->constrained('status_barang')->nullOnDelete();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_barang');
        Schema::dropIfExists('barang');
    }
};
