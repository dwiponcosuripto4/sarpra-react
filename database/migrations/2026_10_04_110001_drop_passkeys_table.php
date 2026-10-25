<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hapus tabel passkeys: login passwordless tidak dipakai SARPRA.
     */
    public function up(): void
    {
        Schema::dropIfExists('passkeys');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('passkeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('credential');
            $table->timestamps();
        });
    }
};
