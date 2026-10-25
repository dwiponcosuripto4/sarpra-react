<?php

namespace App\Http\Middleware;

use App\Models\Notifikasi;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Nama peran diambil eksplisit via getAttribute (relasi generik Eloquent).
        $namaPeran = $user?->role?->getAttribute('name');

        // Format hari Indonesia tanpa merusak locale aplikasi (env 'en').
        $namaHari = ['Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'][(string) CarbonImmutable::now()->format('l')] ?? '';
        $namaBulan = ['January' => 'Januari', 'February' => 'Februari', 'March' => 'Maret', 'April' => 'April', 'May' => 'Mei', 'June' => 'Juni', 'July' => 'Juli', 'August' => 'Agustus', 'September' => 'September', 'October' => 'Oktober', 'November' => 'November', 'December' => 'Desember'][(string) CarbonImmutable::now()->format('F')] ?? '';
        $tanggalHariIni = trim(
            ($namaHari ? $namaHari.', ' : '').CarbonImmutable::now()->format('d ').
            $namaBulan.' '.CarbonImmutable::now()->format('Y'),
        );

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $namaPeran,
                    'initials' => $user->initials(),
                ] : null,
            ],
            // Properti cangkang SARPRA yang dipakai sidebar & header.
            'notifikasi' => [
                'belumDibaca' => $user
                    ? Notifikasi::where('user_id', $user->id)->where('is_read', false)->count()
                    : 0,
            ],
            'tanggalHariIni' => $tanggalHariIni,
        ];
    }
}
