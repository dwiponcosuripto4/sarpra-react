<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Modul Pengadaan + detail, dokumen, persetujuan, riwayat.
     */
    public function up(): void
    {
        Schema::create('pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perencanaan_id')->nullable()->constrained('perencanaan')->nullOnDelete();
            $table->foreignId('jenis_pengadaan_id')->constrained('jenis_pengadaan');
            $table->foreignId('user_id')->constrained('users');
            $table->string('nomor_pengadaan', 100)->unique()->nullable();
            $table->date('tanggal_pengajuan');
            $table->text('alasan')->nullable();
            $table->string('status', 50);
            $table->timestamps();
        });

        Schema::create('detail_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->constrained('pengadaan')->cascadeOnDelete();
            $table->foreignId('kategori_barang_id')->constrained('kategori_barang');
            $table->foreignId('satuan_id')->constrained('satuan');
            $table->string('nama_barang', 150);
            $table->text('spesifikasi')->nullable();
            $table->integer('jumlah');
            $table->decimal('estimasi_harga', 15, 2)->nullable();
            $table->decimal('subtotal', 15, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('dokumen_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->constrained('pengadaan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('nama_dokumen', 150);
            $table->string('file_path', 255);
            $table->string('file_type', 50)->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('persetujuan_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->constrained('pengadaan')->cascadeOnDelete();
            $table->foreignId('pimpinan_id')->constrained('users');
            $table->string('status', 50);
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_persetujuan')->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->constrained('pengadaan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('status', 50);
            $table->text('catatan')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_pengadaan');
        Schema::dropIfExists('persetujuan_pengadaan');
        Schema::dropIfExists('dokumen_pengadaan');
        Schema::dropIfExists('detail_pengadaan');
        Schema::dropIfExists('pengadaan');
    }
};
