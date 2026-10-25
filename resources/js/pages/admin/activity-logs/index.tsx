import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Aktivitas = {
    id: number;
    user_id?: number | null;
    activity: string;
    description: string;
    module?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at?: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
        role?: { name: string } | null;
    } | null;
};

type Props = {
    aktivitas: Paginator<Aktivitas>;
    totalLog: number;
    hariIni: number;
    perubahan: number;
    otorisasi: number;
    daftarModul: string[];
    status?: string;
};

const labelAktivitas: Record<string, string> = {
    login: 'Login',
    tambah: 'Tambah',
    ubah: 'Ubah',
    hapus: 'Hapus',
    ajukan: 'Ajukan',
    setujui: 'Setujui',
    tolak: 'Tolak',
    ubah_status: 'Ubah Status',
};

const badgeAksi: Record<string, string> = {
    login: 'bg-blue-100 text-blue-800',
    tambah: 'bg-emerald-100 text-emerald-800',
    ubah: 'bg-amber-100 text-amber-800',
    hapus: 'bg-red-100 text-red-700',
    ajukan: 'bg-indigo-100 text-indigo-700',
    setujui: 'bg-emerald-100 text-emerald-800',
    tolak: 'bg-red-100 text-red-700',
    ubah_status: 'bg-slate-200 text-slate-700',
};

const labelModul: Record<string, string> = {
    pengguna: 'Manajemen Pengguna',
    perencanaan: 'Modul Perencanaan',
    pengadaan: 'Modul Pengadaan',
    barang: 'Modul Inventaris',
    pemeliharaan: 'Modul Pemeliharaan',
    laporan: 'Laporan',
};

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

const formatRibuan = (n: number) => new Intl.NumberFormat('id-ID').format(n);

export default function ActivityLogsIndex(props: Props) {
    const { url } = usePage();

    const [cari, setCari] = useState('');
    const [inspeksi, setInspeksi] = useState<Aktivitas | null>(null);
    const pertama = useRef(true);

    const timpaKueri = (perubahan: Record<string, string | undefined>) => {
        const target = new URL(url, window.location.origin);
        for (const [k, v] of Object.entries(perubahan)) {
            if (v === undefined || v === '') target.searchParams.delete(k);
            else target.searchParams.set(k, v);
        }
        target.searchParams.delete('page');
        router.get(target.pathname + target.search, {}, { preserveState: true, preserveScroll: true });
    };

    // Cari = debounce lalu router.get keenam parameter.
    useEffect(() => {
        if (pertama.current) {
            pertama.current = false;
            return;
        }
        const t = setTimeout(() => timpaKueri({ cari }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cari]);

    const perHalaman = ambilKueri(url, 'per_halaman') || '10';

    const kartuMetrik = [
        {
            label: 'Total Log Audit',
            nilai: formatRibuan(props.totalLog),
            sub: 'Tersimpan permanen',
            subKelas: 'text-[11px] text-[#515f74]',
            ikon: 'storage',
            kotak: 'bg-[#d5e3fc]/60 text-[#022448]',
        },
        {
            label: 'Aktivitas Hari Ini',
            nilai: formatRibuan(props.hariIni),
            sub: 'Tercatat hari ini',
            subKelas: 'text-[11px] font-semibold text-emerald-700',
            ikon: 'today',
            kotak: 'bg-emerald-100 text-emerald-700',
        },
        {
            label: 'Perubahan',
            nilai: formatRibuan(props.perubahan),
            sub: 'Tambah, ubah & hapus',
            subKelas: 'text-[11px] font-semibold text-amber-700',
            ikon: 'edit_note',
            kotak: 'bg-amber-100 text-amber-700',
        },
        {
            label: 'Otorisasi & Persetujuan',
            nilai: formatRibuan(props.otorisasi),
            sub: 'Tindakan pimpinan',
            subKelas: 'text-[11px] font-semibold text-[#022448]',
            ikon: 'approval_delegation',
            kotak: 'bg-[#d5e3fc] text-[#022448]',
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Gaya cetak: sembunyikan cangkang aplikasi laporan audit. */}
            <style>{`@media print { aside, header, footer { display: none !important; } }`}</style>

            {props.status && (
                <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: '#e6f7ef', color: '#0d7a52' }}
                >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <p className="text-sm font-medium">{props.status}</p>
                </div>
            )}

            {/* Judul */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 md:flex-row md:items-center">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-[#1e3a5f]/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#1e3a5f]">
                            Konsol Administrator
                        </span>
                        <span className="text-xs text-[#94a3b8]">•</span>
                        <span className="text-xs font-medium text-[#515f74]">Pusat Pengaturan &amp; Audit Trail</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">
                        Riwayat Aktivitas Sistem
                    </h1>
                    <p className="mt-0.5 text-sm text-[#515f74]">
                        Catatan log audit autentikasi, mutasi aset, persetujuan pejabat, dan riwayat keamanan.
                    </p>
                </div>
            </div>

            {/* 4 kartu metrik */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kartuMetrik.map((k) => (
                    <div
                        key={k.label}
                        className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm"
                    >
                        <div>
                            <p className="text-xs font-medium text-[#515f74]">{k.label}</p>
                            <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">{k.nilai}</p>
                            <span className={k.subKelas}>{k.sub}</span>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${k.kotak}`}>
                            <span className="material-symbols-outlined text-2xl">{k.ikon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                <div className="flex flex-1 flex-col items-stretch gap-3 lg:flex-row lg:items-center">
                    <div className="relative w-full flex-1">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-2 text-lg text-[#515f74]">
                            search
                        </span>
                        <input
                            type="text"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari nama pengguna, IP address, atau kata kunci..."
                            className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-9 pr-4 text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <select
                            aria-label="Filter modul"
                            value={ambilKueri(url, 'modul')}
                            onChange={(e) => timpaKueri({ modul: e.target.value })}
                            className="h-9 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                        >
                            <option value="">Semua Modul</option>
                            {props.daftarModul.map((m) => (
                                <option key={m} value={m}>
                                    {labelModul[m] ?? m}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter aksi"
                            value={ambilKueri(url, 'aktivitas')}
                            onChange={(e) => timpaKueri({ aktivitas: e.target.value })}
                            className="h-9 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                        >
                            <option value="">Semua Aksi</option>
                            {Object.entries(labelAktivitas).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter waktu"
                            value={ambilKueri(url, 'waktu') || 'all'}
                            onChange={(e) => timpaKueri({ waktu: e.target.value === 'all' ? '' : e.target.value })}
                            className="h-9 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                        >
                            <option value="all">Semua Waktu</option>
                            <option value="today">Hari Ini</option>
                            <option value="7d">7 Hari Terakhir</option>
                            <option value="30d">30 Hari Terakhir</option>
                        </select>
                    </div>
                    <Link
                        href="/admin/aktivitas"
                        className="flex h-9 items-center justify-center gap-1 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]"
                    >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        <span>Reset Filter</span>
                    </Link>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-[#e2e7ff] pt-3">
                    <Link
                        href={`/dashboard/ekspor${kueriSaatIni(url)}`}
                        as="button"
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span>Ekspor Excel / CSV</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#152a45]"
                    >
                        <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        <span>Cetak Laporan Audit PDF</span>
                    </button>
                </div>
            </div>

            {/* Tabel */}
            <div className="mt-6 flex flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] font-bold uppercase tracking-wider text-[#515f74]">
                                <th className="px-4 py-3">Waktu &amp; Tanggal</th>
                                <th className="px-4 py-3">Nama Pengguna</th>
                                <th className="px-4 py-3">Peran</th>
                                <th className="px-4 py-3">Modul Domain</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                                <th className="px-4 py-3">Keterangan Detail Aktivitas</th>
                                <th className="px-4 py-3 text-center">Inspeksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] text-xs">
                            {props.aktivitas.data.map((a) => (
                                <tr key={a.id} className="transition-colors hover:bg-[#f1f5f9]/50">
                                    <td
                                        className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#515f74]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {fmtWaktu(a.created_at)} WIB
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-[10px] font-bold text-white">
                                                {inisial(a.user?.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0f172a]">{a.user?.name ?? 'Sistem'}</p>
                                                <p
                                                    className="text-[11px] text-[#515f74]"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    ID: USR-{String(a.user_id ?? 0).padStart(5, '0')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5">
                                        <span className="rounded bg-[#d5e3fc] px-2 py-0.5 text-[10px] font-bold text-[#022448]">
                                            {a.user?.role?.name ?? 'Sistem'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5">
                                        <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#515f74]">
                                            {labelModul[a.module ?? ''] ?? (a.module ?? '-')}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                        <span
                                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                                badgeAksi[a.activity] ?? 'bg-slate-200 text-slate-700'
                                            }`}
                                        >
                                            {labelAktivitas[a.activity] ?? a.activity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="font-medium text-[#0f172a]">{a.description}</p>
                                        <p
                                            className="mt-0.5 text-[11px] text-[#515f74]"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            IP: {a.ip_address ?? '-'}
                                        </p>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                        <button
                                            type="button"
                                            title="Detail Log"
                                            onClick={() => setInspeksi(a)}
                                            className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#022448]"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {props.aktivitas.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#515f74]">
                                        Tidak ada rekaman audit untuk filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] p-4 text-xs text-[#515f74] sm:flex-row">
                    <div className="flex items-center gap-2">
                        <span>
                            Menampilkan{' '}
                            <span className="font-bold text-[#0f172a]">
                                {props.aktivitas.from ?? 0} - {props.aktivitas.to ?? 0}
                            </span>{' '}
                            dari{' '}
                            <span className="font-bold text-[#0f172a]">
                                {formatRibuan(props.aktivitas.total ?? 0)}
                            </span>{' '}
                            rekaman audit
                        </span>
                        <span className="text-[#94a3b8]">|</span>
                        <label className="flex items-center gap-1.5">
                            <span>Baris per halaman:</span>
                            <select
                                aria-label="Baris per halaman"
                                value={perHalaman}
                                onChange={(e) => timpaKueri({ per_halaman: e.target.value })}
                                className="h-7 rounded border border-[#e2e7ff] bg-[#f1f5f9] px-2 text-xs text-[#0f172a]"
                            >
                                {[10, 25, 50].map((n) => (
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

            {/* Modal inspeksi */}
            <Dialog open={inspeksi !== null} onOpenChange={(o) => (o ? null : setInspeksi(null))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="-mx-6 -mt-6 rounded-t-lg bg-[#f1f5f9] px-5 py-4">
                        <DialogTitle className="text-base font-bold text-[#0f172a]">
                            Detail Rekaman Audit
                        </DialogTitle>
                    </DialogHeader>
                    <dl className="-mx-6 -mb-6 grid grid-cols-3 gap-x-3 gap-y-2.5 p-5 text-xs">
                        <dt className="font-medium text-[#515f74]">Waktu</dt>
                        <dd
                            className="col-span-2 font-semibold text-[#0f172a]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {inspeksi ? fmtWaktu(inspeksi.created_at) : '-'} WIB
                        </dd>
                        <dt className="font-medium text-[#515f74]">Pengguna</dt>
                        <dd className="col-span-2 font-semibold text-[#0f172a]">{inspeksi?.user?.name ?? 'Sistem'}</dd>
                        <dt className="font-medium text-[#515f74]">Email</dt>
                        <dd className="col-span-2 text-[#0f172a]">{inspeksi?.user?.email ?? '-'}</dd>
                        <dt className="font-medium text-[#515f74]">Peran</dt>
                        <dd className="col-span-2 text-[#0f172a]">{inspeksi?.user?.role?.name ?? 'Sistem'}</dd>
                        <dt className="font-medium text-[#515f74]">Modul</dt>
                        <dd className="col-span-2 text-[#0f172a]">
                            {inspeksi ? (labelModul[inspeksi.module ?? ''] ?? (inspeksi.module ?? '-')) : '-'}
                        </dd>
                        <dt className="font-medium text-[#515f74]">Aksi</dt>
                        <dd className="col-span-2 text-[#0f172a]">
                            {inspeksi ? (labelAktivitas[inspeksi.activity] ?? inspeksi.activity) : '-'}
                        </dd>
                        <dt className="font-medium text-[#515f74]">Deskripsi</dt>
                        <dd className="col-span-2 text-[#0f172a]">{inspeksi?.description ?? '-'}</dd>
                        <dt className="font-medium text-[#515f74]">IP</dt>
                        <dd
                            className="col-span-2 text-[#0f172a]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {inspeksi?.ip_address ?? '-'}
                        </dd>
                        <dt className="font-medium text-[#515f74]">User Agent</dt>
                        <dd className="col-span-2 break-all text-[#0f172a]">{inspeksi?.user_agent ?? '-'}</dd>
                    </dl>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Ambil satu parameter querystring dari URL halaman Inertia.
function ambilKueri(url: string, kunci: string): string {
    const i = url.indexOf('?');
    if (i < 0) return '';
    return new URLSearchParams(url.slice(i + 1)).get(kunci) ?? '';
}

// Kueri saat ini untuk link ekspor (tetap mengikuti filter aktif).
function kueriSaatIni(url: string): string {
    const i = url.indexOf('?');
    return i < 0 ? '' : url.slice(i);
}
