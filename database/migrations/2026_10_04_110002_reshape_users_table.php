<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Finalisasi tabel user sesuai skema SARPRA + rename users → user.
     * Kolom akhir: id, role_id, name(100), email(150, unique),
     * password(255), is_active, last_login_at, timestamps.
     */
    public function up(): void
    {
        // Amankan baris tanpa role sebelum role_id dijadikan NOT NULL.
        $fallbackRoleId = DB::table('role')->orderBy('id')->value('id');

        if ($fallbackRoleId) {
            DB::table('users')->whereNull('role_id')->update(['role_id' => $fallbackRoleId]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified_at',
                'remember_token',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'two_factor_confirmed_at',
            ]);
        });

        // Hanya MySQL yang mendukung MODIFY; SQLite mengabaikan batas panjang.
        // FK lama memakai SET NULL sehingga dicabut dulu, lalu dipasang
        // ulang sebagai RESTRICT agar role_id bisa NOT NULL.
        if (DB::getDriverName() === 'mysql') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['role_id']);
            });

            DB::statement('ALTER TABLE `users` MODIFY `role_id` BIGINT UNSIGNED NOT NULL AFTER `id`');
            DB::statement('ALTER TABLE `users` MODIFY `name` VARCHAR(100) NOT NULL AFTER `role_id`');
            DB::statement('ALTER TABLE `users` MODIFY `email` VARCHAR(150) NOT NULL AFTER `name`');
            DB::statement('ALTER TABLE `users` MODIFY `password` VARCHAR(255) NOT NULL AFTER `email`');
            DB::statement('ALTER TABLE `users` MODIFY `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `password`');
            DB::statement('ALTER TABLE `users` MODIFY `last_login_at` TIMESTAMP NULL AFTER `is_active`');

            Schema::table('users', function (Blueprint $table) {
                $table->foreign('role_id')->references('id')->on('role');
            });
        }

        Schema::rename('users', 'user');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('user', 'users');

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
        });
    }
};
