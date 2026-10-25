import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/sarpra/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ----------------------------- tipe data -----------------------------

type Option = { id: number; name: string };

type DetailPengadaanItem = {
    nama_barang: string;
    jumlah: number;
    subtotal: number;
    spesifikasi?: string | null;
    satuan?: string | null;
    estimasi_harga?: number;
};

type Pengadaan = {
    id: number;
    nomor_pengadaan: string;
    status: string;
    tanggal_pengajuan: string | null;
    alasan: string | null;
    jenis: Option | null;
    user: Option | null;
    detail: DetailPengadaanItem[];
};

type Rincian = {
    nomor: string;
    tanggal: string | null;
    status: string;
    pengaju: string | null;
    alasan: string | null;
    total: number;
    detail: Array<{
        nama: string;
        spesifikasi: string | null;
        jumlah: number;
        satuan: string | null;
        harga: number;
        subtotal: number;
    }>;
    dokumen: Array<{ nama: string; url: string }>;
    riwayat: Array<{ status: string; catatan: string | null; oleh: string | null; waktu: string | null }>;
};

type Paginator<T> = {
    data: T[];
    links?: { url: string | null; label: string; active: boolean }[];
    current_page?: number;
    from?: number | null;
    to?: number | null;
    last_page?: number;
    total?: number;
};

type Props = {
    data: Paginator<Pengadaan>;
    tab: string;
    countSemua: number;
    countDraft: number;
    countMenunggu: number;
    countDiproses: number;
    countSelesai: number;
    countDitolak: number;
    totalEstimasi: number;
    jeniss: Option[];
    [key: string]: unknown;
};

// ----------------------------- konstanta -----------------------------

const URL_INDEX = '/pengelolaan/pengadaan';
const URL_EKSPOR = '/pengelolaan/pengadaan/ekspor';
const URL_CREATE = '/pengelolaan/pengadaan/create';

const rupiah = (n: number | null | undefined) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

const pesanStatus: Record<
    string,
    { varian: 'abu' | 'biru' | 'kuning' | 'hijau' | 'merah'; ikon: string; label: string }
> = {
    draft: { varian: 'abu', ikon: 'edit_note', label: 'Draft' },
    diajukan: { varian: 'biru', ikon: 'send', label: 'Diajukan' },
    menunggu_persetujuan: { varian: 'kuning', ikon: 'hourglass_top', label: 'Menunggu Persetujuan' },
    disetujui: { varian: 'hijau', ikon: 'check_circle', label: 'Disetujui' },
    ditolak: { varian: 'merah', ikon: 'cancel', label: 'Ditolak' },
    diproses: { varian: 'biru', ikon: 'sync', label: 'Diproses' },
    selesai: { varian: 'hijau', ikon: 'task_alt', label: 'Selesai' },
};

const daftarStatus: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['diajukan', 'Diajukan'],
    ['menunggu_persetujuan', 'Menunggu Persetujuan'],
    ['disetujui', 'Disetujui'],
    ['ditolak', 'Ditolak'],
    ['diproses', 'Diproses'],
    ['selesai', 'Selesai'],
];

const tanggalIndo = (nilai: string | null) =>
    nilai
        ? new Date(nilai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-';

const potong = (teks: string | null, batas = 60) => {
    if (!teks) return '';
    return teks.length > batas ? `${teks.slice(0, batas)}...` : teks;
};

// Halaman daftar pengadaan (Pengelola) — replika pengadaan/index.blade.php.
export default function PengadaanIndex() {
    const {
        data,
        tab,
        countSemua,
        countDraft,
        countMenunggu,
        countDiproses,
        countSelesai,
        countDitolak,
        totalEstimasi,
        jeniss,
    } = usePage().props as unknown as Props;

    const flash = usePage().props as unknown as {
        status?: string;
        error?: string;
        errors?: Record<string, string>;
    };
    const pesanError =
        flash.error ??
        (flash.errors && Object.keys(flash.errors).length > 0 ? Object.values(flash.errors)[0] : null);

    const tabLabel: Record<string, string> = {
        semua: 'Daftar Pengadaan',
        draft: 'Draft',
        menunggu: 'Menunggu Persetujuan',
        diproses: 'Sedang Diproses',
        selesai: 'Selesai',
        ditolak: 'Ditolak',
    };
    const tabCount: Record<string, number> = {
        semua: countSemua,
        draft: countDraft,
        menunggu: countMenunggu,
        diproses: countDiproses,
        selesai: countSelesai,
        ditolak: countDitolak,
    };

    // Filter aktif dibaca dari querystring browser (server pakai withQueryString).
    const kini = new URLSearchParams(window.location.search);
    const [cari, setCari] = useState(kini.get('cari') ?? '');
    const [jenis, setJenis] = useState(kini.get('jenis') ?? '');
    const [status, setStatus] = useState(kini.get('status') ?? '');
    const perHalaman = Number(kini.get('per_halaman') ?? '10') || 10;

    // Naikkan filter dari querystring saat ini (tanpa key yang dibuang).
    const muatNaik = (buang: string[]) => {
        const q = new URLSearchParams(window.location.search);
        buang.forEach((k) => q.delete(k));
        return q;
    };

    const urlDengan = (buang: string[], tambahan: Record<string, string> = {}) => {
        const q = muatNaik(buang);
        Object.entries(tambahan).forEach(([k, v]) => {
            if (v) q.set(k, v);
            else q.delete(k);
        });
        const qs = q.toString();
        return qs ? `${URL_INDEX}?${qs}` : URL_INDEX;
    };

    const gantiFilter = (tambahan: Record<string, string>) => {
        const q = muatNaik(['page']);
        Object.entries(tambahan).forEach(([k, v]) => {
            if (v) q.set(k, v);
            else q.delete(k);
        });
        router.get(URL_INDEX, Object.fromEntries(q.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Drawer rincian: ambil JSON dari pengelolaan/pengadaan/{id}/rincian.
    const [rincian, setRincian] = useState<Rincian | null>(null);
    const [rincianId, setRincianId] = useState<number | null>(null);

    const bukaRincian = async (id: number) => {
        setRincianId(id);
        try {
            const res = await fetch(`/pengelolaan/pengadaan/${id}/rincian`);
            setRincian((await res.json()) as Rincian);
        } catch {
            setRincian(null);
            setRincianId(null);
        }
    };

    const tutupRincian = () => {
        setRincian(null);
        setRincianId(null);
    };

    const kirimDraft = (id: number) =>
        router.post(`/pengelolaan/pengadaan/${id}/kirim`, {}, { preserveScroll: true });

    const hapusDraft = (id: number, nomor: string) => {
        if (!window.confirm(`Hapus draft ${nomor}?`)) return;
        router.delete(`/pengelolaan/pengadaan/${id}`, { preserveScroll: true });
    };

    // Rentang halaman kecil di footer tabel (±1 dari halaman aktif).
    const halamanAktif = data?.current_page ?? 1;
    const halamanTerakhir = data?.last_page ?? 1;
    const mulai = Math.max(1, Math.min(halamanAktif - 1, halamanTerakhir - 2));
    const daftarHalaman = Array.from(
        { length: Math.min(3, halamanTerakhir) },
        (_, i) => mulai + i,
    ).filter((h) => h >= 1 && h <= halamanTerakhir);

    return (
        <>
            <Head title="Manajemen Pengadaan" />
            <div className="flex max-w-7xl flex-col gap-6">
                {/* Judul */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-[#022448]">Manajemen Pengadaan</h1>
                            <span className="rounded-full border border-[#e2e7ff] bg-[#d5e3fc] px-2.5 py-0.5 text-xs font-semibold text-[#57657a]">
                                T.A. {new Date().getFullYear()} / {new Date().getFullYear() + 1}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[#515f74] md:text-sm">
                            Kelola alur pengadaan barang dan jasa, verifikasi spesifikasi teknis, dokumen pendukung, dan riwayat persetujuan.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={`${URL_EKSPOR}${kini.toString() ? `?${kini.toString()}` : ''}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-colors hover:bg-[#f2f3ff] hover:text-[#022448]"
                        >
                            <span className="material-symbols-outlined text-lg">file_download</span>
                            Ekspor Laporan
                        </a>
                        <Link
                            href={URL_CREATE}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#022448] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Buat Pengadaan Baru
                        </Link>
                    </div>
                </div>

                {/* Flash sukses */}
                {flash.status && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#e6f7ef] p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#0d7a52]">check_circle</span>
                        <p className="text-sm text-[#0d7a52]">{flash.status}</p>
                    </div>
                )}

                {/* Flash gagal */}
                {pesanError && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#ba1a1a]">error</span>
                        <p className="text-sm text-[#93000a]">{pesanError}</p>
                    </div>
                )}

                {/* 4 kartu statistik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">Total Pengadaan</span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#d5e3fc]/60 text-[#022448]">
                                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-bold tracking-tight text-[#131b2e]">
                                {countSemua} <span className="text-xs font-semibold text-[#515f74]">Paket</span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {rupiah(totalEstimasi)}
                            </div>
                        </div>
                    </div>
                    {[
                        {
                            label: 'Menunggu Persetujuan',
                            nilai: countMenunggu,
                            satuan: 'Usulan',
                            ikon: 'hourglass_top',
                            ikonKelas: 'bg-[#fff4d6] text-[#8a6100]',
                            nilaiKelas: 'text-[#8a6100]',
                            catatan: 'Tahap verifikasi PPK & Pimpinan',
                        },
                        {
                            label: 'Sedang Diproses',
                            nilai: countDiproses,
                            satuan: 'Paket',
                            ikon: 'sync',
                            ikonKelas: 'bg-[#f2f3ff] text-[#0d5fbf]',
                            nilaiKelas: 'text-[#0d5fbf]',
                            catatan: 'Pengadaan aktif / Tender berjalan',
                        },
                        {
                            label: 'Pengadaan Selesai',
                            nilai: countSelesai,
                            satuan: 'Paket',
                            ikon: 'task_alt',
                            ikonKelas: 'bg-[#e6f7ef] text-[#0d7a52]',
                            nilaiKelas: 'text-[#0d7a52]',
                            catatan: 'BAST terbit & aset terdaftar',
                        },
                    ].map((k) => (
                        <div key={k.label} className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">{k.label}</span>
                                <div className={`flex size-8 items-center justify-center rounded-lg ${k.ikonKelas}`}>
                                    <span className="material-symbols-outlined text-lg">{k.ikon}</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className={`text-2xl font-bold tracking-tight ${k.nilaiKelas}`}>
                                    {k.nilai} <span className="text-xs font-semibold text-[#515f74]">{k.satuan}</span>
                                </div>
                                <div className="mt-1 text-xs font-medium text-[#515f74]">{k.catatan}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Panel utama: tab + filter + tabel */}
                <div className="overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e7ff] px-5 pt-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-3">
                            {Object.entries(tabLabel).map(([kunci, label]) => (
                                <Link
                                    key={kunci}
                                    href={urlDengan(['page'], { tab: kunci })}
                                    className={cn(
                                        'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors',
                                        tab === kunci
                                            ? 'bg-[#022448] font-bold text-white shadow-xs'
                                            : 'font-semibold text-[#515f74] hover:bg-[#f2f3ff]',
                                    )}
                                >
                                    {label} ({tabCount[kunci] ?? 0})
                                </Link>
                            ))}
                        </div>
                        <div className="pb-3 text-xs text-[#515f74]">
                            Sinkronisasi SAP:{' '}
                            <span className="font-medium text-[#131b2e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                        </div>
                    </div>

                    {/* Filter */}
                    <form
                        className="flex flex-wrap items-center gap-3 border-b border-[#e2e7ff] bg-[#f2f3ff]/50 p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            gantiFilter({ cari, jenis, status });
                        }}
                    >
                        <div className="relative flex min-w-[240px] max-w-md flex-1 items-center">
                            <span className="pointer-events-none absolute left-3 text-lg text-[#515f74]">
                                <span className="material-symbols-outlined">search</span>
                            </span>
                            <Input
                                type="text"
                                name="cari"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari nomor pengadaan, paket, atau pemohon..."
                                className="h-9 w-full bg-white pl-9 text-xs placeholder:text-[#94a3b8]"
                            />
                        </div>
                        <select
                            name="jenis"
                            value={jenis}
                            onChange={(e) => gantiFilter({ jenis: e.target.value })}
                            className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs font-medium text-[#515f74]"
                        >
                            <option value="">Semua Jenis Pengadaan</option>
                            {(jeniss ?? []).map((j) => (
                                <option key={j.id} value={String(j.id)}>
                                    {j.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="status"
                            value={status}
                            onChange={(e) => gantiFilter({ status: e.target.value })}
                            className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs font-medium text-[#515f74]"
                        >
                            <option value="">Semua Status</option>
                            {daftarStatus.map(([v, l]) => (
                                <option key={v} value={v}>
                                    {l}
                                </option>
                            ))}
                        </select>
                        <a href={URL_INDEX} className="flex h-9 items-center gap-1 px-3 text-xs font-medium text-[#515f74] transition-colors hover:text-[#022448]">
                            <span className="material-symbols-outlined text-base">restart_alt</span>
                            Reset
                        </a>
                    </form>

                    {/* Tabel */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-[#e2e7ff] bg-[#f2f3ff]/70 text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                                <tr>
                                    <th className="p-3.5">No. Pengadaan</th>
                                    <th className="p-3.5">Tanggal</th>
                                    <th className="p-3.5">Nama Paket &amp; Lingkup</th>
                                    <th className="p-3.5">Jenis</th>
                                    <th className="p-3.5">Estimasi Biaya</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff] text-[#131b2e]">
                                {(data?.data ?? []).map((p) => {
                                    const st = pesanStatus[p.status] ?? pesanStatus.draft;
                                    const paket = p.detail?.[0];
                                    return (
                                        <tr key={p.id} className="transition-colors hover:bg-[#f2f3ff]/40">
                                            <td className="p-3.5 font-bold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {p.nomor_pengadaan}
                                            </td>
                                            <td className="p-3.5 text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {tanggalIndo(p.tanggal_pengajuan)}
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-bold">{paket?.nama_barang ?? '-'}</div>
                                                <div className="mt-0.5 text-[11px] text-[#515f74]">{potong(p.alasan)}</div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="rounded bg-[#f2f3ff] px-2 py-0.5 text-[11px] font-medium text-[#515f74]">
                                                    {p.jenis?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {rupiah((p.detail ?? []).reduce((a, d) => a + Number(d.subtotal ?? 0), 0))}
                                            </td>
                                            <td className="p-3.5">
                                                <Badge varian={st.varian}>
                                                    <span className="material-symbols-outlined text-sm">{st.ikon}</span>
                                                    {st.label}
                                                </Badge>
                                            </td>
                                            <td className="whitespace-nowrap p-3.5 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="Detail"
                                                        onClick={() => bukaRincian(p.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-[#e2e7ff] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#022448] shadow-xs transition-colors hover:bg-[#d5e3fc]/50"
                                                    >
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                        Detail
                                                    </button>
                                                    {p.status === 'draft' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                title="Kirim Pengajuan"
                                                                onClick={() => kirimDraft(p.id)}
                                                                className="rounded-lg p-1.5 text-[#022448] transition-colors hover:bg-[#d5e3fc]/50"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">send</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Hapus Draft"
                                                                onClick={() => hapusDraft(p.id, p.nomor_pengadaan)}
                                                                className="rounded-lg p-1.5 text-[#515f74] transition-colors hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(data?.data ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-sm text-[#515f74]">
                                            Belum ada data pengadaan pada tab ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer tabel: info jumlah, per halaman, dan nomor halaman */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] p-4 text-xs text-[#515f74] sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span>
                                Menampilkan{' '}
                                <strong className="text-[#131b2e]">
                                    {data?.from ?? 0} - {data?.to ?? 0}
                                </strong>{' '}
                                dari <strong className="text-[#131b2e]">{data?.total ?? 0}</strong> paket pengadaan
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center gap-1">
                                <select
                                    value={String(perHalaman)}
                                    onChange={(e) => gantiFilter({ per_halaman: e.target.value })}
                                    className="rounded border border-[#e2e7ff] bg-white px-1.5 py-0.5 text-xs font-medium text-[#131b2e]"
                                    aria-label="Baris per halaman"
                                >
                                    {[10, 25, 50].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                                baris
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {halamanAktif <= 1 ? (
                                <span className="rounded border border-[#e2e7ff] p-1.5 text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </span>
                            ) : (
                                <Link href={urlDengan([], { page: String(halamanAktif - 1) })} className="rounded border border-[#e2e7ff] p-1.5 hover:bg-[#f2f3ff]" preserveScroll>
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </Link>
                            )}
                            {daftarHalaman.map((hal) => (
                                <Link
                                    key={hal}
                                    href={urlDengan([], { page: String(hal) })}
                                    preserveScroll
                                    className={
                                        hal === halamanAktif
                                            ? 'rounded bg-[#022448] px-2.5 py-1 font-bold text-white'
                                            : 'rounded border border-[#e2e7ff] px-2.5 py-1 font-medium hover:bg-[#f2f3ff]'
                                    }
                                >
                                    {hal}
                                </Link>
                            ))}
                            {halamanAktif >= halamanTerakhir ? (
                                <span className="rounded border border-[#e2e7ff] p-1.5 text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </span>
                            ) : (
                                <Link href={urlDengan([], { page: String(halamanAktif + 1) })} className="rounded border border-[#e2e7ff] p-1.5 hover:bg-[#f2f3ff]" preserveScroll>
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </Link>
                            )}
                        </div>
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
                            <span className="size-2 rounded-full bg-emerald-500" /> Operasional Aktif
                        </span>
                        <span>•</span>
                        <span>Hak Cipta © 2026</span>
                    </div>
                </footer>
            </div>

            {/* Drawer rincian pengadaan */}
            {rincian && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div className="flex h-full max-w-2xl flex-col overflow-hidden border-l border-[#e2e7ff] bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-[#e2e7ff] bg-[#f2f3ff]/40 p-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-[#1e3a5f] px-2 py-0.5 text-xs font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {rincian.nomor || '-'}
                                    </span>
                                    <Badge varian={(pesanStatus[rincian.status] ?? pesanStatus.draft).varian}>
                                        {(pesanStatus[rincian.status] ?? pesanStatus.draft).label}
                                    </Badge>
                                </div>
                                <h2 className="mt-1 text-base font-bold text-[#131b2e]">
                                    {(rincian.detail[0]?.nama ?? '-') +
                                        (rincian.detail.length > 1 ? ` (+${rincian.detail.length - 1} item)` : '')}
                                </h2>
                                <p className="text-xs text-[#515f74]">
                                    Diajukan oleh:{' '}
                                    <strong className="text-[#131b2e]">
                                        {rincian.pengaju ?? '-'}
                                        {rincian.tanggal ? ` • ${rincian.tanggal}` : ''}
                                    </strong>
                                </p>
                            </div>
                            <Button type="button" onClick={tutupRincian} variant="ghost" className="rounded-lg p-1.5 text-[#515f74] hover:bg-[#e2e7ff] hover:text-[#022448]">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </Button>
                        </div>

                        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                            {/* 1. Spesifikasi */}
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                        <span className="material-symbols-outlined text-lg">devices</span>
                                        1. Spesifikasi Teknis Barang
                                    </h3>
                                    <span className="text-[11px] font-medium text-[#515f74]">{rincian.detail.length} Item Total</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-[#e2e7ff]">
                                    <table className="w-full text-xs">
                                        <thead className="border-b border-[#e2e7ff] bg-[#f2f3ff] font-semibold text-[#515f74]">
                                            <tr>
                                                <th className="p-2.5 text-left">Komponen / Spesifikasi</th>
                                                <th className="p-2.5 text-center">Jumlah</th>
                                                <th className="p-2.5 text-right">Harga Satuan</th>
                                                <th className="p-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e2e7ff] text-[#131b2e]">
                                            {rincian.detail.map((it, i) => (
                                                <tr key={i}>
                                                    <td className="p-2.5">
                                                        <div className="font-semibold">{it.nama}</div>
                                                        <div className="text-[11px] text-[#515f74]">{it.spesifikasi ?? '-'}</div>
                                                    </td>
                                                    <td className="p-2.5 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                        {it.jumlah} {it.satuan ?? ''}
                                                    </td>
                                                    <td className="p-2.5 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                        {rupiah(it.harga)}
                                                    </td>
                                                    <td className="p-2.5 text-right font-bold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                        {rupiah(it.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-[#e2e7ff] bg-[#f2f3ff]/70 font-semibold">
                                            <tr>
                                                <td className="p-2.5 text-right text-[#515f74]" colSpan={3}>
                                                    Total Estimasi RAB:
                                                </td>
                                                <td className="p-2.5 text-right font-bold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {rupiah(rincian.total)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-[#f2f3ff]/60 p-3 text-xs">
                                    <span className="material-symbols-outlined text-lg text-[#515f74]">description</span>
                                    <span className="text-[#515f74]">{rincian.alasan ?? '-'}</span>
                                </div>
                            </section>

                            {/* 2. Dokumen */}
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                        <span className="material-symbols-outlined text-lg">folder_open</span>
                                        2. Dokumen &amp; Berkas Terlampir
                                    </h3>
                                    <span className="text-[11px] font-medium text-[#515f74]">{rincian.dokumen.length} Berkas Sah</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {rincian.dokumen.length === 0 && <p className="text-xs text-[#515f74]">Belum ada dokumen terlampir.</p>}
                                    {rincian.dokumen.map((dok, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg border border-[#e2e7ff] bg-white p-3 transition-colors hover:bg-[#f2f3ff]/40">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">picture_as_pdf</span>
                                                <div className="text-xs font-semibold text-[#131b2e]">{dok.nama}</div>
                                            </div>
                                            <a
                                                href={dok.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded border border-[#e2e7ff] px-2.5 py-1 text-xs font-semibold text-[#022448] hover:bg-[#d5e3fc]/60"
                                            >
                                                <span className="material-symbols-outlined text-base">download</span>
                                                Unduh
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 3. Riwayat */}
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                        <span className="material-symbols-outlined text-lg">history</span>
                                        3. Riwayat Persetujuan &amp; Alur Kerja
                                    </h3>
                                </div>
                                {rincian.riwayat.length === 0 && <p className="text-xs text-[#515f74]">Belum ada riwayat.</p>}
                                <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-[#e2e7ff]">
                                    {rincian.riwayat.map((r, i) => (
                                        <div key={i} className="relative flex items-start gap-3">
                                            <span className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-100" />
                                            <div>
                                                <div className="text-xs font-bold text-[#131b2e]">{String(r.status).replaceAll('_', ' ')}</div>
                                                <div className="text-[11px] text-[#515f74]">
                                                    {r.waktu ?? ''} • Oleh <strong className="text-[#131b2e]">{r.oleh ?? '-'}</strong>
                                                </div>
                                                {r.catatan && (
                                                    <p className="mt-1 rounded border border-emerald-200/60 bg-emerald-50 p-2 text-[11px] text-[#0d7a52]">
                                                        {r.catatan}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-[#e2e7ff] bg-[#f2f3ff]/40 p-4">
                            <button
                                type="button"
                                onClick={tutupRincian}
                                className="rounded-lg border border-[#e2e7ff] bg-white px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                            >
                                Tutup
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e7ff] bg-white px-3 py-2 text-xs font-semibold text-[#022448] transition-colors hover:bg-[#d5e3fc]/50"
                                >
                                    <span className="material-symbols-outlined text-base">print</span>
                                    Cetak Formulir
                                </button>
                                <a
                                    href={rincianId ? `/pengelolaan/pengadaan/${rincianId}/ekspor-rincian` : '#'}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#022448] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                                >
                                    <span className="material-symbols-outlined text-base">download_for_offline</span>
                                    Unduh Dokumen Lengkap
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
