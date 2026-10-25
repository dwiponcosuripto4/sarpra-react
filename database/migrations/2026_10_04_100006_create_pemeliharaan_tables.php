<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Modul Pemeliharaan + dokumen + riwayat.
     */
    public function up(): void
    {
        Schema::create('pemeliharaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang');
            $table->foreignId('jenis_pemeliharaan_id')->constrained('jenis_pemeliharaan');
            $table->foreignId('prioritas_id')->constrained('prioritas');
            $table->foreignId('user_id')->constrained('users');
            $table->string('nomor_pemeliharaan', 100)->unique()->nullable();
            $table->date('tanggal_pengajuan');
            $table->text('masalah');
            $table->decimal('estimasi_biaya', 15, 2)->nullable();
            $table->string('status', 50);
            $table->timestamps();
        });

        Schema::create('dokumen_pemeliharaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pemeliharaan_id')->constrained('pemeliharaan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('nama_dokumen', 150);
            $table->string('file_path', 255);
            $table->string('file_type', 50)->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('riwayat_pemeliharaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pemeliharaan_id')->constrained('pemeliharaan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->date('tanggal');
            $table->string('jenis_tindakan', 150)->nullable();
            $table->text('masalah')->nullable();
            $table->text('tindakan')->nullable();
            $table->decimal('biaya', 15, 2)->nullable();
            $table->string('pelaksana', 150)->nullable();
            $table->string('status', 50);
            $table->text('catatan')->nullable();
            $table->string('dokumen_sebelum', 255)->nullable();
            $table->string('dokumen_sesudah', 255)->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_pemeliharaan');
        Schema::dropIfExists('dokumen_pemeliharaan');
        Schema::dropIfExists('pemeliharaan');
    }
};
