import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Paginator } from '@/components/sarpra/pagination';
import * as perencanaan from '@/routes/perencanaan';

type Opsi = { id: number; name: string };

type BarisPerencanaan = {
    id: number;
    nama_kebutuhan: string;
    alasan?: string | null;
    jumlah: number;
    status: string;
    kategori_barang_id: number;
    periode_id: number;
    satuan_id: number;
    kategori?: Opsi | null;
    satuan?: Opsi | null;
    prioritas?: Opsi | null;
    periode?: Opsi | null;
    user?: { name: string } | null;
    created_at?: string | null;
};

type PageProps = {
    menuAktif?: string;
    notifBelumDibaca?: number;
    data: Paginator<BarisPerencanaan>;
    totalUsulan: number;
    prioritasTinggi: number;
    draft: number;
    diajukan: number;
    kategoris: Opsi[];
    periodes: Opsi[];
    satuans: Opsi[];
    prioritass: Opsi[];
    status?: string;
    error?: string;
    errors?: Record<string, string | string[]>;
};

const BASE = '/pengelolaan/perencanaan';

const badgePrioritas: Record<string, string> = {
    Tinggi: 'bg-[#fef2f2] text-[#b91c1c] border-red-200/60',
    Mendesak: 'bg-[#fef2f2] text-[#b91c1c] border-red-200/60',
    Sedang: 'bg-[#fffbeb] text-[#b45309] border-amber-200/60',
    Rendah: 'bg-[#f1f5f9] text-[#475569] border-slate-200/60',
};
const dotPrioritas: Record<string, string> = {
    Tinggi: 'bg-red-600',
    Mendesak: 'bg-red-600',
    Sedang: 'bg-amber-500',
    Rendah: 'bg-slate-400',
};
const badgeFallback = 'bg-[#f1f5f9] text-[#475569] border-slate-200/60';
const dotFallback = 'bg-slate-400';

const PER_HALAMAN = [10, 25, 50];
const PRIORITAS_OPSI = [
    { value: 'Tinggi', label: 'Tinggi', ket: 'Mendesak operasional', warna: 'text-[#dc2626]', kotak: 'border-red-200 bg-red-50/50 hover:bg-red-50' },
    { value: 'Sedang', label: 'Sedang', ket: 'Kebutuhan reguler', warna: 'text-amber-700', kotak: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50' },
    { value: 'Rendah', label: 'Rendah', ket: 'Peremajaan berkala', warna: 'text-slate-700', kotak: 'border-slate-200 bg-slate-50/50 hover:bg-slate-50' },
];

const zeroPad3 = (n: number) => String(n).padStart(3, '0');

type FormState = {
    nama_kebutuhan: string;
    kategori_barang_id: string;
    periode_id: string;
    jumlah: string;
    satuan_id: string;
    prioritas: string;
    alasan: string;
};

const formKosong = (): FormState => ({
    nama_kebutuhan: '',
    kategori_barang_id: '',
    periode_id: '',
    jumlah: '1',
    satuan_id: '',
    prioritas: 'Tinggi',
    alasan: '',
});

export default function Perencanaan() {
    const { props } = usePage<PageProps>();
    const { data, totalUsulan, prioritasTinggi, draft, diajukan, kategoris, periodes, satuans } = props;

    const paramQuery = new URLSearchParams(window.location.search);
    const [cari, setCari] = useState(paramQuery.get('cari') ?? '');
    const [filterKategori, setFilterKategori] = useState(paramQuery.get('kategori') ?? '');
    const [filterPeriode, setFilterPeriode] = useState(paramQuery.get('periode') ?? '');
    const [filterStatus, setFilterStatus] = useState(paramQuery.get('status') ?? '');
    const [perHalaman, setPerHalaman] = useState(paramQuery.get('per_halaman') ?? '10');

    const [modalBuka, setModalBuka] = useState(false);
    const [ubahId, setUbahId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(formKosong());
    const [menyimpan, setMenyimpan] = useState(false);

    const [detail, setDetail] = useState<{
        nama: string;
        kategori: string;
        jumlah: string;
        prioritas: string;
        periode: string;
        alasan: string;
        pengusul: string;
    } | null>(null);

    const daftarError = Object.values(props.errors ?? {}).filter(Boolean);
    const errorPertama = daftarError.length ? String(daftarError[0]) : null;
    const statusFlash = typeof props.status === 'string' ? props.status : null;
    const errorFlash = typeof props.error === 'string' ? props.error : null;

    const tahunIni = new Date().getFullYear();

    const filterQuery = () => ({
        cari: cari.trim(),
        kategori: filterKategori,
        periode: filterPeriode,
        status: filterStatus,
    });

    const kirimFilter = (ekstra: Record<string, string> = {}) => {
        router.get(
            BASE,
            { ...filterQuery(), ...ekstra },
            { preserveState: true, preserveScroll: true },
        );
    };

    const hrefEkspor = () => {
        const qs = new URLSearchParams(
            Object.entries(filterQuery()).filter(([, v]) => v !== '') as Array<[string, string]>,
        ).toString();
        return `${perencanaan.ekspor.url()}${qs ? `?${qs}` : ''}`;
    };

    const bukaTambah = () => {
        setUbahId(null);
        setForm(formKosong());
        setModalBuka(true);
    };

    const bukaUbah = (b: BarisPerencanaan) => {
        setUbahId(b.id);
        setForm({
            nama_kebutuhan: b.nama_kebutuhan,
            kategori_barang_id: String(b.kategori_barang_id),
            periode_id: String(b.periode_id),
            jumlah: String(b.jumlah),
            satuan_id: String(b.satuan_id),
            prioritas: b.prioritas?.name ?? 'Tinggi',
            alasan: b.alasan ?? '',
        });
        setModalBuka(true);
    };

    const simpan = (e: FormEvent) => {
        e.preventDefault();
        setMenyimpan(true);
        const selesai = () => {
            setMenyimpan(false);
            setModalBuka(false);
        };
        if (ubahId) {
            router.put(perencanaan.update.url({ perencanaan: ubahId }), form, { onSuccess: selesai, onFinish: () => setMenyimpan(false) });
        } else {
            router.post(perencanaan.store.url(), form, { onSuccess: selesai, onFinish: () => setMenyimpan(false) });
        }
    };

    const hapus = (b: BarisPerencanaan) => {
        if (window.confirm(`Hapus usulan ${b.nama_kebutuhan}?`)) {
            router.delete(perencanaan.destroy.url({ perencanaan: b.id }), { preserveScroll: true });
        }
    };

    const ajukan = (b: BarisPerencanaan) => {
        router.post(perencanaan.ajukan.url({ perencanaan: b.id }), {}, { preserveScroll: true });
    };

    // Pagination ala Blade: jendela halaman current-1 s/d current+1.
    const current = data.current_page ?? 1;
    const last = data.last_page ?? 1;
    const ambilUrl = (halaman: number) =>
        data.links?.find((l) => l.url !== null && l.label === String(halaman))?.url ?? null;
    const urlPrev = data.links?.[0]?.url ?? null;
    const urlNext = data.links?.[data.links.length - 1]?.url ?? null;
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

    const pilihPerHalaman = (n: number) => {
        const q = new URLSearchParams(window.location.search);
        q.delete('page');
        q.set('per_halaman', String(n));
        setPerHalaman(String(n));
        router.get(`${BASE}?${q.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Perencanaan Kebutuhan" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Judul */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Perencanaan Kebutuhan</h1>
                            <span className="rounded-full bg-[#1e3a5f] px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
                                T.A. {tahunIni} / {tahunIni + 1}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-[#515f74]">
                            Rencana usulan pengadaan dan peremajaan sarana prasarana tahun anggaran mendatang.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={hrefEkspor()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e7ff] bg-white px-3 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-colors hover:bg-[#f1f5f9] hover:text-[#022448]"
                        >
                            <span className="material-symbols-outlined text-base">file_download</span> Unduh Rekap (CSV)
                        </a>
                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#022448] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1e3a5f]"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>Tambah Kebutuhan
                        </button>
                    </div>
                </div>

                {statusFlash && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#ecfdf5] p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-emerald-600">check_circle</span>
                        <p className="text-sm text-emerald-800">{statusFlash}</p>
                    </div>
                )}
                {(errorFlash || errorPertama) && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#ba1a1a]">error</span>
                        <p className="text-sm text-[#93000a]">{errorFlash ?? errorPertama}</p>
                    </div>
                )}

                {/* Statistik */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#515f74]">Total Usulan</p>
                            <h3 className="mt-0.5 text-xl font-extrabold text-[#0f172a]">
                                {totalUsulan} <span className="text-xs font-medium text-[#515f74]">Usulan</span>
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#022448]">
                            <span className="material-symbols-outlined text-[22px]">assignment</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#515f74]">Prioritas Tinggi</p>
                            <h3 className="mt-0.5 text-xl font-extrabold text-[#dc2626]">
                                {prioritasTinggi} <span className="text-xs font-medium text-[#515f74]">Kebutuhan</span>
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#dc2626]">
                                <span className="material-symbols-outlined text-xs">priority_high</span> Mendesak operasional
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#dc2626]">
                            <span className="material-symbols-outlined text-[22px]">error</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#515f74]">Perlu Kelengkapan Data</p>
                            <h3 className="mt-0.5 text-xl font-extrabold text-[#0f172a]">
                                {draft} <span className="text-xs font-medium text-[#515f74]">Draft</span>
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#515f74]">
                            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#515f74]">Sudah Diajukan</p>
                            <h3 className="mt-0.5 text-xl font-extrabold text-[#022448]">
                                {diajukan} <span className="text-xs font-medium text-[#515f74]">Terkirim</span>
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Menunggu persetujuan
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-[22px]">send</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        kirimFilter();
                    }}
                    className="mt-4 flex flex-col items-stretch gap-2 rounded-xl border border-[#e2e7ff] bg-white p-3 shadow-xs md:flex-row md:items-center"
                >
                    <div className="relative flex min-w-[260px] flex-1 items-center">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-[#515f74]">search</span>
                        <input
                            type="text"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari nama kebutuhan atau catatan..."
                            className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-9 pr-3 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterKategori}
                        onChange={(e) => {
                            setFilterKategori(e.target.value);
                            kirimFilter({ kategori: e.target.value });
                        }}
                        className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                    >
                        <option value="">Semua Kategori</option>
                        {kategoris.map((k) => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterPeriode}
                        onChange={(e) => {
                            setFilterPeriode(e.target.value);
                            kirimFilter({ periode: e.target.value });
                        }}
                        className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                    >
                        <option value="">Semua Periode</option>
                        {periodes.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            kirimFilter({ status: e.target.value });
                        }}
                        className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-medium text-[#0f172a] focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="diajukan">Diajukan</option>
                    </select>
                    <button
                        type="button"
                        title="Reset Filter"
                        onClick={() => {
                            setCari('');
                            setFilterKategori('');
                            setFilterPeriode('');
                            setFilterStatus('');
                            router.get(BASE, {}, { preserveState: true, preserveScroll: true });
                        }}
                        className="flex h-9 items-center justify-center rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]"
                    >
                        <span className="material-symbols-outlined text-lg leading-none">filter_alt_off</span>
                    </button>
                </form>

                {/* Tabel */}
                <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] font-bold uppercase tracking-wider text-[#515f74]">
                                    <th className="w-12 px-3 py-3 text-center">No</th>
                                    <th className="min-w-[280px] px-4 py-3">Nama Kebutuhan &amp; Spesifikasi</th>
                                    <th className="min-w-[150px] px-4 py-3">Kategori</th>
                                    <th className="min-w-[110px] px-4 py-3 text-center">Jumlah</th>
                                    <th className="min-w-[120px] px-4 py-3 text-center">Prioritas</th>
                                    <th className="min-w-[130px] px-4 py-3">Periode</th>
                                    <th className="min-w-[110px] px-4 py-3 text-center">Status</th>
                                    <th className="min-w-[130px] px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff] text-xs text-[#0f172a]">
                                {data.data.map((b, i) => {
                                    const no = String((data.from ?? 1) + i).padStart(2, '0');
                                    const tahunBaris = b.created_at ? new Date(b.created_at).getFullYear() : tahunIni;
                                    return (
                                        <tr key={b.id} className="transition-colors hover:bg-[#f1f5f9]/60">
                                            <td className="px-3 py-3.5 text-center font-medium text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {no}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold">{b.nama_kebutuhan}</div>
                                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#515f74]">{b.alasan}</p>
                                                <span className="mt-0.5 block text-[10px] text-[#94a3b8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    Kode: PRN-{tahunBaris}-{zeroPad3(b.id)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="rounded-full border border-blue-200/50 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                    {b.kategori?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-extrabold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{b.jumlah}</span>{' '}
                                                <span className="text-[11px] text-[#515f74]">{b.satuan?.name ?? ''}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgePrioritas[b.prioritas?.name ?? ''] ?? badgeFallback}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${dotPrioritas[b.prioritas?.name ?? ''] ?? dotFallback}`} />
                                                    {b.prioritas?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-[#515f74]">{b.periode?.name ?? '-'}</td>
                                            <td className="px-4 py-3.5 text-center">
                                                {b.status === 'diajukan' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-bold text-[#047857]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Diajukan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    {b.status === 'draft' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                title="Edit Rencana"
                                                                onClick={() => bukaUbah(b)}
                                                                className="p-1 text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#022448] rounded"
                                                            >
                                                                <span className="material-symbols-outlined text-[17px]">edit</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Hapus"
                                                                onClick={() => hapus(b)}
                                                                className="rounded p-1 text-[#515f74] transition-colors hover:bg-red-50 hover:text-[#dc2626]"
                                                            >
                                                                <span className="material-symbols-outlined text-[17px]">delete</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Ajukan Usulan"
                                                                onClick={() => ajukan(b)}
                                                                className="rounded p-1 text-[#022448] transition-colors hover:bg-[#d5e3fc]"
                                                            >
                                                                <span className="material-symbols-outlined text-[17px]">send</span>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Detail Pengajuan"
                                                            onClick={() =>
                                                                setDetail({
                                                                    nama: b.nama_kebutuhan,
                                                                    kategori: b.kategori?.name ?? '-',
                                                                    jumlah: `${b.jumlah} ${b.satuan?.name ?? ''}`.trim(),
                                                                    prioritas: b.prioritas?.name ?? '-',
                                                                    periode: b.periode?.name ?? '-',
                                                                    alasan: b.alasan ?? '-',
                                                                    pengusul: b.user?.name ?? '-',
                                                                })
                                                            }
                                                            className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                                        >
                                                            <span className="material-symbols-outlined text-[17px]">visibility</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#515f74]">
                                            Belum ada usulan kebutuhan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] bg-[#f1f5f9] px-6 py-3.5 text-xs text-[#515f74] sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span>
                                Menampilkan{' '}
                                <strong className="text-[#0f172a]">{data.from ?? 0} - {data.to ?? 0}</strong> dari{' '}
                                <strong className="text-[#0f172a]">{(data.total ?? 0).toLocaleString('id-ID')}</strong> usulan kebutuhan
                            </span>
                            <span className="text-[#94a3b8]">|</span>
                            <label className="flex items-center gap-1">
                                Tampilkan
                                <select
                                    value={perHalaman}
                                    onChange={(e) => pilihPerHalaman(Number(e.target.value))}
                                    className="rounded border border-[#e2e7ff] bg-white px-1.5 py-0.5 text-xs font-medium text-[#0f172a] focus:outline-none"
                                >
                                    {PER_HALAMAN.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex items-center gap-1">
                            {urlPrev ? (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        keUrl(urlPrev);
                                    }}
                                    className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-[#f1f5f9]"
                                >
                                    Sebelumnya
                                </a>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] px-2.5 py-1 text-xs font-semibold text-[#94a3b8]">Sebelumnya</span>
                            )}
                            {Array.from({ length: Math.min(last, current + 1) - Math.max(1, current - 1) + 1 }).map((_, idx) => {
                                const halaman = Math.max(1, current - 1) + idx;
                                const url = ambilUrl(halaman);
                                return halaman === current ? (
                                    <span key={halaman} className="rounded bg-[#022448] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
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
                                        className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 font-semibold text-xs transition-colors hover:bg-[#f1f5f9]"
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
                                    className="rounded border border-[#e2e7ff] bg-white px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-[#f1f5f9]"
                                >
                                    Selanjutnya
                                </a>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] px-2.5 py-1 text-xs font-semibold text-[#94a3b8]">Selanjutnya</span>
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

            {/* Modal tambah/ubah */}
            {modalBuka && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b border-[#e2e7ff] bg-[#f1f5f9] px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[22px] text-[#022448]">post_add</span>
                                <h2 className="text-base font-bold text-[#0f172a]">
                                    {ubahId ? 'Ubah Usulan Kebutuhan' : 'Formulir Usulan Perencanaan Kebutuhan'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalBuka(false)}
                                className="rounded-lg p-1 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#0f172a]"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={simpan} className="space-y-4 overflow-y-auto p-6 text-xs">
                            <div>
                                <label className="mb-1 block font-bold text-[#0f172a]">
                                    Nama Barang / Kebutuhan <span className="text-[#dc2626]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={150}
                                    value={form.nama_kebutuhan}
                                    onChange={(e) => setForm({ ...form, nama_kebutuhan: e.target.value })}
                                    placeholder="Contoh: Laptop Administrasi Staf (Core i5, 16GB RAM)"
                                    className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs text-[#0f172a] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#0f172a]">
                                        Kategori <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.kategori_barang_id}
                                        onChange={(e) => setForm({ ...form, kategori_barang_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs text-[#0f172a] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {kategoris.map((k) => (
                                            <option key={k.id} value={k.id}>{k.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#0f172a]">
                                        Periode Kebutuhan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.periode_id}
                                        onChange={(e) => setForm({ ...form, periode_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs text-[#0f172a] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Periode --</option>
                                        {periodes.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#0f172a]">
                                        Jumlah <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={form.jumlah}
                                        onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs text-[#0f172a] focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#0f172a]">
                                        Satuan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.satuan_id}
                                        onChange={(e) => setForm({ ...form, satuan_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs text-[#0f172a] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Satuan --</option>
                                        {satuans.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block font-bold text-[#0f172a]">
                                    Prioritas <span className="text-[#dc2626]">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    {PRIORITAS_OPSI.map((p) => (
                                        <label key={p.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 ${p.kotak}`}>
                                            <input
                                                type="radio"
                                                name="prioritas"
                                                value={p.value}
                                                checked={form.prioritas === p.value}
                                                onChange={() => setForm({ ...form, prioritas: p.value })}
                                            />
                                            <div>
                                                <span className={`block text-xs font-bold ${p.warna}`}>{p.label}</span>
                                                <span className="block text-[10px] text-[#515f74]">{p.ket}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block font-bold text-[#0f172a]">
                                    Alasan Kebutuhan / Keterangan <span className="text-[#dc2626]">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.alasan}
                                    onChange={(e) => setForm({ ...form, alasan: e.target.value })}
                                    placeholder="Jelaskan alasan dan rincian kebutuhan sarana prasarana..."
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] p-2.5 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="-mx-6 -mb-6 mt-2 flex items-center justify-between gap-2 border-t border-[#e2e7ff] bg-[#f1f5f9] px-6 py-3.5">
                                <button
                                    type="button"
                                    onClick={() => setModalBuka(false)}
                                    className="rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:text-[#0f172a]"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-lg bg-[#022448] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1e3a5f] disabled:opacity-60"
                                >
                                    {menyimpan ? 'Menyimpan...' : 'Simpan Kebutuhan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal detail */}
            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex w-full max-w-lg flex-col rounded-xl border border-[#e2e7ff] bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b border-[#e2e7ff] bg-[#f1f5f9] px-6 py-4">
                            <h2 className="text-base font-bold text-[#0f172a]">Detail Usulan Kebutuhan</h2>
                            <button
                                type="button"
                                onClick={() => setDetail(null)}
                                className="rounded-lg p-1 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#0f172a]"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 p-6 text-xs">
                            <dt className="font-medium text-[#515f74]">Kebutuhan</dt>
                            <dd className="col-span-2 font-semibold text-[#0f172a]">{detail.nama}</dd>
                            <dt className="font-medium text-[#515f74]">Kategori</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.kategori}</dd>
                            <dt className="font-medium text-[#515f74]">Jumlah</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.jumlah}</dd>
                            <dt className="font-medium text-[#515f74]">Prioritas</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.prioritas}</dd>
                            <dt className="font-medium text-[#515f74]">Periode</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.periode}</dd>
                            <dt className="font-medium text-[#515f74]">Alasan</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.alasan}</dd>
                            <dt className="font-medium text-[#515f74]">Pengusul</dt>
                            <dd className="col-span-2 text-[#0f172a]">{detail.pengusul}</dd>
                        </dl>
                    </div>
                </div>
            )}
        </>
    );
}
