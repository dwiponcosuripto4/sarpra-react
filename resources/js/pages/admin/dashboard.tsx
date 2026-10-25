import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';

type Peran = { id: number; name: string };

type Aktivitas = {
    id: number;
    user_id?: number | null;
    activity: string;
    description: string;
    module?: string | null;
    ip_address?: string | null;
    created_at?: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
        role?: { name: string } | null;
    } | null;
};

type Props = {
    totalAktif: number;
    baruBulanIni: number;
    aktifMingguIni: number;
    roles: Peran[];
    totalMaster: number;
    aktivitas: Paginator<Aktivitas>;
    status?: string;
    error?: string;
};

const labelAktivitas: Record<string, string> = {
    login: 'Autentikasi',
    tambah: 'Tambah Data',
    ubah: 'Ubah Data',
    hapus: 'Hapus Data',
    ajukan: 'Pengajuan',
    setujui: 'Persetujuan',
    tolak: 'Penolakan',
    ubah_status: 'Perubahan Status',
};

const warnaAvatar = ['#022448', '#1e3a5f', '#7c3a08', '#a8324a', '#075e46'];

const bulanId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function fmtWaktu(iso?: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const dua = (n: number) => String(n).padStart(2, '0');
    return `${dua(d.getDate())} ${bulanId[d.getMonth()]} ${d.getFullYear()}, ${dua(d.getHours())}:${dua(d.getMinutes())}:${dua(d.getSeconds())}`;
}

function inisial(nama?: string | null): string {
    if (!nama) return '–';
    const bagian = nama.trim().split(/\s+/).filter(Boolean);
    const huruf = (bagian[0]?.[0] ?? '') + (bagian.length > 1 ? bagian[bagian.length - 1][0] : '');
    return huruf.toUpperCase() || '–';
}

function statusTampilan(activity: string): { label: string; dot: string; kelas: string } {
    if (activity === 'tolak') {
        return { label: 'Gagal / Peringatan', dot: '#ef4444', kelas: 'bg-[#ffdad6] text-[#93000a] border-[#f5b9b6]' };
    }
    if (activity === 'ajukan') {
        return { label: 'Diproses', dot: '#3b82f6', kelas: 'bg-[#eef4fd] text-[#2e5edf] border-[#c8d8f8]' };
    }
    return { label: 'Berhasil', dot: '#34c582', kelas: 'bg-[#e6f7ef] text-[#0d7a52] border-[#b5e6cf]' };
}

export default function Dashboard(props: Props) {
    const status = props.status;
    const error = props.error;
    const { url } = usePage();

    const [cari, setCari] = useState('');
    const pertama = useRef(true);

    // Ganti querystring di URL saat ini dan kunjungi ulang halaman.
    const timpaKueri = (perubahan: Record<string, string | undefined>) => {
        const target = new URL(url, window.location.origin);
        for (const [k, v] of Object.entries(perubahan)) {
            if (v === undefined || v === '') target.searchParams.delete(k);
            else target.searchParams.set(k, v);
        }
        target.searchParams.delete('page');
        router.get(target.pathname + target.search, {}, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        if (pertama.current) {
            pertama.current = false;
            return;
        }
        const t = setTimeout(() => timpaKueri({ cari }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cari]);

    const perHalaman = ambilKueri(url, 'per_halaman') || '6';

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {status && (
                <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: '#e6f7ef', color: '#0d7a52' }}
                >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <p className="text-sm font-medium">{status}</p>
                </div>
            )}
            {error && (
                <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: '#ffdad6', color: '#93000a' }}
                >
                    <span className="material-symbols-outlined text-xl">error</span>
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Judul */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-3 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                            Dashboard Administrator
                        </h1>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span> Sistem Aktif
                        </span>
                    </div>
                    <p className="text-sm text-[#515f74]">
                        Ringkasan metrik pengguna, status sistem, dan log aktivitas operasional SARPRA terkini.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-medium text-[#515f74]">
                        <span className="material-symbols-outlined text-lg text-[#1e3a5f]">calendar_today</span>
                        <span>{usePage().props.tanggalHariIni ?? ''}</span>
                    </div>
                    <button
                        onClick={() => router.reload({ only: ['aktivitas', 'totalAktif', 'baruBulanIni', 'aktifMingguIni', 'totalMaster'] })}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#022448] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        <span>Segarkan Data</span>
                    </button>
                </div>
            </div>

            {/* Kartu metrik */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-sm transition-all hover:border-[#cbd5e1]">
                    <div className="space-y-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                            Total Pengguna Aktif
                        </span>
                        <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-[#0f172a]">{props.totalAktif}</span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                                +{props.baruBulanIni} dari bulan lalu
                            </span>
                        </div>
                        <p className="pt-0.5 text-xs text-[#515f74]">{props.aktifMingguIni} aktif minggu ini</p>
                    </div>
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d5e3fc]/70 text-[#022448] shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">group</span>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-sm transition-all hover:border-[#cbd5e1]">
                    <div className="space-y-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">Total Role</span>
                        <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-[#0f172a]">
                                {props.roles.length} Role
                            </span>
                        </div>
                        <p className="pt-0.5 text-xs text-[#515f74]">
                            {props.roles.map((r) => r.name).join(', ')}
                        </p>
                    </div>
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d5e3fc]/70 text-[#022448] shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">verified_user</span>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-sm transition-all hover:border-[#cbd5e1]">
                    <div className="space-y-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                            Total Data Master
                        </span>
                        <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-[#0f172a]">
                                {props.totalMaster} Data
                            </span>
                        </div>
                        <p className="pt-0.5 text-xs text-[#515f74]">9 entitas • Kategori, Satuan, Lokasi &amp; lainnya</p>
                    </div>
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d5e3fc]/70 text-[#022448] shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">dataset</span>
                    </div>
                </div>
            </div>

            {/* Tabel aktivitas */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] p-5 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a]">Aktivitas Pengguna Terbaru</h2>
                        <p className="mt-0.5 text-xs text-[#515f74]">
                            Catatan riwayat aktivitas pengguna lintas modul SARPRA
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative flex items-center">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-[#515f74]">
                                search
                            </span>
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari pengguna / aksi..."
                                className="h-9 w-60 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-9 pr-3 text-xs text-[#0f172a] transition-all placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <select
                                aria-label="Filter role"
                                value={ambilKueri(url, 'role')}
                                onChange={(e) => timpaKueri({ role: e.target.value })}
                                className="h-9 appearance-none cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-3 pr-8 text-xs font-medium text-[#0f172a] transition-all focus:border-[#1e3a5f] focus:outline-none"
                            >
                                <option value="">Semua Role</option>
                                {props.roles.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-2 text-lg text-[#515f74]">
                                arrow_drop_down
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                aria-label="Filter aktivitas"
                                value={ambilKueri(url, 'aktivitas')}
                                onChange={(e) => timpaKueri({ aktivitas: e.target.value })}
                                className="h-9 appearance-none cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-3 pr-8 text-xs font-medium text-[#0f172a] transition-all focus:border-[#1e3a5f] focus:outline-none"
                            >
                                <option value="">Semua Aktivitas</option>
                                {Object.entries(labelAktivitas).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-2 text-lg text-[#515f74]">
                                arrow_drop_down
                            </span>
                        </div>
                        <Link
                            href={`/dashboard/ekspor${kueriSaatIni(url)}`}
                            as="button"
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#e2e7ff]"
                        >
                            <span className="material-symbols-outlined text-base">file_download</span>
                            <span>Ekspor</span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                            <tr>
                                <th scope="col" className="px-5 py-3.5">Waktu</th>
                                <th scope="col" className="px-5 py-3.5">Pengguna</th>
                                <th scope="col" className="px-5 py-3.5">Role</th>
                                <th scope="col" className="px-5 py-3.5">Aktivitas</th>
                                <th scope="col" className="px-5 py-3.5">Status</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] text-[#0f172a]">
                            {props.aktivitas.data.map((a) => {
                                const st = statusTampilan(a.activity);
                                const warna = warnaAvatar[(a.user_id ?? 0) % warnaAvatar.length];
                                return (
                                    <tr key={a.id} className="transition-colors hover:bg-[#f1f5f9]/60">
                                        <td
                                            className="whitespace-nowrap px-5 py-3.5 text-[11px] text-[#515f74]"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {fmtWaktu(a.created_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                    style={{ backgroundColor: warna }}
                                                >
                                                    {inisial(a.user?.name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{a.user?.name ?? 'Sistem'}</span>
                                                    <span className="text-[11px] text-[#515f74]">{a.user?.email ?? '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5">
                                            <span
                                                className="rounded bg-[#d5e3fc] px-2 py-0.5 text-[10px] font-semibold text-[#57657a]"
                                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                            >
                                                {a.user?.role?.name ?? 'Sistem'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{labelAktivitas[a.activity] ?? a.activity}</span>
                                                <span
                                                    className="text-[11px] text-[#515f74]"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    {a.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${st.kelas}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${a.activity === 'ajukan' ? 'animate-pulse' : ''}`}
                                                    style={{ backgroundColor: st.dot }}
                                                ></span>{' '}
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                                            <button
                                                className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]"
                                                title="Detail"
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {props.aktivitas.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#515f74]">
                                        Tidak ada data aktivitas untuk filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] bg-[#f1f5f9]/40 p-4 sm:flex-row">
                    <div className="flex items-center gap-3 text-xs text-[#515f74]">
                        <span>
                            Menampilkan{' '}
                            <strong className="font-semibold text-[#0f172a]">
                                {props.aktivitas.from ?? 0} - {props.aktivitas.to ?? 0}
                            </strong>{' '}
                            dari{' '}
                            <strong className="font-semibold text-[#0f172a]">{props.aktivitas.total ?? 0}</strong> data
                            aktivitas
                        </span>
                        <span className="text-[#94a3b8]">|</span>
                        <label className="flex items-center gap-1.5">
                            <span>Baris per halaman:</span>
                            <select
                                aria-label="Baris per halaman"
                                value={perHalaman}
                                onChange={(e) => timpaKueri({ per_halaman: e.target.value })}
                                className="h-7 rounded border border-[#e2e7ff] bg-white px-2 text-xs text-[#0f172a] focus:outline-none"
                            >
                                {[6, 10, 25, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="border-t border-[#e2e7ff]">
                    <Pagination pag={props.aktivitas} />
                </div>
            </div>

            <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] pb-2 pt-5 text-xs text-[#515f74] sm:flex-row">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#022448]">SARPRA</span>
                    <span>•</span>
                    <span>Sistem Terpadu Pengelolaan Sarana dan Prasarana</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Operasional Aktif
                    </span>
                    <span>•</span>
                    <span>Hak Cipta © 2026</span>
                </div>
            </footer>
        </div>
    );
}

// Ambil satu parameter querystring dari URL halaman Inertia.
function ambilKueri(url: string, kunci: string): string {
    const i = url.indexOf('?');
    if (i < 0) return '';
    return new URLSearchParams(url.slice(i + 1)).get(kunci) ?? '';
}

// Kueri saat ini untuk link ekspor (tetap ribet dengan filter aktif).
function kueriSaatIni(url: string): string {
    const i = url.indexOf('?');
    return i < 0 ? '' : url.slice(i);
}
