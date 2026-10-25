<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Modul Perencanaan Kebutuhan + riwayatnya.
     */
    public function up(): void
    {
        Schema::create('perencanaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('kategori_barang_id')->constrained('kategori_barang');
            $table->foreignId('satuan_id')->constrained('satuan');
            $table->foreignId('prioritas_id')->constrained('prioritas');
            $table->foreignId('periode_id')->constrained('periode');
            $table->string('nama_kebutuhan', 150);
            $table->integer('jumlah');
            $table->text('alasan')->nullable();
            $table->string('status', 50);
            $table->timestamps();
        });

        Schema::create('riwayat_perencanaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perencanaan_id')->constrained('perencanaan')->cascadeOnDelete();
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
        Schema::dropIfExists('riwayat_perencanaan');
        Schema::dropIfExists('perencanaan');
    }
};
