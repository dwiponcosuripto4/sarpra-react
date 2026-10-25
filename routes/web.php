<?php

use App\Models\Barang;
use App\Models\DetailPengadaan;
use App\Models\DokumenPengadaan;
use App\Models\JenisPemeliharaan;
use App\Models\JenisPengadaan;
use App\Models\KategoriBarang;
use App\Models\KondisiBarang;
use App\Models\Lokasi;
use App\Models\Notifikasi;
use App\Models\Pemeliharaan;
use App\Models\Pengadaan;
use App\Models\Perencanaan;
use App\Models\Periode;
use App\Models\PersetujuanPengadaan;
use App\Models\Prioritas;
use App\Models\RiwayatAktivitas;
use App\Models\RiwayatBarang;
use App\Models\RiwayatPemeliharaan;
use App\Models\RiwayatPengadaan;
use App\Models\RiwayatPerencanaan;
use App\Models\Role;
use App\Models\Satuan;
use App\Models\StatusBarang;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    $aktivitasQuery = function (Request $request) {
        return RiwayatAktivitas::with(['user.role'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(function ($w) use ($cari) {
                    $w->where('activity', 'like', $cari)
                        ->orWhere('description', 'like', $cari)
                        ->orWhere('module', 'like', $cari)
                        ->orWhereHas('user', fn ($u) => $u
                            ->where('name', 'like', $cari)
                            ->orWhere('email', 'like', $cari));
                });
            })
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->whereHas('user.role', fn ($r) => $r->where('name', $request->input('role')));
            })
            ->when($request->filled('aktivitas'), function ($q) use ($request) {
                $q->where('activity', $request->input('aktivitas'));
            })
            ->latest();
    };

    $notifCount = fn () => Notifikasi::where('user_id', Auth::id())
        ->where('is_read', false)
        ->count();

    Route::get('dashboard', function (Request $request) use ($aktivitasQuery, $notifCount) {
        $pengguna = Auth::user();
        $namaPeran = $pengguna->role?->name;
        $tanggalHariIni = now()->locale('id')->translatedFormat('l, d F Y');

        if ($namaPeran === 'Pengelola Sarana & Prasarana') {
            $totalUnit = (int) Barang::sum('jumlah');
            $baik = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Baik'))->sum('jumlah');
            $ringan = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Ringan'))->sum('jumlah');
            $berat = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Berat'))->sum('jumlah');
            $pending = Pengadaan::whereIn('status', ['diajukan', 'menunggu_persetujuan'])->count();
            $tiketAktif = Pemeliharaan::whereIn('status', ['diajukan', 'dalam_pemeliharaan'])->count();
            $jumlahKategori = Barang::distinct('kategori_barang_id')->count('kategori_barang_id');

            $aset = Barang::with(['kategori', 'lokasi', 'kondisi', 'status'])
                ->when($request->filled('cari'), function ($q) use ($request) {
                    $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                    $q->where(fn ($w) => $w
                        ->where('kode_barang', 'like', $cari)
                        ->orWhere('nama_barang', 'like', $cari));
                })
                ->when($request->filled('kondisi'), function ($q) use ($request) {
                    $q->whereHas('kondisi', fn ($k) => $k->where('name', $request->input('kondisi')));
                })
                ->latest()
                ->paginate(5)
                ->withQueryString();

            return Inertia::render('pengelola/dashboard', [

                'menuAktif' => 'dashboard',
                'notifBelumDibaca' => $notifCount(),
                'tanggalHariIni' => $tanggalHariIni,
                'totalUnit' => $totalUnit,
                'baik' => $baik,
                'ringan' => $ringan,
                'berat' => $berat,
                'pending' => $pending,
                'tiketAktif' => $tiketAktif,
                'jumlahKategori' => $jumlahKategori,
                'aset' => $aset,
            ]);
        }

        if ($namaPeran === 'Pimpinan') {
            $totalUnit = (int) Barang::sum('jumlah');
            $valuasi = (int) Barang::selectRaw('COALESCE(SUM(harga_perolehan * jumlah), 0) as total')->value('total');
            $baik = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Baik'))->sum('jumlah');
            $ringan = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Ringan'))->sum('jumlah');
            $berat = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Berat'))->sum('jumlah');

            $pagu = 150000000;
            $realisasi = (int) DB::table('detail_pengadaan')
                ->join('pengadaan', 'pengadaan.id', '=', 'detail_pengadaan.pengadaan_id')
                ->where('pengadaan.status', 'disetujui')
                ->selectRaw('COALESCE(SUM(detail_pengadaan.subtotal), 0) as total')
                ->value('total');

            $antrean = Pengadaan::with(['user', 'detail', 'perencanaan.prioritas'])
                ->whereIn('status', ['diajukan', 'menunggu_persetujuan'])
                ->when($request->filled('prioritas'), function ($q) use ($request) {
                    $q->whereHas('perencanaan.prioritas', fn ($p) => $p->where('name', $request->input('prioritas')));
                })
                ->latest()
                ->take(6)
                ->get();
            $totalAntrean = Pengadaan::whereIn('status', ['diajukan', 'menunggu_persetujuan'])->count();
            $totalButuhRespon = (int) DB::table('detail_pengadaan')
                ->join('pengadaan', 'pengadaan.id', '=', 'detail_pengadaan.pengadaan_id')
                ->whereIn('pengadaan.status', ['diajukan', 'menunggu_persetujuan'])
                ->selectRaw('COALESCE(SUM(detail_pengadaan.subtotal), 0) as total')
                ->value('total');

            return Inertia::render('pimpinan/dashboard', [

                'menuAktif' => 'dashboard',
                'notifBelumDibaca' => $notifCount(),
                'tanggalHariIni' => $tanggalHariIni,
                'totalUnit' => $totalUnit,
                'valuasi' => $valuasi,
                'pagu' => $pagu,
                'realisasi' => $realisasi,
                'baik' => $baik,
                'ringan' => $ringan,
                'berat' => $berat,
                'antrean' => $antrean,
                'totalAntrean' => $totalAntrean,
                'totalButuhRespon' => $totalButuhRespon,
            ]);
        }

        // Administrator (default).
        $totalAktif = User::where('is_active', true)->count();
        $baruBulanIni = User::where('created_at', '>=', now()->subMonth())->count();
        $aktifMingguIni = User::where('is_active', true)
            ->where('created_at', '>=', now()->subWeek())
            ->count();

        $roles = Role::orderBy('id')->get();

        $perPage = (int) $request->input('per_halaman', 6);
        $perPage = in_array($perPage, [6, 10, 25, 50], true) ? $perPage : 6;

        $aktivitas = $aktivitasQuery($request)->paginate($perPage)->withQueryString();

        $totalMaster = 0;
        foreach (['kategori_barang', 'satuan', 'lokasi', 'kondisi_barang', 'status_barang', 'jenis_pemeliharaan', 'jenis_pengadaan', 'prioritas', 'periode'] as $tabel) {
            $totalMaster += DB::table($tabel)->count();
        }

        return Inertia::render('admin/dashboard', [

            'menuAktif' => 'dashboard',
            'totalAktif' => $totalAktif,
            'baruBulanIni' => $baruBulanIni,
            'aktifMingguIni' => $aktifMingguIni,
            'roles' => $roles,
            'totalMaster' => $totalMaster,
            'aktivitas' => $aktivitas,
            'notifBelumDibaca' => $notifCount(),
            'tanggalHariIni' => $tanggalHariIni,
        ]);
    })->name('dashboard');

    Route::get('dashboard/ekspor', function (Request $request) use ($aktivitasQuery) {
        $baris = $aktivitasQuery($request)->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Waktu', 'Pengguna', 'Email', 'Role', 'Aktivitas', 'Deskripsi', 'Status']);

            foreach ($baris as $a) {
                fputcsv($out, [
                    $a->created_at?->locale('id')->translatedFormat('d M Y, H:i:s'),
                    $a->user?->name ?? 'Sistem',
                    $a->user?->email ?? '-',
                    $a->user?->role?->name ?? 'Sistem',
                    $a->activity,
                    $a->description,
                    $a->statusTampilan()['label'],
                ]);
            }

            fclose($out);
        }, 'aktivitas-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('dashboard.ekspor');

    Route::get('dashboard/ekspor-eksekutif', function () {
        $baris = Pengadaan::with(['user', 'detail'])
            ->whereIn('status', ['diajukan', 'menunggu_persetujuan'])
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Nomor', 'Tanggal', 'Pengaju', 'Paket', 'Estimasi (Rp)']);

            foreach ($baris as $p) {
                fputcsv($out, [
                    $p->nomor_pengadaan,
                    $p->tanggal_pengajuan?->locale('id')->translatedFormat('d M Y'),
                    $p->user?->name ?? '-',
                    $p->detail->first()?->nama_barang ?? '-',
                    $p->detail->sum('subtotal'),
                ]);
            }

            fclose($out);
        }, 'laporan-eksekutif-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('dashboard.ekspor-eksekutif');

    $putuskan = function (Request $request, Pengadaan $pengadaan, string $keputusan) {
        abort_unless(Auth::user()->role?->name === 'Pimpinan', 403);

        $pengadaan->update(['status' => $keputusan === 'disetujui' ? 'disetujui' : 'ditolak']);

        PersetujuanPengadaan::updateOrCreate(
            ['pengadaan_id' => $pengadaan->id],
            [
                'pimpinan_id' => Auth::id(),
                'status' => $keputusan === 'disetujui' ? 'disetujui' : 'ditolak',
                'catatan' => $request->input('catatan'),
                'tanggal_persetujuan' => now(),
            ]
        );

        RiwayatPengadaan::create([
            'pengadaan_id' => $pengadaan->id,
            'user_id' => Auth::id(),
            'status' => $pengadaan->status,
            'catatan' => $keputusan === 'disetujui'
                ? 'Disetujui pimpinan.'
                : 'Ditolak pimpinan: '.($request->input('catatan') ?? 'tanpa catatan.'),
        ]);

        return redirect()->route('dashboard')->with(
            'status',
            $keputusan === 'disetujui'
                ? "Usulan {$pengadaan->nomor_pengadaan} disetujui."
                : "Usulan {$pengadaan->nomor_pengadaan} ditolak."
        );
    };

    Route::post('dashboard/pengadaan/{pengadaan}/setujui', fn (Request $request, Pengadaan $pengadaan) => $putuskan($request, $pengadaan, 'disetujui'))->name('persetujuan.setujui');
    Route::post('dashboard/pengadaan/{pengadaan}/tolak', fn (Request $request, Pengadaan $pengadaan) => $putuskan($request, $pengadaan, 'ditolak'))->name('persetujuan.tolak');

    $hanya = function (string ...$roles): void {
        abort_unless(in_array(Auth::user()->role?->name, $roles, true), 403);
    };

    $shell = fn (string $aktif) => [

        'menuAktif' => $aktif,
        'notifBelumDibaca' => $notifCount(),
        'tanggalHariIni' => now()->locale('id')->translatedFormat('l, d F Y'),
    ];

    $daftarMaster = [
        'kategori' => ['label' => 'Kategori Barang', 'ikon' => 'category', 'model' => KategoriBarang::class, 'relasi' => [Barang::class, 'kategori_barang_id']],
        'satuan' => ['label' => 'Satuan', 'ikon' => 'straighten', 'model' => Satuan::class, 'relasi' => [Barang::class, 'satuan_id']],
        'lokasi' => ['label' => 'Lokasi & Ruangan', 'ikon' => 'meeting_room', 'model' => Lokasi::class, 'relasi' => [Barang::class, 'lokasi_id']],
        'kondisi' => ['label' => 'Kondisi Barang', 'ikon' => 'fact_check', 'model' => KondisiBarang::class, 'relasi' => [Barang::class, 'kondisi_barang_id']],
        'status' => ['label' => 'Status Barang', 'ikon' => 'sync_alt', 'model' => StatusBarang::class, 'relasi' => [Barang::class, 'status_barang_id']],
        'jenis-pengadaan' => ['label' => 'Jenis Pengadaan', 'ikon' => 'shopping_bag', 'model' => JenisPengadaan::class, 'relasi' => [Pengadaan::class, 'jenis_pengadaan_id']],
        'jenis-pemeliharaan' => ['label' => 'Jenis Pemeliharaan', 'ikon' => 'build', 'model' => JenisPemeliharaan::class, 'relasi' => [Pemeliharaan::class, 'jenis_pemeliharaan_id']],
        'prioritas' => ['label' => 'Prioritas', 'ikon' => 'flag', 'model' => Prioritas::class, 'relasi' => [Perencanaan::class, 'prioritas_id']],
        'periode' => ['label' => 'Periode', 'ikon' => 'calendar_today', 'model' => Periode::class, 'relasi' => [Perencanaan::class, 'periode_id']],
    ];

    $modelMaster = function (string $entitas) use ($daftarMaster) {
        abort_unless(array_key_exists($entitas, $daftarMaster), 404);

        return $daftarMaster[$entitas]['model'];
    };

    // ---- Administrator ----
    Route::get('admin/pengguna', function (Request $request) use ($shell, $hanya) {
        $hanya('Administrator');

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $pengguna = User::with('role')
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w->where('name', 'like', $cari)->orWhere('email', 'like', $cari));
            })
            ->when($request->filled('role'), fn ($q) => $q->whereHas('role', fn ($r) => $r->where('name', $request->input('role'))))
            ->when($request->filled('status'), fn ($q) => $q->where('is_active', $request->input('status') === 'aktif'))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $roles = Role::orderBy('id')->get();
        $totalPengguna = User::count();
        $perPeran = Role::withCount(['users as aktif_count' => fn ($q) => $q->where('is_active', true)])->orderBy('id')->get();

        return Inertia::render('admin/users/index', [
            ...$shell('pengguna'),
            'pengguna' => $pengguna,
            'roles' => $roles,
            'totalPengguna' => $totalPengguna,
            'perPeran' => $perPeran,
        ]);
    })->name('pengguna.index');

    Route::post('admin/pengguna', function (Request $request) use ($hanya) {
        $hanya('Administrator');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('user', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['required', 'exists:role,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role_id' => $data['role_id'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'tambah',
            'description' => "Menambahkan akun {$user->name} ({$user->email}).",
            'module' => 'pengguna',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('pengguna.index')->with('status', "Akun {$user->name} dibuat.");
    })->name('pengguna.store');

    Route::post('admin/pengguna/{user}/toggle', function (Request $request, User $user) use ($hanya) {
        $hanya('Administrator');
        abort_if($user->id === Auth::id(), 403, 'Tidak dapat menonaktifkan akun sendiri.');

        $user->update(['is_active' => ! $user->is_active]);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'ubah_status',
            'description' => ($user->is_active ? 'Mengaktifkan' : 'Menonaktifkan')." akun {$user->name} ({$user->email}).",
            'module' => 'pengguna',
            'reference_type' => 'user',
            'reference_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('pengguna.index')->with(
            'status',
            $user->is_active ? "Akun {$user->name} diaktifkan." : "Akun {$user->name} dinonaktifkan."
        );
    })->name('pengguna.toggle');

    Route::post('admin/pengguna/batch', function (Request $request) use ($hanya) {
        $hanya('Administrator');

        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:user,id'],
            'aksi' => ['required', 'in:aktifkan,nonaktifkan'],
        ]);

        $ids = array_filter($data['ids'], fn ($id) => (int) $id !== Auth::id());

        User::whereIn('id', $ids)->update(['is_active' => $data['aksi'] === 'aktifkan']);

        $aksi = $data['aksi'] === 'aktifkan' ? 'Mengaktifkan' : 'Menonaktifkan';
        foreach (User::whereIn('id', $ids)->get() as $target) {
            RiwayatAktivitas::create([
                'user_id' => Auth::id(),
                'activity' => 'ubah_status',
                'description' => "{$aksi} akun {$target->name} ({$target->email}) via aksi massal.",
                'module' => 'pengguna',
                'reference_type' => 'user',
                'reference_id' => $target->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return redirect()->route('pengguna.index')->with(
            'status',
            count($ids).' akun '.($data['aksi'] === 'aktifkan' ? 'diaktifkan.' : 'dinonaktifkan.')
        );
    })->name('pengguna.batch');

    Route::get('admin/pengguna/ekspor', function (Request $request) use ($hanya) {
        $hanya('Administrator');

        $baris = User::with('role')
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w->where('name', 'like', $cari)->orWhere('email', 'like', $cari));
            })
            ->when($request->filled('role'), fn ($q) => $q->whereHas('role', fn ($r) => $r->where('name', $request->input('role'))))
            ->when($request->filled('status'), fn ($q) => $q->where('is_active', $request->input('status') === 'aktif'))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Nama', 'Email', 'Role', 'Status', 'Login Terakhir', 'Dibuat']);

            foreach ($baris as $u) {
                fputcsv($out, [
                    $u->name,
                    $u->email,
                    $u->role?->name ?? '-',
                    $u->is_active ? 'Aktif' : 'Nonaktif',
                    $u->last_login_at?->locale('id')->translatedFormat('d M Y, H:i:s') ?? '-',
                    $u->created_at?->locale('id')->translatedFormat('d M Y') ?? '-',
                ]);
            }

            fclose($out);
        }, 'pengguna-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('pengguna.ekspor');

    Route::get('admin/master', function (Request $request) use ($shell, $hanya, $daftarMaster) {
        $hanya('Administrator');

        $kunci = $request->input('entitas', 'kategori');
        $kunci = array_key_exists($kunci, $daftarMaster) ? $kunci : 'kategori';

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $data = $daftarMaster[$kunci]['model']::query()
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where('name', 'like', $cari);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        [$relModel, $relKolom] = $daftarMaster[$kunci]['relasi'];
        $relasiCount = $relModel::whereIn($relKolom, $data->pluck('id')->all())
            ->selectRaw("{$relKolom} as id, COUNT(*) as jml")
            ->groupBy($relKolom)
            ->pluck('jml', 'id');

        $counts = [];
        foreach ($daftarMaster as $key => $entitas) {
            $counts[$key] = $entitas['model']::count();
        }

        return Inertia::render('admin/master-data/index', [
            ...$shell('master'),
            'daftar' => $daftarMaster,
            'kunci' => $kunci,
            'data' => $data,
            'counts' => $counts,
            'relasiCount' => $relasiCount,
            'totalTerintegrasi' => $relasiCount->sum(),
            'terakhirDiperbarui' => $daftarMaster[$kunci]['model']::max('updated_at'),
        ]);
    })->name('master.index');

    Route::post('admin/master/{entitas}', function (Request $request, string $entitas) use ($hanya, $modelMaster, $daftarMaster) {
        $hanya('Administrator');
        $model = $modelMaster($entitas);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique($model::make()->getTable(), 'name')],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $row = $model::create($data);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'tambah',
            'description' => "Menambahkan {$daftarMaster[$entitas]['label']}: {$row->name}.",
            'module' => 'master',
            'reference_type' => $entitas,
            'reference_id' => $row->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('master.index', ['entitas' => $entitas])->with('status', "Data {$data['name']} ditambahkan.");
    })->name('master.store');

    Route::put('admin/master/{entitas}/{id}', function (Request $request, string $entitas, int $id) use ($hanya, $modelMaster, $daftarMaster) {
        $hanya('Administrator');
        $model = $modelMaster($entitas);
        $row = $model::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique($row->getTable(), 'name')->ignore($row->id)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $row->update($data);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'ubah',
            'description' => "Mengubah {$daftarMaster[$entitas]['label']}: {$row->name}.",
            'module' => 'master',
            'reference_type' => $entitas,
            'reference_id' => $row->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('master.index', ['entitas' => $entitas])->with('status', "Data {$row->name} diperbarui.");
    })->name('master.update');

    Route::delete('admin/master/{entitas}/{id}', function (Request $request, string $entitas, int $id) use ($hanya, $modelMaster, $daftarMaster) {
        $hanya('Administrator');
        $model = $modelMaster($entitas);
        $row = $model::findOrFail($id);

        [$relModel, $relKolom] = $daftarMaster[$entitas]['relasi'];
        if ($relModel::where($relKolom, $row->id)->exists()) {
            return redirect()->route('master.index', ['entitas' => $entitas])->with(
                'error',
                "Data {$row->name} dipakai data lain sehingga tidak dapat dihapus."
            );
        }

        $nama = $row->name;
        $row->delete();

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'hapus',
            'description' => "Menghapus {$daftarMaster[$entitas]['label']}: {$nama}.",
            'module' => 'master',
            'reference_type' => $entitas,
            'reference_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('master.index', ['entitas' => $entitas])->with('status', "Data {$nama} dihapus.");
    })->name('master.destroy');

    Route::get('admin/master/ekspor/{entitas?}', function (string $entitas = null) use ($hanya, $daftarMaster) {
        $hanya('Administrator');

        if ($entitas !== null && ! array_key_exists($entitas, $daftarMaster)) {
            abort(404);
        }

        $entitass = $entitas !== null ? [$entitas] : array_keys($daftarMaster);
        $satu = count($entitass) === 1;

        return response()->streamDownload(function () use ($daftarMaster, $entitass, $satu) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $satu ? ['Nama', 'Deskripsi'] : ['Entitas', 'Nama', 'Deskripsi', 'Total Relasi']);

            foreach ($entitass as $key) {
                [$relModel, $relKolom] = $daftarMaster[$key]['relasi'];
                $counts = $relModel::selectRaw("{$relKolom} as id, COUNT(*) as jml")
                    ->groupBy($relKolom)
                    ->pluck('jml', 'id');

                foreach ($daftarMaster[$key]['model']::orderBy('name')->get() as $row) {
                    if ($satu) {
                        fputcsv($out, [$row->name, $row->description]);
                    } else {
                        fputcsv($out, [
                            $daftarMaster[$key]['label'],
                            $row->name,
                            $row->description,
                            $counts[$row->id] ?? 0,
                        ]);
                    }
                }
            }

            fclose($out);
        }, 'kamus-data-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('master.ekspor');


    Route::get('admin/aktivitas', function (Request $request) use ($aktivitasQuery, $shell, $hanya) {
        $hanya('Administrator');

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $query = $aktivitasQuery($request)
            ->when($request->filled('modul'), fn ($q) => $q->where('module', $request->input('modul')))
            ->when($request->input('waktu', 'all') === 'today', fn ($q) => $q->whereDate('created_at', today()))
            ->when($request->input('waktu') === '7d', fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->when($request->input('waktu') === '30d', fn ($q) => $q->where('created_at', '>=', now()->subDays(30)));

        return Inertia::render('admin/activity-logs/index', [
            ...$shell('aktivitas'),
            'aktivitas' => $query->paginate($perPage)->withQueryString(),
            'totalLog' => RiwayatAktivitas::count(),
            'hariIni' => RiwayatAktivitas::whereDate('created_at', today())->count(),
            'perubahan' => RiwayatAktivitas::whereIn('activity', ['tambah', 'ubah', 'hapus'])->count(),
            'otorisasi' => RiwayatAktivitas::whereIn('activity', ['setujui', 'tolak'])->count(),
            'daftarModul' => RiwayatAktivitas::select('module')->distinct()->orderBy('module')->pluck('module')->filter()->values(),
        ]);
    })->name('aktivitas.index');

    // ---- Pengelola ----
    Route::get('pengelolaan/perencanaan', function (Request $request) use ($shell, $hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $data = Perencanaan::with(['kategori', 'satuan', 'prioritas', 'periode', 'user'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w->where('nama_kebutuhan', 'like', $cari)->orWhere('alasan', 'like', $cari));
            })
            ->when($request->filled('kategori'), fn ($q) => $q->where('kategori_barang_id', $request->input('kategori')))
            ->when($request->filled('periode'), fn ($q) => $q->where('periode_id', $request->input('periode')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('pengelola/perencanaan/index', [
            ...$shell('perencanaan'),
            'data' => $data,
            'totalUsulan' => Perencanaan::count(),
            'prioritasTinggi' => Perencanaan::whereHas('prioritas', fn ($q) => $q->whereIn('name', ['Tinggi', 'Mendesak']))->count(),
            'draft' => Perencanaan::where('status', 'draft')->count(),
            'diajukan' => Perencanaan::where('status', 'diajukan')->count(),
            'kategoris' => KategoriBarang::orderBy('name')->get(),
            'periodes' => Periode::orderBy('name')->get(),
            'satuans' => Satuan::orderBy('name')->get(),
            'prioritass' => Prioritas::orderBy('id')->get(),
        ]);
    })->name('perencanaan.index');

    Route::post('pengelolaan/perencanaan', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $data = $request->validate([
            'nama_kebutuhan' => ['required', 'string', 'max:150'],
            'kategori_barang_id' => ['required', 'exists:kategori_barang,id'],
            'periode_id' => ['required', 'exists:periode,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'satuan_id' => ['required', 'exists:satuan,id'],
            'prioritas' => ['required', 'in:Tinggi,Sedang,Rendah'],
            'alasan' => ['required', 'string'],
        ]);

        $prioritasId = Prioritas::where('name', $data['prioritas'])->value('id')
            ?? Prioritas::orderBy('id')->value('id');

        $rencana = Perencanaan::create([
            'user_id' => Auth::id(),
            'kategori_barang_id' => $data['kategori_barang_id'],
            'satuan_id' => $data['satuan_id'],
            'prioritas_id' => $prioritasId,
            'periode_id' => $data['periode_id'],
            'nama_kebutuhan' => $data['nama_kebutuhan'],
            'jumlah' => $data['jumlah'],
            'alasan' => $data['alasan'],
            'status' => 'draft',
        ]);

        RiwayatPerencanaan::create([
            'perencanaan_id' => $rencana->id,
            'user_id' => Auth::id(),
            'status' => 'draft',
            'catatan' => 'Usulan dibuat.',
        ]);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'tambah',
            'description' => "Membuat usulan kebutuhan {$rencana->nama_kebutuhan}.",
            'module' => 'perencanaan',
            'reference_type' => 'perencanaan',
            'reference_id' => $rencana->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('perencanaan.index')->with('status', "Kebutuhan {$rencana->nama_kebutuhan} disimpan sebagai draft.");
    })->name('perencanaan.store');

    Route::put('pengelolaan/perencanaan/{perencanaan}', function (Request $request, Perencanaan $perencanaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($perencanaan->status !== 'draft', 403, 'Hanya draft yang dapat diubah.');

        $data = $request->validate([
            'nama_kebutuhan' => ['required', 'string', 'max:150'],
            'kategori_barang_id' => ['required', 'exists:kategori_barang,id'],
            'periode_id' => ['required', 'exists:periode,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'satuan_id' => ['required', 'exists:satuan,id'],
            'prioritas' => ['required', 'in:Tinggi,Sedang,Rendah'],
            'alasan' => ['required', 'string'],
        ]);

        $perencanaan->update([
            'nama_kebutuhan' => $data['nama_kebutuhan'],
            'kategori_barang_id' => $data['kategori_barang_id'],
            'periode_id' => $data['periode_id'],
            'jumlah' => $data['jumlah'],
            'satuan_id' => $data['satuan_id'],
            'prioritas_id' => Prioritas::where('name', $data['prioritas'])->value('id') ?? $perencanaan->prioritas_id,
            'alasan' => $data['alasan'],
        ]);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'ubah',
            'description' => "Mengubah usulan kebutuhan {$perencanaan->nama_kebutuhan}.",
            'module' => 'perencanaan',
            'reference_type' => 'perencanaan',
            'reference_id' => $perencanaan->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('perencanaan.index')->with('status', "Kebutuhan {$perencanaan->nama_kebutuhan} diperbarui.");
    })->name('perencanaan.update');

    Route::delete('pengelolaan/perencanaan/{perencanaan}', function (Request $request, Perencanaan $perencanaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($perencanaan->status !== 'draft', 403, 'Hanya draft yang dapat dihapus.');

        if (Pengadaan::where('perencanaan_id', $perencanaan->id)->exists()) {
            return redirect()->route('perencanaan.index')->with(
                'error',
                "Kebutuhan {$perencanaan->nama_kebutuhan} sudah dipakai pengadaan."
            );
        }

        $nama = $perencanaan->nama_kebutuhan;
        $id = $perencanaan->id;
        $perencanaan->riwayat()->delete();
        $perencanaan->delete();

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'hapus',
            'description' => "Menghapus usulan kebutuhan {$nama}.",
            'module' => 'perencanaan',
            'reference_type' => 'perencanaan',
            'reference_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('perencanaan.index')->with('status', 'Usulan kebutuhan dihapus.');
    })->name('perencanaan.destroy');

    Route::post('pengelolaan/perencanaan/{perencanaan}/ajukan', function (Request $request, Perencanaan $perencanaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($perencanaan->status !== 'draft', 403, 'Hanya draft yang dapat diajukan.');

        $perencanaan->update(['status' => 'diajukan']);

        RiwayatPerencanaan::create([
            'perencanaan_id' => $perencanaan->id,
            'user_id' => Auth::id(),
            'status' => 'diajukan',
            'catatan' => 'Usulan dikirim untuk diproses.',
        ]);

        RiwayatAktivitas::create([
            'user_id' => Auth::id(),
            'activity' => 'ajukan',
            'description' => "Mengajukan usulan kebutuhan {$perencanaan->nama_kebutuhan}.",
            'module' => 'perencanaan',
            'reference_type' => 'perencanaan',
            'reference_id' => $perencanaan->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('perencanaan.index')->with('status', "Kebutuhan {$perencanaan->nama_kebutuhan} diajukan.");
    })->name('perencanaan.ajukan');

    Route::get('pengelolaan/perencanaan/ekspor', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $baris = Perencanaan::with(['kategori', 'satuan', 'prioritas', 'periode', 'user'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w->where('nama_kebutuhan', 'like', $cari)->orWhere('alasan', 'like', $cari));
            })
            ->when($request->filled('kategori'), fn ($q) => $q->where('kategori_barang_id', $request->input('kategori')))
            ->when($request->filled('periode'), fn ($q) => $q->where('periode_id', $request->input('periode')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Kode', 'Kebutuhan', 'Kategori', 'Jumlah', 'Satuan', 'Prioritas', 'Periode', 'Status', 'Pengusul']);

            foreach ($baris as $row) {
                fputcsv($out, [
                    'PRN-'.$row->created_at->format('Y').'-'.str_pad($row->id, 3, '0', STR_PAD_LEFT),
                    $row->nama_kebutuhan,
                    $row->kategori?->name,
                    $row->jumlah,
                    $row->satuan?->name,
                    $row->prioritas?->name,
                    $row->periode?->name,
                    $row->status,
                    $row->user?->name,
                ]);
            }

            fclose($out);
        }, 'perencanaan-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('perencanaan.ekspor');

    Route::get('pengelolaan/pengadaan', function (Request $request) use ($shell, $hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $tab = $request->input('tab', 'semua');
        $tabStatus = [
            'draft' => ['draft'],
            'menunggu' => ['diajukan', 'menunggu_persetujuan'],
            'diproses' => ['disetujui', 'diproses'],
            'selesai' => ['selesai'],
            'ditolak' => ['ditolak'],
        ];

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $data = Pengadaan::with(['jenis', 'user', 'detail.satuan'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w
                    ->where('nomor_pengadaan', 'like', $cari)
                    ->orWhere('alasan', 'like', $cari)
                    ->orWhereHas('detail', fn ($d) => $d->where('nama_barang', 'like', $cari))
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $cari)));
            })
            ->when($request->filled('jenis'), fn ($q) => $q->where('jenis_pengadaan_id', $request->input('jenis')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when(isset($tabStatus[$tab]), fn ($q) => $q->whereIn('status', $tabStatus[$tab]))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $totalEstimasi = (int) DetailPengadaan::join('pengadaan', 'pengadaan.id', '=', 'detail_pengadaan.pengadaan_id')
            ->selectRaw('COALESCE(SUM(detail_pengadaan.subtotal), 0) as total')
            ->value('total');

        return Inertia::render('pengelola/pengadaan/index', [
            ...$shell('pengadaan'),
            'data' => $data,
            'tab' => array_key_exists($tab, $tabStatus) ? $tab : 'semua',
            'countSemua' => Pengadaan::count(),
            'countDraft' => Pengadaan::where('status', 'draft')->count(),
            'countMenunggu' => Pengadaan::whereIn('status', ['diajukan', 'menunggu_persetujuan'])->count(),
            'countDiproses' => Pengadaan::whereIn('status', ['disetujui', 'diproses'])->count(),
            'countSelesai' => Pengadaan::where('status', 'selesai')->count(),
            'countDitolak' => Pengadaan::where('status', 'ditolak')->count(),
            'totalEstimasi' => $totalEstimasi,
            'jeniss' => JenisPengadaan::orderBy('name')->get(),
        ]);
    })->name('pengadaan.index');

    Route::get('pengelolaan/pengadaan/create', function () use ($shell, $hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        return Inertia::render('pengelola/pengadaan/create', [
            ...$shell('pengadaan'),
            'jeniss' => JenisPengadaan::orderBy('name')->get(),
            'satuans' => Satuan::orderBy('name')->get(),
            'kategoris' => KategoriBarang::orderBy('name')->get(),
            'perencanaans' => Perencanaan::with('prioritas')->latest()->take(50)->get(),
        ]);
    })->name('pengadaan.create');

    Route::post('pengelolaan/pengadaan', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $data = $request->validate([
            'nama_pengajuan' => ['nullable', 'string', 'max:150'],
            'jenis_pengadaan_id' => ['required', 'exists:jenis_pengadaan,id'],
            'perencanaan_id' => ['nullable', 'exists:perencanaan,id'],
            'tanggal_pengajuan' => ['required', 'date'],
            'alasan' => ['nullable', 'string'],
            'aksi' => ['required', 'in:draft,kirim'],
            'detail' => ['required', 'array', 'min:1'],
            'detail.*.nama_barang' => ['required', 'string', 'max:150'],
            'detail.*.spesifikasi' => ['nullable', 'string'],
            'detail.*.jumlah' => ['required', 'integer', 'min:1'],
            'detail.*.satuan_id' => ['required', 'exists:satuan,id'],
            'detail.*.estimasi_harga' => ['required', 'numeric', 'min:0'],
            'detail.*.kategori_barang_id' => ['nullable', 'exists:kategori_barang,id'],
            'dokumen' => ['nullable', 'array'],
            'dokumen.*' => ['file', 'mimes:pdf,jpg,jpeg,png,xls,xlsx,doc,docx', 'max:10240'],
        ]);

        $status = $data['aksi'] === 'kirim' ? 'menunggu_persetujuan' : 'draft';
        $alasan = trim(($data['nama_pengajuan'] ?? '').($data['nama_pengajuan'] && ($data['alasan'] ?? null) ? "\n\n" : '').($data['alasan'] ?? ''));

        $pengadaan = Pengadaan::create([
            'nomor_pengadaan' => 'PGD-'.now()->format('Y').'-'.str_pad((int) Pengadaan::max('id') + 1, 3, '0', STR_PAD_LEFT),
            'perencanaan_id' => $data['perencanaan_id'] ?? null,
            'jenis_pengadaan_id' => $data['jenis_pengadaan_id'],
            'user_id' => Auth::id(),
            'tanggal_pengajuan' => $data['tanggal_pengajuan'],
            'alasan' => $alasan !== '' ? $alasan : null,
            'status' => $status,
        ]);

        foreach ($data['detail'] as $item) {
            DetailPengadaan::create([
                'pengadaan_id' => $pengadaan->id,
                'kategori_barang_id' => $item['kategori_barang_id'] ?? KategoriBarang::orderBy('id')->value('id'),
                'satuan_id' => $item['satuan_id'],
                'nama_barang' => $item['nama_barang'],
                'spesifikasi' => $item['spesifikasi'] ?? null,
                'jumlah' => $item['jumlah'],
                'estimasi_harga' => $item['estimasi_harga'],
                'subtotal' => $item['jumlah'] * $item['estimasi_harga'],
            ]);
        }

        foreach ($request->file('dokumen', []) as $file) {
            $path = $file->store('dokumen/pengadaan', 'public');
            DokumenPengadaan::create([
                'pengadaan_id' => $pengadaan->id,
                'user_id' => Auth::id(),
                'nama_dokumen' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $file->getSize(),
            ]);
        }

        RiwayatPengadaan::create([
            'pengadaan_id' => $pengadaan->id,
            'user_id' => Auth::id(),
            'status' => $status,
            'catatan' => $status === 'draft' ? 'Pengajuan disimpan sebagai draft.' : 'Pengajuan dikirim, menunggu persetujuan.',
        ]);

        return redirect()->route('pengadaan.index')->with(
            'status',
            $status === 'draft'
                ? "Pengajuan {$pengadaan->nomor_pengadaan} disimpan sebagai draft."
                : "Pengajuan {$pengadaan->nomor_pengadaan} dikirim, menunggu persetujuan."
        );
    })->name('pengadaan.store');

    Route::delete('pengelolaan/pengadaan/{pengadaan}', function (Pengadaan $pengadaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pengadaan->status !== 'draft', 403, 'Hanya draft yang dapat dihapus.');

        foreach ($pengadaan->dokumen as $dok) {
            Storage::disk('public')->delete($dok->file_path);
            $dok->delete();
        }
        $pengadaan->detail()->delete();
        $pengadaan->riwayat()->delete();
        $pengadaan->delete();

        return redirect()->route('pengadaan.index')->with('status', 'Draft pengajuan dihapus.');
    })->name('pengadaan.destroy');

    Route::post('pengelolaan/pengadaan/{pengadaan}/kirim', function (Pengadaan $pengadaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pengadaan->status !== 'draft', 403, 'Hanya draft yang dapat dikirim.');

        $pengadaan->update(['status' => 'menunggu_persetujuan']);

        RiwayatPengadaan::create([
            'pengadaan_id' => $pengadaan->id,
            'user_id' => Auth::id(),
            'status' => 'menunggu_persetujuan',
            'catatan' => 'Draft dikirim, menunggu persetujuan.',
        ]);

        return redirect()->route('pengadaan.index')->with('status', "Pengajuan {$pengadaan->nomor_pengadaan} dikirim.");
    })->name('pengadaan.kirim');

    Route::get('pengelolaan/pengadaan/{pengadaan}/rincian', function (Pengadaan $pengadaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $pengadaan->load(['jenis', 'user', 'perencanaan', 'detail.satuan', 'dokumen', 'riwayat.user', 'persetujuan.pimpinan']);

        return response()->json([
            'nomor' => $pengadaan->nomor_pengadaan,
            'tanggal' => $pengadaan->tanggal_pengajuan?->locale('id')->translatedFormat('d M Y'),
            'status' => $pengadaan->status,
            'pengaju' => $pengadaan->user?->name,
            'alasan' => $pengadaan->alasan,
            'total' => $pengadaan->detail->sum('subtotal'),
            'detail' => $pengadaan->detail->map(fn ($d) => [
                'nama' => $d->nama_barang,
                'spesifikasi' => $d->spesifikasi,
                'jumlah' => $d->jumlah,
                'satuan' => $d->satuan?->name,
                'harga' => $d->estimasi_harga,
                'subtotal' => $d->subtotal,
            ]),
            'dokumen' => $pengadaan->dokumen->map(fn ($d) => [
                'nama' => $d->nama_dokumen,
                'url' => asset('storage/'.$d->file_path),
            ]),
            'riwayat' => $pengadaan->riwayat->map(fn ($r) => [
                'status' => $r->status,
                'catatan' => $r->catatan,
                'oleh' => $r->user?->name,
                'waktu' => $r->created_at?->locale('id')->translatedFormat('d M Y, H:i'),
            ]),
            'persetujuan' => $pengadaan->persetujuan ? [
                'status' => $pengadaan->persetujuan->status,
                'oleh' => $pengadaan->persetujuan->pimpinan?->name,
                'catatan' => $pengadaan->persetujuan->catatan,
            ] : null,
        ]);
    })->name('pengadaan.rincian');

    Route::get('pengelolaan/pengadaan/{pengadaan}/ekspor-rincian', function (Pengadaan $pengadaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $pengadaan->load(['detail.satuan']);

        return response()->streamDownload(function () use ($pengadaan) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Nomor', $pengadaan->nomor_pengadaan]);
            fputcsv($out, ['Tanggal', $pengadaan->tanggal_pengajuan?->format('Y-m-d')]);
            fputcsv($out, ['Status', $pengadaan->status]);
            fputcsv($out, []);
            fputcsv($out, ['Nama Barang', 'Spesifikasi', 'Jumlah', 'Satuan', 'Harga (Rp)', 'Subtotal (Rp)']);

            foreach ($pengadaan->detail as $d) {
                fputcsv($out, [$d->nama_barang, $d->spesifikasi, $d->jumlah, $d->satuan?->name, $d->estimasi_harga, $d->subtotal]);
            }

            fclose($out);
        }, "rincian-{$pengadaan->nomor_pengadaan}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('pengadaan.ekspor-rincian');

    Route::get('pengelolaan/pengadaan/ekspor', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $baris = Pengadaan::with(['jenis', 'user', 'detail'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w->where('nomor_pengadaan', 'like', $cari)->orWhere('alasan', 'like', $cari));
            })
            ->when($request->filled('jenis'), fn ($q) => $q->where('jenis_pengadaan_id', $request->input('jenis')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Nomor', 'Tanggal', 'Jenis', 'Paket', 'Estimasi (Rp)', 'Status', 'Pengaju']);

            foreach ($baris as $p) {
                fputcsv($out, [
                    $p->nomor_pengadaan,
                    $p->tanggal_pengajuan?->format('Y-m-d'),
                    $p->jenis?->name,
                    $p->detail->first()?->nama_barang,
                    $p->detail->sum('subtotal'),
                    $p->status,
                    $p->user?->name,
                ]);
            }

            fclose($out);
        }, 'pengadaan-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('pengadaan.ekspor');

    Route::get('pengelolaan/inventarisasi', function (Request $request) use ($shell, $hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $data = Barang::with(['kategori', 'lokasi', 'kondisi', 'status'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w
                    ->where('kode_barang', 'like', $cari)
                    ->orWhere('nama_barang', 'like', $cari)
                    ->orWhere('merk', 'like', $cari));
            })
            ->when($request->filled('kategori'), fn ($q) => $q->where('kategori_barang_id', $request->input('kategori')))
            ->when($request->filled('lokasi'), fn ($q) => $q->where('lokasi_id', $request->input('lokasi')))
            ->when($request->filled('kondisi'), fn ($q) => $q->whereHas('kondisi', fn ($k) => $k->where('name', $request->input('kondisi'))))
            ->when($request->filled('status'), fn ($q) => $q->whereHas('status', fn ($s) => $s->where('name', $request->input('status'))))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $totalUnit = (int) Barang::sum('jumlah');
        $baik = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Baik'))->sum('jumlah');
        $ringan = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Ringan'))->sum('jumlah');
        $berat = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Berat'))->sum('jumlah');
        $jumlahKategori = Barang::distinct('kategori_barang_id')->count('kategori_barang_id');

        return Inertia::render('pengelola/inventarisasi/index', [
            ...$shell('inventarisasi'),
            'data' => $data,
            'totalUnit' => $totalUnit,
            'baik' => $baik,
            'ringan' => $ringan,
            'berat' => $berat,
            'jumlahKategori' => $jumlahKategori,
            'kategoris' => KategoriBarang::orderBy('name')->get(),
            'lokasis' => Lokasi::orderBy('name')->get(),
            'satuans' => Satuan::orderBy('name')->get(),
            'kondisis' => KondisiBarang::orderBy('id')->get(),
            'statuss' => StatusBarang::orderBy('id')->get(),
        ]);
    })->name('inventarisasi.index');

    Route::post('pengelolaan/inventarisasi', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $data = $request->validate([
            'nama_barang' => ['required', 'string', 'max:150'],
            'merk' => ['nullable', 'string', 'max:100'],
            'kategori_barang_id' => ['required', 'exists:kategori_barang,id'],
            'lokasi_id' => ['required', 'exists:lokasi,id'],
            'kondisi_barang_id' => ['required', 'exists:kondisi_barang,id'],
            'status_barang_id' => ['required', 'exists:status_barang,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'satuan_id' => ['required', 'exists:satuan,id'],
            'tahun_perolehan' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'sumber_perolehan' => ['nullable', 'string', 'max:100'],
            'harga_perolehan' => ['nullable', 'numeric', 'min:0'],
            'spesifikasi' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('barang', 'public');
        }

        $data['kode_barang'] = 'BRG-'.str_pad((int) Barang::max('id') + 1, 4, '0', STR_PAD_LEFT);

        $barang = Barang::create($data);

        RiwayatBarang::create([
            'barang_id' => $barang->id,
            'user_id' => Auth::id(),
            'kondisi_barang_id' => $barang->kondisi_barang_id,
            'status_barang_id' => $barang->status_barang_id,
            'lokasi_id' => $barang->lokasi_id,
            'catatan' => 'Barang dicatat ke inventaris.',
        ]);

        return redirect()->route('inventarisasi.index')->with('status', "Barang {$barang->kode_barang} dicatat.");
    })->name('inventarisasi.store');

    Route::put('pengelolaan/inventarisasi/{barang}', function (Request $request, Barang $barang) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $data = $request->validate([
            'nama_barang' => ['required', 'string', 'max:150'],
            'merk' => ['nullable', 'string', 'max:100'],
            'kategori_barang_id' => ['required', 'exists:kategori_barang,id'],
            'lokasi_id' => ['required', 'exists:lokasi,id'],
            'kondisi_barang_id' => ['required', 'exists:kondisi_barang,id'],
            'status_barang_id' => ['required', 'exists:status_barang,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'satuan_id' => ['required', 'exists:satuan,id'],
            'tahun_perolehan' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'sumber_perolehan' => ['nullable', 'string', 'max:100'],
            'harga_perolehan' => ['nullable', 'numeric', 'min:0'],
            'spesifikasi' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('foto')) {
            if ($barang->foto) {
                Storage::disk('public')->delete($barang->foto);
            }
            $data['foto'] = $request->file('foto')->store('barang', 'public');
        }

        $berubah = [];
        foreach (['lokasi_id' => 'lokasi', 'kondisi_barang_id' => 'kondisi', 'status_barang_id' => 'status'] as $kolom => $label) {
            if ((int) $barang->{$kolom} !== (int) $data[$kolom]) {
                $berubah[] = $label;
            }
        }

        $barang->update($data);

        if ($berubah !== []) {
            RiwayatBarang::create([
                'barang_id' => $barang->id,
                'user_id' => Auth::id(),
                'kondisi_barang_id' => $barang->kondisi_barang_id,
                'status_barang_id' => $barang->status_barang_id,
                'lokasi_id' => $barang->lokasi_id,
                'catatan' => 'Perubahan: '.implode(', ', $berubah).'.',
            ]);
        }

        return redirect()->route('inventarisasi.index')->with('status', "Barang {$barang->kode_barang} diperbarui.");
    })->name('inventarisasi.update');

    Route::delete('pengelolaan/inventarisasi/{barang}', function (Barang $barang) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        if (Pemeliharaan::where('barang_id', $barang->id)->exists()) {
            return redirect()->route('inventarisasi.index')->with(
                'error',
                "Barang {$barang->kode_barang} memiliki riwayat pemeliharaan."
            );
        }

        if ($barang->foto) {
            Storage::disk('public')->delete($barang->foto);
        }

        $barang->delete();

        return redirect()->route('inventarisasi.index')->with('status', 'Data barang dihapus.');
    })->name('inventarisasi.destroy');

    Route::get('pengelolaan/inventarisasi/ekspor', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $baris = Barang::with(['kategori', 'lokasi', 'kondisi', 'status', 'satuan'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w
                    ->where('kode_barang', 'like', $cari)
                    ->orWhere('nama_barang', 'like', $cari)
                    ->orWhere('merk', 'like', $cari));
            })
            ->when($request->filled('kategori'), fn ($q) => $q->where('kategori_barang_id', $request->input('kategori')))
            ->when($request->filled('lokasi'), fn ($q) => $q->where('lokasi_id', $request->input('lokasi')))
            ->when($request->filled('kondisi'), fn ($q) => $q->whereHas('kondisi', fn ($k) => $k->where('name', $request->input('kondisi'))))
            ->when($request->filled('status'), fn ($q) => $q->whereHas('status', fn ($s) => $s->where('name', $request->input('status'))))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Kode', 'Nama', 'Merk', 'Kategori', 'Lokasi', 'Kondisi', 'Status', 'Jumlah', 'Harga (Rp)']);

            foreach ($baris as $b) {
                fputcsv($out, [
                    $b->kode_barang, $b->nama_barang, $b->merk,
                    $b->kategori?->name, $b->lokasi?->name,
                    $b->kondisi?->name, $b->status?->name,
                    $b->jumlah, $b->harga_perolehan,
                ]);
            }

            fclose($out);
        }, 'inventaris-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('inventarisasi.ekspor');

    Route::get('pengelolaan/pemeliharaan', function (Request $request) use ($shell, $hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $data = Pemeliharaan::with(['barang.lokasi', 'jenis', 'prioritas', 'user'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w
                    ->where('masalah', 'like', $cari)
                    ->orWhere('pelaksana', 'like', $cari)
                    ->orWhereHas('barang', fn ($b) => $b
                        ->where('kode_barang', 'like', $cari)
                        ->orWhere('nama_barang', 'like', $cari)));
            })
            ->when($request->filled('jenis'), fn ($q) => $q->where('jenis_pemeliharaan_id', $request->input('jenis')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('prioritas'), fn ($q) => $q->whereHas('prioritas', fn ($p) => $p->where('name', $request->input('prioritas'))))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('pengelola/pemeliharaan/index', [
            ...$shell('pemeliharaan'),
            'data' => $data,
            'totalTiket' => Pemeliharaan::count(),
            'totalEstimasi' => (int) Pemeliharaan::sum('estimasi_biaya'),
            'diajukan' => Pemeliharaan::where('status', 'diajukan')->count(),
            'dalamProses' => Pemeliharaan::where('status', 'dalam_pemeliharaan')->count(),
            'selesaiBulanIni' => Pemeliharaan::where('status', 'selesai')->whereMonth('updated_at', now()->month)->whereYear('updated_at', now()->year)->count(),
            'jeniss' => JenisPemeliharaan::orderBy('name')->get(),
        ]);
    })->name('pemeliharaan.index');

    Route::post('pengelolaan/pemeliharaan', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $data = $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'jenis_pemeliharaan_id' => ['required', 'exists:jenis_pemeliharaan,id'],
            'prioritas' => ['required', 'in:Rendah,Sedang,Tinggi'],
            'kerusakan' => ['required', 'string'],
            'estimasi_biaya' => ['nullable', 'numeric', 'min:0'],
            'pelaksana' => ['nullable', 'string', 'max:150'],
            'foto' => ['nullable', 'array'],
            'foto.*' => ['image', 'max:5120'],
        ]);

        $tiket = Pemeliharaan::create([
            'barang_id' => $data['barang_id'],
            'jenis_pemeliharaan_id' => $data['jenis_pemeliharaan_id'],
            'prioritas_id' => Prioritas::where('name', $data['prioritas'])->value('id'),
            'user_id' => Auth::id(),
            'nomor_pemeliharaan' => 'MNT-'.now()->format('Y').'-'.str_pad((int) Pemeliharaan::max('id') + 1, 3, '0', STR_PAD_LEFT),
            'tanggal_pengajuan' => now()->toDateString(),
            'masalah' => $data['kerusakan'],
            'estimasi_biaya' => $data['estimasi_biaya'] ?? 0,
            'status' => 'diajukan',
        ]);

        foreach ($request->file('foto', []) as $file) {
            $tiket->dokumen()->create([
                'pemeliharaan_id' => $tiket->id,
                'user_id' => Auth::id(),
                'nama_dokumen' => $file->getClientOriginalName(),
                'file_path' => $file->store('dokumen/pemeliharaan', 'public'),
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $file->getSize(),
                'tahap' => 'sebelum',
            ]);
        }

        RiwayatPemeliharaan::create([
            'pemeliharaan_id' => $tiket->id,
            'user_id' => Auth::id(),
            'tanggal' => now()->toDateString(),
            'masalah' => $data['kerusakan'],
            'pelaksana' => $data['pelaksana'] ?? null,
            'status' => 'diajukan',
            'catatan' => 'Tiket pemeliharaan dibuat.',
        ]);

        return redirect()->route('pemeliharaan.index')->with('status', "Tiket {$tiket->nomor_pemeliharaan} dibuat.");
    })->name('pemeliharaan.store');

    Route::put('pengelolaan/pemeliharaan/{pemeliharaan}', function (Request $request, Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pemeliharaan->status === 'selesai', 403, 'Tiket selesai tidak dapat diubah.');

        $data = $request->validate([
            'jenis_pemeliharaan_id' => ['required', 'exists:jenis_pemeliharaan,id'],
            'prioritas' => ['required', 'in:Rendah,Sedang,Tinggi'],
            'kerusakan' => ['required', 'string'],
            'estimasi_biaya' => ['nullable', 'numeric', 'min:0'],
        ]);

        $pemeliharaan->update([
            'jenis_pemeliharaan_id' => $data['jenis_pemeliharaan_id'],
            'prioritas_id' => Prioritas::where('name', $data['prioritas'])->value('id') ?? $pemeliharaan->prioritas_id,
            'masalah' => $data['kerusakan'],
            'estimasi_biaya' => $data['estimasi_biaya'] ?? 0,
        ]);

        return redirect()->route('pemeliharaan.index')->with('status', "Tiket {$pemeliharaan->nomor_pemeliharaan} diperbarui.");
    })->name('pemeliharaan.update');

    Route::delete('pengelolaan/pemeliharaan/{pemeliharaan}', function (Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pemeliharaan->status !== 'diajukan', 403, 'Hanya tiket diajukan yang dapat dihapus.');

        foreach ($pemeliharaan->dokumen as $dok) {
            Storage::disk('public')->delete($dok->file_path);
            $dok->delete();
        }
        $pemeliharaan->riwayat()->delete();
        $pemeliharaan->delete();

        return redirect()->route('pemeliharaan.index')->with('status', 'Tiket pemeliharaan dihapus.');
    })->name('pemeliharaan.destroy');

    Route::post('pengelolaan/pemeliharaan/{pemeliharaan}/proses', function (Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pemeliharaan->status !== 'diajukan', 403);

        $pemeliharaan->update(['status' => 'dalam_pemeliharaan']);

        RiwayatPemeliharaan::create([
            'pemeliharaan_id' => $pemeliharaan->id,
            'user_id' => Auth::id(),
            'tanggal' => now()->toDateString(),
            'status' => 'dalam_pemeliharaan',
            'catatan' => 'Pengerjaan dimulai teknisi.',
        ]);

        return redirect()->route('pemeliharaan.index')->with('status', "Tiket {$pemeliharaan->nomor_pemeliharaan} diproses.");
    })->name('pemeliharaan.proses');

    Route::post('pengelolaan/pemeliharaan/{pemeliharaan}/selesai', function (Request $request, Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if(! in_array($pemeliharaan->status, ['diajukan', 'dalam_pemeliharaan'], true), 403);

        $data = $request->validate([
            'tindakan' => ['required', 'string'],
            'biaya_aktual' => ['nullable', 'numeric', 'min:0'],
            'pelaksana' => ['nullable', 'string', 'max:150'],
            'foto_sesudah' => ['nullable', 'array'],
            'foto_sesudah.*' => ['image', 'max:5120'],
        ]);

        $pemeliharaan->update(['status' => 'selesai']);

        foreach ($request->file('foto_sesudah', []) as $file) {
            $pemeliharaan->dokumen()->create([
                'pemeliharaan_id' => $pemeliharaan->id,
                'user_id' => Auth::id(),
                'nama_dokumen' => $file->getClientOriginalName(),
                'file_path' => $file->store('dokumen/pemeliharaan', 'public'),
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $file->getSize(),
                'tahap' => 'sesudah',
            ]);
        }

        RiwayatPemeliharaan::create([
            'pemeliharaan_id' => $pemeliharaan->id,
            'user_id' => Auth::id(),
            'tanggal' => now()->toDateString(),
            'masalah' => $pemeliharaan->masalah,
            'tindakan' => $data['tindakan'],
            'biaya' => $data['biaya_aktual'] ?? null,
            'pelaksana' => $data['pelaksana'] ?? null,
            'status' => 'selesai',
            'catatan' => 'Pekerjaan selesai, aset siap digunakan.',
        ]);

        return redirect()->route('pemeliharaan.index')->with('status', "Tiket {$pemeliharaan->nomor_pemeliharaan} selesai.");
    })->name('pemeliharaan.selesai');

    Route::post('pengelolaan/pemeliharaan/{pemeliharaan}/tolak', function (Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');
        abort_if($pemeliharaan->status !== 'diajukan', 403);

        $pemeliharaan->update(['status' => 'ditolak']);

        RiwayatPemeliharaan::create([
            'pemeliharaan_id' => $pemeliharaan->id,
            'user_id' => Auth::id(),
            'tanggal' => now()->toDateString(),
            'status' => 'ditolak',
            'catatan' => 'Pengajuan tidak dilanjutkan.',
        ]);

        return redirect()->route('pemeliharaan.index')->with('status', "Tiket {$pemeliharaan->nomor_pemeliharaan} ditolak.");
    })->name('pemeliharaan.tolak');

    Route::get('pengelolaan/pemeliharaan/{pemeliharaan}/rincian', function (Pemeliharaan $pemeliharaan) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $pemeliharaan->load(['barang.lokasi', 'jenis', 'prioritas', 'user', 'dokumen', 'riwayat.user']);

        return response()->json([
            'nomor' => $pemeliharaan->nomor_pemeliharaan,
            'tanggal' => $pemeliharaan->tanggal_pengajuan?->locale('id')->translatedFormat('d M Y'),
            'status' => $pemeliharaan->status,
            'barang' => $pemeliharaan->barang?->nama_barang,
            'kode' => $pemeliharaan->barang?->kode_barang,
            'lokasi' => $pemeliharaan->barang?->lokasi?->name,
            'jenis' => $pemeliharaan->jenis?->name,
            'prioritas' => $pemeliharaan->prioritas?->name,
            'masalah' => $pemeliharaan->masalah,
            'estimasi' => $pemeliharaan->estimasi_biaya,
            'pengaju' => $pemeliharaan->user?->name,
            'dokumen' => $pemeliharaan->dokumen->map(fn ($d) => [
                'nama' => $d->nama_dokumen,
                'tahap' => $d->tahap,
                'url' => asset('storage/'.$d->file_path),
            ]),
            'riwayat' => $pemeliharaan->riwayat->map(fn ($r) => [
                'status' => $r->status,
                'tanggal' => $r->tanggal?->locale('id')->translatedFormat('d M Y'),
                'tindakan' => $r->tindakan,
                'biaya' => $r->biaya,
                'pelaksana' => $r->pelaksana,
                'catatan' => $r->catatan,
                'oleh' => $r->user?->name,
            ]),
        ]);
    })->name('pemeliharaan.rincian');

    Route::get('pengelolaan/pemeliharaan/ekspor', function (Request $request) use ($hanya) {
        $hanya('Pengelola Sarana & Prasarana');

        $baris = Pemeliharaan::with(['barang', 'jenis', 'prioritas', 'user'])
            ->when($request->filled('cari'), function ($q) use ($request) {
                $cari = '%'.str_replace(['%', '_'], '', (string) $request->input('cari')).'%';
                $q->where(fn ($w) => $w
                    ->where('masalah', 'like', $cari)
                    ->orWhere('pelaksana', 'like', $cari)
                    ->orWhereHas('barang', fn ($b) => $b
                        ->where('kode_barang', 'like', $cari)
                        ->orWhere('nama_barang', 'like', $cari)));
            })
            ->when($request->filled('jenis'), fn ($q) => $q->where('jenis_pemeliharaan_id', $request->input('jenis')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('prioritas'), fn ($q) => $q->whereHas('prioritas', fn ($p) => $p->where('name', $request->input('prioritas'))))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Nomor', 'Tanggal', 'Barang', 'Jenis', 'Masalah', 'Estimasi (Rp)', 'Status', 'Pengaju']);

            foreach ($baris as $t) {
                fputcsv($out, [
                    $t->nomor_pemeliharaan,
                    $t->tanggal_pengajuan?->format('Y-m-d'),
                    $t->barang?->nama_barang,
                    $t->jenis?->name,
                    $t->masalah,
                    $t->estimasi_biaya,
                    $t->status,
                    $t->user?->name,
                ]);
            }

            fclose($out);
        }, 'pemeliharaan-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('pemeliharaan.ekspor');

    // ---- Pimpinan ----
    Route::get('pimpinan/persetujuan', function (Request $request) use ($shell, $hanya) {
        $hanya('Pimpinan');

        $data = Pengadaan::with(['user.role', 'detail', 'perencanaan.prioritas', 'persetujuan'])
            ->whereIn('status', ['diajukan', 'menunggu_persetujuan'])
            ->when($request->filled('prioritas'), function ($q) use ($request) {
                $q->whereHas('perencanaan.prioritas', fn ($p) => $p->where('name', $request->input('prioritas')));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $totalEstimasi = (int) DetailPengadaan::join('pengadaan', 'pengadaan.id', '=', 'detail_pengadaan.pengadaan_id')
            ->whereIn('pengadaan.status', ['diajukan', 'menunggu_persetujuan'])
            ->selectRaw('COALESCE(SUM(detail_pengadaan.subtotal), 0) as total')
            ->value('total');

        return Inertia::render('pimpinan/persetujuan/index', [
            ...$shell('persetujuan'),
            'data' => $data,
            'menunggu' => Pengadaan::whereIn('status', ['diajukan', 'menunggu_persetujuan'])->count(),
            'disetujuiBulanIni' => Pengadaan::where('status', 'disetujui')->whereMonth('updated_at', now()->month)->whereYear('updated_at', now()->year)->count(),
            'ditolak' => Pengadaan::where('status', 'ditolak')->count(),
            'totalEstimasi' => $totalEstimasi,
        ]);
    })->name('persetujuan.index');

    Route::get('pimpinan/monitoring', function () use ($shell, $hanya) {
        $hanya('Pimpinan');

        $totalUnit = (int) Barang::sum('jumlah');
        $baik = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Baik'))->sum('jumlah');
        $ringan = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Ringan'))->sum('jumlah');
        $berat = (int) Barang::whereHas('kondisi', fn ($q) => $q->where('name', 'Rusak Berat'))->sum('jumlah');
        $valuasi = (int) Barang::selectRaw('COALESCE(SUM(harga_perolehan * jumlah), 0) as total')->value('total');

        $perKategori = KategoriBarang::withSum(['barangs as total_unit' => fn ($q) => $q->select(DB::raw('COALESCE(SUM(jumlah), 0)'))], 'jumlah')
            ->orderBy('name')
            ->get();

        return Inertia::render('pimpinan/monitoring/index', [
            ...$shell('monitoring'),
            'totalUnit' => $totalUnit,
            'baik' => $baik,
            'ringan' => $ringan,
            'berat' => $berat,
            'valuasi' => $valuasi,
            'perKategori' => $perKategori,
        ]);
    })->name('monitoring.index');

    $jenisLaporan = [
        'inventaris' => ['label' => 'Laporan Inventaris', 'ikon' => 'inventory_2', 'desc' => 'Rekap buku induk barang, kode aset & penempatan'],
        'pengadaan' => ['label' => 'Laporan Pengadaan', 'ikon' => 'shopping_bag', 'desc' => 'Realisasi paket, estimasi & status pengadaan'],
        'kebutuhan' => ['label' => 'Laporan Kebutuhan', 'ikon' => 'assignment', 'desc' => 'Rencana usulan prioritas sarpras tahunan (RKBM)'],
        'pemeliharaan' => ['label' => 'Laporan Pemeliharaan', 'ikon' => 'build_circle', 'desc' => 'Riwayat servis, kendala teknis & rincian biaya'],
        'kondisi' => ['label' => 'Laporan Kondisi Aset', 'ikon' => 'verified', 'desc' => 'Kelayakan operasional: Baik, Rusak Ringan/Berat'],
    ];

    $queryLaporan = function (Request $request, string $jenis) {
        $q = match ($jenis) {
            'pengadaan' => Pengadaan::with(['detail', 'jenis', 'user']),
            'kebutuhan' => Perencanaan::with(['kategori', 'periode', 'prioritas', 'user']),
            'pemeliharaan' => Pemeliharaan::with(['barang.lokasi', 'jenis', 'user']),
            default => Barang::with(['kategori', 'lokasi', 'kondisi', 'status']),
        };

        $bersih = fn ($v) => '%'.str_replace(['%', '_'], '', (string) $v).'%';

        if ($request->filled('dari')) {
            $q->whereDate('created_at', '>=', $request->input('dari'));
        }
        if ($request->filled('sampai')) {
            $q->whereDate('created_at', '<=', $request->input('sampai'));
        }

        if ($request->filled('cari')) {
            $cari = $bersih($request->input('cari'));
            match ($jenis) {
                'pengadaan' => $q->where(fn ($w) => $w
                    ->where('nomor_pengadaan', 'like', $cari)
                    ->orWhere('alasan', 'like', $cari)
                    ->orWhereHas('detail', fn ($d) => $d->where('nama_barang', 'like', $cari))),
                'kebutuhan' => $q->where(fn ($w) => $w
                    ->where('nama_kebutuhan', 'like', $cari)
                    ->orWhere('alasan', 'like', $cari)),
                'pemeliharaan' => $q->where(fn ($w) => $w
                    ->where('masalah', 'like', $cari)
                    ->orWhereHas('barang', fn ($b) => $b
                        ->where('kode_barang', 'like', $cari)
                        ->orWhere('nama_barang', 'like', $cari))),
                default => $q->where(fn ($w) => $w
                    ->where('kode_barang', 'like', $cari)
                    ->orWhere('nama_barang', 'like', $cari)),
            };
        }

        if ($request->filled('kategori')) {
            match ($jenis) {
                'pengadaan' => $q->whereHas('detail', fn ($d) => $d->where('kategori_barang_id', $request->input('kategori'))),
                'kebutuhan' => $q->where('kategori_barang_id', $request->input('kategori')),
                default => $q->where('kategori_barang_id', $request->input('kategori')),
            };
        }

        if ($request->filled('lokasi')) {
            $q->when(in_array($jenis, ['inventaris', 'kondisi'], true),
                fn ($w) => $w->where('lokasi_id', $request->input('lokasi')),
                fn ($w) => $w->whereHas('barang', fn ($b) => $b->where('lokasi_id', $request->input('lokasi'))));
        }

        if ($request->filled('kondisi')) {
            $q->when(in_array($jenis, ['inventaris', 'kondisi'], true),
                fn ($w) => $w->whereHas('kondisi', fn ($k) => $k->where('name', $request->input('kondisi'))));
        }

        return $q->latest();
    };

    $barisLaporan = function ($row, string $jenis) {
        $rupiah = fn ($n) => 'Rp '.number_format((int) $n, 0, ',', '.');

        return match ($jenis) {
            'pengadaan' => [
                'kode' => $row->nomor_pengadaan,
                'nama' => ($row->detail->first()?->nama_barang ?? '-').($row->detail->count() > 1 ? ' (+'.($row->detail->count() - 1).' item)' : ''),
                'kategori' => $row->jenis?->name ?? '-',
                'lokasi' => $row->user?->name ?? '-',
                'status' => in_array($row->status, ['disetujui', 'selesai'], true) ? 'Selesai' : 'Diproses',
                'kondisi' => in_array($row->status, ['disetujui', 'selesai'], true) ? 'baik' : 'tindak',
                'nilai' => $rupiah($row->detail->sum('subtotal')),
                'nilaiRaw' => (int) $row->detail->sum('subtotal'),
            ],
            'kebutuhan' => [
                'kode' => 'PRN-'.$row->created_at->format('Y').'-'.str_pad($row->id, 3, '0', STR_PAD_LEFT),
                'nama' => $row->nama_kebutuhan,
                'kategori' => $row->kategori?->name ?? '-',
                'lokasi' => $row->periode?->name ?? '-',
                'status' => $row->status === 'diajukan' ? 'Diajukan' : 'Draft',
                'kondisi' => $row->status === 'diajukan' ? 'tindak' : 'tindak',
                'nilai' => $row->jumlah.' '.($row->satuan?->name ?? ''),
                'nilaiRaw' => 0,
            ],
            'pemeliharaan' => [
                'kode' => $row->nomor_pemeliharaan ?? 'MNT-',
                'nama' => $row->barang?->nama_barang ?? '-',
                'kategori' => $row->jenis?->name ?? '-',
                'lokasi' => $row->barang?->lokasi?->name ?? '-',
                'status' => $row->status === 'selesai' ? 'Selesai' : ucfirst(str_replace('_', ' ', $row->status)),
                'kondisi' => $row->status === 'selesai' ? 'baik' : 'tindak',
                'nilai' => $rupiah($row->estimasi_biaya),
                'nilaiRaw' => (int) $row->estimasi_biaya,
            ],
            default => [
                'kode' => $row->kode_barang,
                'nama' => $row->nama_barang,
                'kategori' => $row->kategori?->name ?? '-',
                'lokasi' => $row->lokasi?->name ?? '-',
                'status' => $row->kondisi?->name ?? '-',
                'kondisi' => ($row->kondisi?->name ?? '') === 'Baik' ? 'baik' : 'tindak',
                'nilai' => $rupiah($row->harga_perolehan),
                'nilaiRaw' => (int) $row->harga_perolehan,
            ],
        };
    };

    Route::get('pimpinan/pelaporan', function (Request $request) use ($shell, $hanya, $jenisLaporan, $queryLaporan, $barisLaporan) {
        $hanya('Pimpinan');

        $jenis = $request->input('jenis', 'inventaris');
        $jenis = array_key_exists($jenis, $jenisLaporan) ? $jenis : 'inventaris';

        $perPage = (int) $request->input('per_halaman', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $semua = $queryLaporan($request, $jenis)->get()->map(fn ($row) => $barisLaporan($row, $jenis));

        $totalNilai = $semua->sum('nilaiRaw');
        $baik = $semua->where('kondisi', 'baik')->count();
        $tindak = $semua->where('kondisi', 'tindak')->count();

        $page = max(1, (int) $request->input('page', 1));
        $data = new LengthAwarePaginator(
            $semua->forPage($page, $perPage)->values(),
            $semua->count(),
            $perPage,
            $page,
            ['path' => route('pelaporan.index'), 'query' => $request->query()]
        );

        return Inertia::render('pimpinan/pelaporan/index', [
            ...$shell('pelaporan'),
            'jenisLaporan' => $jenisLaporan,
            'jenis' => $jenis,
            'data' => $data,
            'totalData' => $semua->count(),
            'totalNilai' => $totalNilai,
            'baik' => $baik,
            'tindak' => $tindak,
            'kategoris' => KategoriBarang::orderBy('name')->get(),
            'lokasis' => Lokasi::orderBy('name')->get(),
        ]);
    })->name('pelaporan.index');

    Route::get('pimpinan/pelaporan/ekspor', function (Request $request) use ($hanya, $jenisLaporan, $queryLaporan, $barisLaporan) {
        $hanya('Pimpinan');

        $jenis = $request->input('jenis', 'inventaris');
        $jenis = array_key_exists($jenis, $jenisLaporan) ? $jenis : 'inventaris';

        $baris = $queryLaporan($request, $jenis)->get()->map(fn ($row) => $barisLaporan($row, $jenis));

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Kode', 'Nama', 'Kategori', 'Lokasi', 'Status', 'Nilai']);

            foreach ($baris as $row) {
                fputcsv($out, [$row['kode'], $row['nama'], $row['kategori'], $row['lokasi'], $row['status'], $row['nilai']]);
            }

            fclose($out);
        }, "laporan-{$jenis}-sarpra-".now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('pelaporan.ekspor');

    Route::get('laporan/barang', function () {
        abort_unless(in_array(Auth::user()->role?->name, ['Pimpinan', 'Pengelola Sarana & Prasarana'], true), 403);

        $baris = Barang::with(['kategori', 'lokasi', 'kondisi', 'status'])->latest()->get();

        return response()->streamDownload(function () use ($baris) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Kode', 'Nama', 'Kategori', 'Lokasi', 'Kondisi', 'Status', 'Jumlah', 'Harga (Rp)']);

            foreach ($baris as $b) {
                fputcsv($out, [
                    $b->kode_barang, $b->nama_barang,
                    $b->kategori?->name, $b->lokasi?->name,
                    $b->kondisi?->name, $b->status?->name,
                    $b->jumlah, $b->harga_perolehan,
                ]);
            }

            fclose($out);
        }, 'inventaris-sarpra-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->name('laporan.barang');
});

require __DIR__.'/settings.php';
