import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { Paginator } from '@/components/sarpra/pagination';
import type { Auth } from '@/types';
import { dashboard } from '@/routes';

type AsetRow = {
    id: number;
    kode_barang: string;
    nama_barang: string;
    spesifikasi?: string | null;
    lokasi?: { name: string } | null;
    kondisi?: { name: string } | null;
    status?: { name: string } | null;
    updated_at?: string | null;
};

type PageProps = {
    menuAktif?: string;
    notifBelumDibaca?: number;
    tanggalHariIni?: string;
    totalUnit: number;
    baik: number;
    ringan: number;
    berat: number;
    pending: number;
    tiketAktif: number;
    jumlahKategori: number;
    aset: Paginator<AsetRow>;
    auth?: Auth;
};

const BULAN = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const ribuan = (n: number) => n.toLocaleString('id-ID');
const desimal = (n: number) =>
    n.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

const formatTanggal = (value?: string | null) => {
    if (!value) {
        return '-';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '-';
    }
    return `${String(d.getDate()).padStart(2, '0')} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

const limitTeks = (teks: string | null | undefined, batas: number) => {
    if (!teks) {
        return '';
    }
    return teks.length > batas ? `${teks.slice(0, batas)}...` : teks;
};

const kondisiBadge: Record<string, { kelas: string; dot: string }> = {
    Baik: { kelas: 'bg-[#ecfdf5] text-[#047857]', dot: 'bg-[#059669]' },
    'Rusak Ringan': { kelas: 'bg-[#fffbeb] text-[#b45309]', dot: 'bg-[#d97706]' },
    'Rusak Berat': { kelas: 'bg-[#fef2f2] text-[#b91c1c]', dot: 'bg-[#dc2626]' },
};
const kondisiFallback = { kelas: 'bg-[#f1f5f9] text-[#515f74]', dot: 'bg-[#94a3b8]' };

const FILTER_KONDISI: Array<[string, string]> = [
    ['', 'Semua'],
    ['Baik', 'Kondisi Baik'],
    ['Rusak Ringan', 'Rusak Ringan'],
    ['Rusak Berat', 'Rusak Berat'],
];

const KARTU_WAKTU = ['Hari Ini', '7 Hari', '30 Hari'];

const metrikKartu = [
    { ikon: 'inventory_2', latar: 'bg-[#f1f5f9]', aksen: 'text-[#022448]' },
    { ikon: 'check_circle', latar: 'bg-[#ecfdf5]', aksen: 'text-[#047857]' },
    { ikon: 'report_problem', latar: 'bg-[#fffbeb]', aksen: 'text-[#b45309]' },
    { ikon: 'cancel', latar: 'bg-[#fef2f2]', aksen: 'text-[#b91c1c]' },
    { ikon: 'hourglass_top', latar: 'bg-[#d5e3fc]/60', aksen: 'text-[#022448]' },
    { ikon: 'engineering', latar: 'bg-[#e2e7ff]/40', aksen: 'text-[#515f74]' },
] as const;

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const {
        totalUnit, baik, ringan, berat, pending, tiketAktif,
        jumlahKategori, aset, auth,
    } = props;

    const paramQuery = new URLSearchParams(window.location.search);
    const [kondisiAktif, setKondisiAktif] = useState(paramQuery.get('kondisi') ?? '');
    const [cari, setCari] = useState(paramQuery.get('cari') ?? '');
    const [waktuAktif, setWaktuAktif] = useState('Hari Ini');

    const pctBaik = totalUnit > 0 ? Math.round((baik / totalUnit) * 1000) / 10 : 0;

    const kirim = (kondisi: string = kondisiAktif, cariKirim: string = cari) => {
        setKondisiAktif(kondisi);
        router.get(
            dashboard.url(),
            { cari: cariKirim.trim(), kondisi },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Pagination ala Blade: jendela halaman current-1 s/d current+1.
    const current = aset.current_page ?? 1;
    const last = aset.last_page ?? 1;
    const ambilUrl = (halaman: number) =>
        aset.links?.find((l) => l.url !== null && l.label === String(halaman))?.url ?? null;
    const urlPrev = aset.links?.[0]?.url ?? null;
    const urlNext = aset.links?.[aset.links.length - 1]?.url ?? null;
    const keUrl = (url: string | null) => {
        if (!url) {
            return;
        }
        const target = new URL(url, window.location.origin);
        router.get(`${target.pathname}${target.search}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const metrikNilai = [
        { nilai: totalUnit, satuan: 'Unit', catatan: `Terdaftar dalam ${jumlahKategori} kategori`, warna: 'text-[#0f172a]' },
        { nilai: baik, satuan: 'Unit', catatan: `${desimal(pctBaik)}% kondisi optimal`, warna: 'text-[#047857]' },
        { nilai: ringan, satuan: 'Unit', catatan: 'Perlu pemeliharaan berkala', warna: 'text-[#b45309]' },
        { nilai: berat, satuan: 'Unit', catatan: 'Usulan penghapusan / lelang', warna: 'text-[#b91c1c]' },
        { nilai: pending, satuan: 'Pengajuan', catatan: 'Menunggu verifikasi', warna: 'text-[#022448]' },
        { nilai: tiketAktif, satuan: 'Tiket', catatan: 'Sedang dikerjakan teknisi', warna: 'text-[#0f172a]' },
    ];

    return (
        <>
            <Head title="Dashboard Pengelola" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Sapaan */}
                <div className="flex flex-col justify-between gap-4 pb-2 md:flex-row md:items-center">
                    <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#515f74]">
                                Konsol Operasional Pengelola
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                            Selamat Datang, {auth?.user?.name}
                        </h1>
                        <p className="text-xs text-[#475569]">
                            Ringkasan inventarisasi, kondisi sarana prasarana, dan pengajuan operasional aktif hari ini
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-[#e2e7ff] bg-[#e2e7ff] p-1 text-xs">
                            {KARTU_WAKTU.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setWaktuAktif(label)}
                                    className={
                                        waktuAktif === label
                                            ? 'rounded-md px-3 py-1.5 font-bold text-[#022448] shadow-xs transition-colors'
                                            : 'rounded-md px-3 py-1.5 font-medium text-[#515f74] transition-colors hover:text-[#022448]'
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#254670]"
                        >
                            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                            <span>Buat Pengajuan Pengadaan</span>
                        </a>
                    </div>
                </div>

                {/* Kartu metrik */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {metrikNilai.map((m, i) => {
                        const kartu = metrikKartu[i];
                        return (
                            <div
                                key={i}
                                className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#515f74]">
                                        {['Total Aset', 'Barang Baik', 'Rusak Ringan', 'Rusak Berat', 'Pengadaan Pending', 'Pemeliharaan Aktif'][i]}
                                    </span>
                                    <span
                                        className={`material-symbols-outlined rounded-lg p-2 text-xl ${kartu.latar} ${kartu.aksen}`}
                                    >
                                        {kartu.ikon}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className={`text-xl font-bold ${m.warna}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {ribuan(m.nilai)}{' '}
                                        <span className="text-xs font-medium text-[#515f74]" style={{ fontFamily: 'inherit' }}>
                                            {m.satuan}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-[#475569]">
                                        {m.satuan === 'Unit' && i === 1 ? (
                                            <span className="font-semibold text-[#047857]">{desimal(pctBaik)}%</span>
                                        ) : null}
                                        {m.satuan === 'Unit' && i === 1 ? ' kondisi optimal' : m.catatan}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Aksi cepat */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <a href="#" className="flex items-start gap-4 rounded-xl bg-[#1e3a5f] p-4 text-white shadow-sm transition-all hover:bg-[#254670]">
                        <div className="shrink-0 rounded-lg bg-white/10 p-2.5">
                            <span className="material-symbols-outlined text-2xl">add_shopping_cart</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">Buat Pengajuan Pengadaan</span>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#bacae3]">
                                Ajukan usulan rencana kebutuhan sarpras baru untuk unit kerja
                            </p>
                        </div>
                    </a>
                    <a href="#" className="group flex items-start gap-4 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs transition-all hover:bg-[#f1f5f9]">
                        <div className="shrink-0 rounded-lg bg-[#f1f5f9] p-2.5 text-[#022448] transition-colors group-hover:bg-[#1e3a5f] group-hover:text-white">
                            <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0f172a] transition-colors group-hover:text-[#022448]">
                                Catat Aset Baru / Inventarisasi
                            </span>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#475569]">
                                Pindai QR/Barcode atau input serial number aset baru
                            </p>
                        </div>
                    </a>
                    <a href="#" className="group flex items-start gap-4 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs transition-all hover:bg-[#f1f5f9]">
                        <div className="shrink-0 rounded-lg bg-[#f1f5f9] p-2.5 text-[#022448] transition-colors group-hover:bg-[#1e3a5f] group-hover:text-white">
                            <span className="material-symbols-outlined text-2xl">build</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0f172a] transition-colors group-hover:text-[#022448]">
                                Lapor Pemeliharaan / Kerusakan
                            </span>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#475569]">
                                Buat tiket servis perbaikan sarana prasarana
                            </p>
                        </div>
                    </a>
                </div>

                {/* Tabel aset */}
                <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            kirim();
                        }}
                        className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] p-5 sm:flex-row sm:items-center"
                    >
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold tracking-tight text-[#0f172a]">
                                Ringkasan Status Aset Terkini
                            </h2>
                            <p className="mt-0.5 text-xs text-[#475569]">
                                Daftar inventaris sarpras yang diverifikasi dan dalam pemantauan operasional
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] p-0.5 text-xs">
                                {FILTER_KONDISI.map(([val, label]) => (
                                    <button
                                        key={val || 'semua'}
                                        type="button"
                                        onClick={() => {
                                            setCari(cari);
                                            kirim(val);
                                        }}
                                        className={
                                            kondisiAktif === val
                                                ? 'rounded-md px-3 py-1 font-semibold bg-white text-[#022448] shadow-xs'
                                                : 'rounded-md px-3 py-1 text-[#515f74] hover:text-[#022448]'
                                        }
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 text-base text-[#515f74]">
                                    search
                                </span>
                                <input
                                    type="text"
                                    name="cari"
                                    value={cari}
                                    onChange={(e) => setCari(e.target.value)}
                                    placeholder="Cari kode / nama aset..."
                                    className="h-8 w-56 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-8 pr-3 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#e2e7ff] bg-[#f8fafc] font-semibold text-[#515f74]">
                                    <th className="px-4 py-3 font-medium">Kode Inventaris</th>
                                    <th className="px-4 py-3 font-medium">Nama Aset &amp; Spesifikasi</th>
                                    <th className="px-4 py-3 font-medium">Lokasi / Ruangan</th>
                                    <th className="px-4 py-3 font-medium">Kondisi</th>
                                    <th className="px-4 py-3 font-medium">Cek Terakhir</th>
                                    <th className="px-4 py-3 font-medium">Status Operasional</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff]">
                                {aset.data.map((b) => {
                                    const kb = kondisiBadge[b.kondisi?.name ?? ''] ?? kondisiFallback;
                                    return (
                                        <tr key={b.id} className="transition-colors hover:bg-[#f1f5f9]">
                                            <td className="px-4 py-3 font-semibold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {b.kode_barang}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-[#0f172a]">{b.nama_barang}</div>
                                                <div className="text-[11px] text-[#475569]">{limitTeks(b.spesifikasi, 60)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-[#475569]">{b.lokasi?.name ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${kb.kelas}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${kb.dot}`} />
                                                    {b.kondisi?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#475569]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {formatTanggal(b.updated_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded bg-[#d5e3fc]/50 px-2 py-0.5 text-[11px] font-medium text-[#57657a]">
                                                    {b.status?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="Lihat Detail"
                                                        className="rounded p-1 text-[#515f74] hover:bg-[#f1f5f9] hover:text-[#022448]"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Edit Aset"
                                                        className="rounded p-1 text-[#515f74] hover:bg-[#f1f5f9] hover:text-[#022448]"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {aset.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#515f74]">
                                            Tidak ada data aset untuk filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#e2e7ff] px-5 py-3 text-xs text-[#515f74]">
                        <span className="text-[11px]">
                            Menampilkan{' '}
                            <strong className="font-semibold text-[#0f172a]">
                                {aset.from ?? 0} - {aset.to ?? 0}
                            </strong>{' '}
                            dari{' '}
                            <strong className="font-semibold text-[#0f172a]">{ribuan(aset.total ?? 0)}</strong> aset
                        </span>
                        <div className="flex items-center gap-1">
                            {urlPrev ? (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        keUrl(urlPrev);
                                    }}
                                    className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 text-[11px] hover:bg-[#f1f5f9]"
                                >
                                    Sebelumnya
                                </a>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 py-1 text-[11px]">Sebelumnya</span>
                            )}
                            {Array.from({ length: Math.min(last ? last : 1, current + 1) - Math.max(1, current - 1) + 1 }).map((_, idx) => {
                                const halaman = Math.max(1, current - 1) + idx;
                                const url = ambilUrl(halaman);
                                return halaman === current ? (
                                    <span
                                        key={halaman}
                                        className="rounded border border-[#e2e7ff] bg-[#1e3a5f] px-2.5 py-1 text-[11px] font-semibold text-white"
                                    >
                                        {halaman}
                                    </span>
                                ) : (
                                    <a
                                        key={halaman}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (url) {
                                                keUrl(url);
                                            }
                                        }}
                                        className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 text-[11px] hover:bg-[#f1f5f9]"
                                    >
                                        {halaman}
                                    </a>
                                );
                            })}
                            {urlNext ? (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        keUrl(urlNext);
                                    }}
                                    className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 text-[11px] hover:bg-[#f1f5f9]"
                                >
                                    Berikutnya
                                </a>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 py-1 text-[11px]">Berikutnya</span>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] pb-2 pt-5 text-xs text-[#515f74] sm:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#022448]">SARPRA</span>
                        <span>&bull;</span>
                        <span>Sistem Terpadu Pengelolaan Sarana dan Prasarana</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operasional Aktif
                        </span>
                        <span>&bull;</span>
                        <span>Hak Cipta &copy; 2026</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
