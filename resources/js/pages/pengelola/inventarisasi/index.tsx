import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Paginator } from '@/components/sarpra/pagination';
import * as inventarisasi from '@/routes/inventarisasi';

type Opsi = { id: number; name: string };

type BarangRow = {
    id: number;
    kode_barang: string;
    nama_barang: string;
    merk?: string | null;
    spesifikasi?: string | null;
    jumlah: number;
    satuan_id: number;
    kategori_barang_id: number;
    lokasi_id: number;
    kondisi_barang_id: number;
    status_barang_id: number;
    satuan?: Opsi | null;
    kategori?: Opsi | null;
    lokasi?: Opsi | null;
    kondisi?: Opsi | null;
    status?: Opsi | null;
    tahun_perolehan?: number | null;
    sumber_perolehan?: string | null;
    harga_perolehan?: number | string | null;
    updated_at?: string | null;
};

type PageProps = {
    menuAktif?: string;
    notifBelumDibaca?: number;
    data: Paginator<BarangRow>;
    totalUnit: number;
    baik: number;
    ringan: number;
    berat: number;
    jumlahKategori: number;
    kategoris: Opsi[];
    lokasis: Opsi[];
    satuans: Opsi[];
    kondisis: Opsi[];
    statuss: Opsi[];
    status?: string;
    error?: string;
    errors?: Record<string, string | string[]>;
};

const BASE = '/pengelolaan/inventarisasi';
const PER_HALAMAN = [10, 25, 50];

const kondisiBadge: Record<string, { kelas: string; dot: string }> = {
    Baik: { kelas: 'bg-[#dcfce7] text-[#16a34a] border-[#86efac]', dot: 'bg-[#16a34a]' },
    'Rusak Ringan': { kelas: 'bg-[#fef3c7] text-[#d97706] border-[#fcd34d]', dot: 'bg-[#d97706]' },
    'Rusak Berat': { kelas: 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]', dot: 'bg-[#dc2626]' },
};
const kondisiFallback = { kelas: 'bg-[#f1f5f9] text-[#515f74] border-transparent', dot: 'bg-[#94a3b8]' };

const BULAN = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

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

const ribuan = (n: number) => n.toLocaleString('id-ID');
const desimal = (n: number) =>
    n.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
const limitTeks = (teks: string | null | undefined, batas: number) => {
    if (!teks) {
        return '';
    }
    return teks.length > batas ? `${teks.slice(0, batas)}...` : teks;
};

type FormState = {
    nama_barang: string;
    merk: string;
    kategori_barang_id: string;
    lokasi_id: string;
    status_barang_id: string;
    kondisi_barang_id: string;
    jumlah: string;
    satuan_id: string;
    harga_perolehan: string;
    tahun_perolehan: string;
    sumber_perolehan: string;
    spesifikasi: string;
};

export default function Inventarisasi() {
    const { props } = usePage<PageProps>();
    const {
        data, totalUnit, baik, ringan, berat, jumlahKategori,
        kategoris, lokasis, satuans, kondisis, statuss,
    } = props;

    const paramQuery = new URLSearchParams(window.location.search);
    const [cari, setCari] = useState(paramQuery.get('cari') ?? '');
    const [filterKategori, setFilterKategori] = useState(paramQuery.get('kategori') ?? '');
    const [filterLokasi, setFilterLokasi] = useState(paramQuery.get('lokasi') ?? '');
    const [filterKondisi, setFilterKondisi] = useState(paramQuery.get('kondisi') ?? '');
    const [filterStatus, setFilterStatus] = useState(paramQuery.get('status') ?? '');
    const [perHalaman, setPerHalaman] = useState(paramQuery.get('per_halaman') ?? '10');

    const idKondisiBaik = kondisis.find((k) => k.name === 'Baik')?.id;
    const formKosong = (): FormState => ({
        nama_barang: '',
        merk: '',
        kategori_barang_id: '',
        lokasi_id: '',
        status_barang_id: '',
        kondisi_barang_id: idKondisiBaik ? String(idKondisiBaik) : '',
        jumlah: '1',
        satuan_id: satuans[0] ? String(satuans[0].id) : '',
        harga_perolehan: '',
        tahun_perolehan: String(new Date().getFullYear()),
        sumber_perolehan: '',
        spesifikasi: '',
    });

    const [modalBuka, setModalBuka] = useState(false);
    const [ubahId, setUbahId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(formKosong());
    const [menyimpan, setMenyimpan] = useState(false);
    const fotoRef = useRef<HTMLInputElement>(null);

    const [detail, setDetail] = useState<{
        kode: string;
        nama: string;
        merk: string;
        kategori: string;
        lokasi: string;
        kondisi: string;
        status: string;
        jumlah: string;
        perolehan: string;
        harga: string;
        spesifikasi: string;
    } | null>(null);

    const daftarError = Object.values(props.errors ?? {}).filter(Boolean);
    const errorPertama = daftarError.length ? String(daftarError[0]) : null;
    const statusFlash = typeof props.status === 'string' ? props.status : null;
    const errorFlash = typeof props.error === 'string' ? props.error : null;

    const totalKondisi = baik + ringan + berat;
    const pctBaik = totalKondisi > 0 ? Math.round((baik / totalKondisi) * 1000) / 10 : 0;

    const filterQuery = () => ({
        cari: cari.trim(),
        kategori: filterKategori,
        lokasi: filterLokasi,
        kondisi: filterKondisi,
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
        return `${inventarisasi.ekspor.url()}${qs ? `?${qs}` : ''}`;
    };

    const bukaTambah = () => {
        setUbahId(null);
        setForm(formKosong());
        setModalBuka(true);
    };

    const bukaUbah = (b: BarangRow) => {
        setUbahId(b.id);
        setForm({
            nama_barang: b.nama_barang,
            merk: b.merk ?? '',
            kategori_barang_id: String(b.kategori_barang_id ?? ''),
            lokasi_id: String(b.lokasi_id ?? ''),
            status_barang_id: String(b.status_barang_id ?? ''),
            kondisi_barang_id: String(b.kondisi_barang_id ?? ''),
            jumlah: String(b.jumlah),
            satuan_id: String(b.satuan_id ?? ''),
            harga_perolehan: b.harga_perolehan ? String(b.harga_perolehan) : '',
            tahun_perolehan: b.tahun_perolehan ? String(b.tahun_perolehan) : '',
            sumber_perolehan: b.sumber_perolehan ?? '',
            spesifikasi: b.spesifikasi ?? '',
        });
        setModalBuka(true);
    };

    const simpan = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMenyimpan(true);

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (v !== null && v !== undefined) {
                fd.append(k, v);
            }
        });
        const foto = fotoRef.current?.files?.[0];
        if (foto) {
            fd.append('foto', foto);
        }

        const selesai = () => {
            setMenyimpan(false);
            setModalBuka(false);
        };
        if (ubahId) {
            fd.append('_method', 'PUT');
            router.post(inventarisasi.update.url({ barang: ubahId }), fd, {
                onSuccess: selesai,
                onFinish: () => setMenyimpan(false),
            });
        } else {
            router.post(inventarisasi.store.url(), fd, {
                onSuccess: selesai,
                onFinish: () => setMenyimpan(false),
            });
        }
    };

    const hapus = (b: BarangRow) => {
        if (window.confirm(`Hapus ${b.kode_barang} dari inventaris?`)) {
            router.delete(inventarisasi.destroy.url({ barang: b.id }), { preserveScroll: true });
        }
    };

    // Pagination ala Blade: jendela halaman current-1 s/d current+1 (+ halaman terakhir bila jauh).
    const current = data.current_page ?? 1;
    const last = data.last_page ?? 1;
    const ambilUrl = (halaman: number) =>
        data.links?.find((l) => l.url !== null && l.label === String(halaman))?.url ?? null;
    const urlPrev = data.links?.[0]?.url ?? null;
    const urlNext = data.links?.[data.links.length - 1]?.url ?? null;
    const jendelaAwal = Math.max(1, current - 1);
    const jendelaAkhir = Math.min(last, current + 1);
    const tampilHalamanTerakhir = last > 3 && current < last - 1;
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

    const inputNama = 'text-[#515f74]';

    return (
        <>
            <Head title="Inventarisasi Aset" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Judul */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Inventarisasi Aset</h1>
                            <span
                                className="rounded-full border border-[#e2e7ff] bg-[#d5e3fc] px-2.5 py-0.5 text-xs font-semibold text-[#57657a]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                SARPRA Asset Registry
                            </span>
                        </div>
                        <p className="text-sm text-[#515f74]">
                            Pencatatan, kodifikasi, verifikasi fisik, dan pemantauan kondisi seluruh sarana dan prasarana terpadu.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href={hrefEkspor()}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-all hover:bg-[#f1f5f9] hover:text-[#022448]"
                        >
                            <span className="material-symbols-outlined text-lg">file_download</span>
                            <span>Ekspor Data (CSV)</span>
                        </a>
                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#152e4f]"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>+ Tambah Barang</span>
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
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">Total Barang Inventaris</span>
                            <span className="mt-1 text-2xl font-extrabold text-[#0f172a]">
                                {ribuan(totalUnit)} <span className="text-xs font-medium text-[#515f74]">Unit</span>
                            </span>
                            <span className="mt-1 text-[11px] text-[#515f74]">{jumlahKategori} Kategori Terdaftar</span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d5e3fc]/60 text-[#022448]">
                            <span className="material-symbols-outlined text-2xl">inventory_2</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">Kondisi Baik</span>
                            <span className="mt-1 text-2xl font-extrabold text-[#16a34a]">
                                {ribuan(baik)} <span className="text-xs font-medium text-[#515f74]">Unit</span>
                            </span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#16a34a]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> {desimal(pctBaik)}% Siap Digunakan
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">Rusak Ringan</span>
                            <span className="mt-1 text-2xl font-extrabold text-[#d97706]">
                                {ribuan(ringan)} <span className="text-xs font-medium text-[#515f74]">Unit</span>
                            </span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#d97706]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" /> Perlu Servis / Pemeliharaan
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
                            <span className="material-symbols-outlined text-2xl">build</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">Rusak Berat</span>
                            <span className="mt-1 text-2xl font-extrabold text-[#dc2626]">
                                {ribuan(berat)} <span className="text-xs font-medium text-[#515f74]">Unit</span>
                            </span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#dc2626]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> Usul Penghapusan / Rekondisi
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        kirimFilter();
                    }}
                    className="mt-4 flex flex-col gap-3.5 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex w-full flex-1 items-center">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-[#515f74]">search</span>
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari kode barang, nama inventaris, merk/model..."
                                className="h-10 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-9 pr-8 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                            />
                            {cari !== '' && (
                                <button
                                    type="button"
                                    title="Bersihkan pencarian"
                                    onClick={() => {
                                        setCari('');
                                        kirimFilter({ cari: '' });
                                    }}
                                    className="absolute right-2.5 text-[#515f74] hover:text-[#0f172a]"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto sm:flex-nowrap">
                            <select
                                value={filterKategori}
                                onChange={(e) => {
                                    setFilterKategori(e.target.value);
                                    kirimFilter({ kategori: e.target.value });
                                }}
                                className={`h-10 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs focus:outline-none ${inputNama}`}
                            >
                                <option value="">Semua Kategori</option>
                                {kategoris.map((k) => (
                                    <option key={k.id} value={k.id}>{k.name}</option>
                                ))}
                            </select>
                            <select
                                value={filterLokasi}
                                onChange={(e) => {
                                    setFilterLokasi(e.target.value);
                                    kirimFilter({ lokasi: e.target.value });
                                }}
                                className={`h-10 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs focus:outline-none ${inputNama}`}
                            >
                                <option value="">Semua Lokasi</option>
                                {lokasis.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                            <select
                                value={filterKondisi}
                                onChange={(e) => {
                                    setFilterKondisi(e.target.value);
                                    kirimFilter({ kondisi: e.target.value });
                                }}
                                className={`h-10 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs focus:outline-none ${inputNama}`}
                            >
                                <option value="">Semua Kondisi</option>
                                <option value="Baik">Kondisi Baik</option>
                                <option value="Rusak Ringan">Rusak Ringan</option>
                                <option value="Rusak Berat">Rusak Berat</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    kirimFilter({ status: e.target.value });
                                }}
                                className={`h-10 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs focus:outline-none ${inputNama}`}
                            >
                                <option value="">Semua Status Aset</option>
                                {statuss.map((s) => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                title="Reset Filter"
                                onClick={() => {
                                    setCari('');
                                    setFilterKategori('');
                                    setFilterLokasi('');
                                    setFilterKondisi('');
                                    setFilterStatus('');
                                    router.get(BASE, {}, { preserveState: true, preserveScroll: true });
                                }}
                                className="flex h-10 items-center gap-1 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 text-xs font-semibold text-[#515f74] transition-all hover:bg-[#e2e7ff] hover:text-[#022448]"
                            >
                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tabel */}
                <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] uppercase tracking-wider text-[#515f74]">
                                    <th className="p-3.5 font-bold">Kode Barang</th>
                                    <th className="p-3.5 font-bold">Nama Barang &amp; Spesifikasi</th>
                                    <th className="p-3.5 font-bold">Kategori</th>
                                    <th className="p-3.5 font-bold">Lokasi Penempatan</th>
                                    <th className="p-3.5 text-center font-bold">Kondisi Fisik</th>
                                    <th className="p-3.5 text-center font-bold">Status Operasional</th>
                                    <th className="p-3.5 font-bold">Perolehan / Cek</th>
                                    <th className="p-3.5 pr-5 text-right font-bold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff] text-xs text-[#0f172a]">
                                {data.data.map((b) => {
                                    const kb = kondisiBadge[b.kondisi?.name ?? ''] ?? kondisiFallback;
                                    return (
                                        <tr
                                            key={b.id}
                                            className={`transition-colors hover:bg-[#f1f5f9]/70 ${b.kondisi?.name === 'Rusak Berat' ? 'bg-red-50/20' : ''}`}
                                        >
                                            <td className="p-3.5 font-semibold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {b.kode_barang}
                                            </td>
                                            <td className="p-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{b.nama_barang}</span>
                                                    <span className="mt-0.5 text-[11px] text-[#515f74]">
                                                        {limitTeks(b.merk ? `${b.merk} • ${b.spesifikasi ?? '-'}` : (b.spesifikasi ?? '-'), 70)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                    {b.kategori?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-1.5 text-[#515f74]">
                                                    <span className="material-symbols-outlined text-[15px] text-[#94a3b8]">meeting_room</span>
                                                    <span>{b.lokasi?.name ?? '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${kb.kelas}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${kb.dot}`} /> {b.kondisi?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                    {b.status?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-[#515f74]">
                                                <div className="flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    <span className="text-[11px]">{b.tahun_perolehan ?? '-'}</span>
                                                    <span className="text-[10px] text-[#94a3b8]">Cek: {formatTanggal(b.updated_at)}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5 pr-5 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Detail"
                                                        onClick={() =>
                                                            setDetail({
                                                                kode: b.kode_barang,
                                                                nama: b.nama_barang,
                                                                merk: b.merk ?? '-',
                                                                kategori: b.kategori?.name ?? '-',
                                                                lokasi: b.lokasi?.name ?? '-',
                                                                kondisi: b.kondisi?.name ?? '-',
                                                                status: b.status?.name ?? '-',
                                                                jumlah: `${b.jumlah} ${b.satuan?.name ?? ''}`.trim(),
                                                                perolehan: `${b.tahun_perolehan ?? '-'} • ${b.sumber_perolehan ?? '-'}`,
                                                                harga: `Rp ${ribuan(Number(b.harga_perolehan ?? 0))}`,
                                                                spesifikasi: b.spesifikasi ?? '-',
                                                            })
                                                        }
                                                        className="rounded p-1 text-[#515f74] hover:bg-[#f1f5f9] hover:text-[#022448]"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Edit Data"
                                                        onClick={() => bukaUbah(b)}
                                                        className="rounded p-1 text-[#515f74] hover:bg-[#f1f5f9] hover:text-[#022448]"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Hapus"
                                                        onClick={() => hapus(b)}
                                                        className="rounded p-1 text-[#515f74] hover:bg-red-50 hover:text-[#dc2626]"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center text-sm text-[#515f74]">
                                            Belum ada data barang untuk filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] p-4 text-xs text-[#515f74] sm:flex-row">
                        <div className="flex items-center gap-3">
                            <span>
                                Menampilkan{' '}
                                <span className="font-bold text-[#0f172a]">{data.from ?? 0} - {data.to ?? 0}</span> dari{' '}
                                <span className="font-bold text-[#0f172a]">{ribuan(data.total ?? 0)}</span> barang inventaris
                            </span>
                            <span className="text-[#94a3b8]">|</span>
                            <label className="flex items-center gap-1.5">
                                <span>Baris per halaman:</span>
                                <select
                                    value={perHalaman}
                                    onChange={(e) => pilihPerHalaman(Number(e.target.value))}
                                    className="rounded border border-[#e2e7ff] bg-[#f1f5f9] px-2 py-1 text-xs text-[#0f172a] focus:outline-none"
                                >
                                    {PER_HALAMAN.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex items-center gap-1">
                            {urlPrev ? (
                                <button
                                    type="button"
                                    onClick={() => keUrl(urlPrev)}
                                    className="rounded border border-[#e2e7ff] p-1.5 hover:bg-[#f1f5f9]"
                                >
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </button>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] p-1.5 text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </span>
                            )}
                            {Array.from({ length: jendelaAkhir - jendelaAwal + 1 }).map((_, idx) => {
                                const halaman = jendelaAwal + idx;
                                const url = ambilUrl(halaman);
                                return halaman === current ? (
                                    <span key={halaman} className="rounded bg-[#022448] px-3 py-1 font-bold text-white shadow-xs">
                                        {halaman}
                                    </span>
                                ) : (
                                    <button
                                        key={halaman}
                                        type="button"
                                        onClick={() => keUrl(url)}
                                        className="rounded border border-[#e2e7ff] px-3 py-1 font-medium hover:bg-[#f1f5f9]"
                                    >
                                        {halaman}
                                    </button>
                                );
                            })}
                            {tampilHalamanTerakhir && (
                                <>
                                    <span className="px-1.5 text-[#94a3b8]">...</span>
                                    <button
                                        type="button"
                                        onClick={() => keUrl(ambilUrl(last))}
                                        className="rounded border border-[#e2e7ff] px-3 py-1 font-medium hover:bg-[#f1f5f9]"
                                    >
                                        {last}
                                    </button>
                                </>
                            )}
                            {urlNext ? (
                                <button
                                    type="button"
                                    onClick={() => keUrl(urlNext)}
                                    className="rounded border border-[#e2e7ff] p-1.5 hover:bg-[#f1f5f9]"
                                >
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </button>
                            ) : (
                                <span className="rounded border border-[#e2e7ff] p-1.5 text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </span>
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
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#e2e7ff] bg-white shadow-xl">
                        <div className="flex items-center justify-between bg-[#1e3a5f] px-6 py-4 text-white">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[22px]">post_add</span>
                                <div>
                                    <h2 className="text-base font-bold leading-tight">
                                        {ubahId ? 'Ubah Data Barang' : 'Catat Aset Baru / Tambah Barang Inventaris'}
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-[#8aa4cf]">
                                        Formulir registrasi dan penomoran inventaris sarana dan prasarana
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalBuka(false)}
                                className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={simpan} className="flex flex-col gap-4 overflow-y-auto p-6 text-xs text-[#0f172a]">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Kode Barang (Otomatis)</label>
                                    <input
                                        type="text"
                                        value="BRG-XXXX (dibuat otomatis)"
                                        readOnly
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-3 font-semibold text-[#022448]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">
                                        Kategori Aset <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.kategori_barang_id}
                                        onChange={(e) => setForm({ ...form, kategori_barang_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {kategoris.map((k) => (
                                            <option key={k.id} value={k.id}>{k.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block font-bold text-[#515f74]">
                                    Nama Barang &amp; Merk/Model <span className="text-[#dc2626]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={150}
                                    value={form.nama_barang}
                                    onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
                                    placeholder="Contoh: Smart TV LG 65 Inch 4K UHD"
                                    className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Merk</label>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={form.merk}
                                        onChange={(e) => setForm({ ...form, merk: e.target.value })}
                                        placeholder="Contoh: Epson"
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Foto Barang</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fotoRef}
                                        key={ubahId ?? 'tambah'}
                                        className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#022448] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1e3a5f]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">
                                        Lokasi Penempatan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.lokasi_id}
                                        onChange={(e) => setForm({ ...form, lokasi_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {lokasis.map((l) => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">
                                        Status Penggunaan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.status_barang_id}
                                        onChange={(e) => setForm({ ...form, status_barang_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {statuss.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Jumlah Unit</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.jumlah}
                                        onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Satuan</label>
                                    <select
                                        value={form.satuan_id}
                                        onChange={(e) => setForm({ ...form, satuan_id: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        {satuans.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Nilai Perolehan (Rp)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={form.harga_perolehan}
                                        onChange={(e) => setForm({ ...form, harga_perolehan: e.target.value })}
                                        placeholder="12500000"
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Tahun Perolehan</label>
                                    <input
                                        type="number"
                                        min={1900}
                                        max={2100}
                                        value={form.tahun_perolehan}
                                        onChange={(e) => setForm({ ...form, tahun_perolehan: e.target.value })}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-[#515f74]">Sumber Perolehan</label>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={form.sumber_perolehan}
                                        onChange={(e) => setForm({ ...form, sumber_perolehan: e.target.value })}
                                        placeholder="APBD / Hibah / ..."
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-white px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block font-bold text-[#515f74]">Kondisi Fisik Saat Penerimaan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {kondisis.map((k) => (
                                        <label
                                            key={k.id}
                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs font-semibold ${
                                                k.name === 'Baik'
                                                    ? 'border-emerald-300 bg-emerald-50/50 text-[#16a34a]'
                                                    : k.name === 'Rusak Ringan'
                                                      ? 'border-amber-300 bg-amber-50/50 text-[#d97706]'
                                                      : 'border-rose-300 bg-rose-50/50 text-[#dc2626]'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="kondisi_barang_id"
                                                value={k.id}
                                                checked={form.kondisi_barang_id === String(k.id)}
                                                onChange={() => setForm({ ...form, kondisi_barang_id: String(k.id) })}
                                            />
                                            <span>{k.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block font-bold text-[#515f74]">Spesifikasi Tambahan</label>
                                <textarea
                                    rows={2}
                                    value={form.spesifikasi}
                                    onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
                                    placeholder="Kelengkapan, nomor seri, aksesoris, catatan khusus..."
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-white p-2.5 text-xs placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="-mx-6 -mb-6 mt-2 flex items-center justify-end gap-2.5 border-t border-[#e2e7ff] bg-[#f1f5f9] px-6 py-3.5">
                                <button
                                    type="button"
                                    onClick={() => setModalBuka(false)}
                                    className="rounded-lg border border-[#e2e7ff] bg-white px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#f1f5f9]"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#152e4f] disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined text-base">save</span>
                                    <span>{menyimpan ? 'Menyimpan...' : 'Simpan Barang'}</span>
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
                            <h2 className="text-base font-bold text-[#0f172a]">Detail Barang</h2>
                            <button
                                type="button"
                                onClick={() => setDetail(null)}
                                className="rounded-lg p-1 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#0f172a]"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 p-6 text-xs">
                            <dt className="font-medium text-[#515f74]">Kode</dt>
                            <dd className="col-span-2 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{detail.kode}</dd>
                            <dt className="font-medium text-[#515f74]">Nama</dt>
                            <dd className="col-span-2 font-semibold">{detail.nama}</dd>
                            <dt className="font-medium text-[#515f74]">Merk</dt>
                            <dd className="col-span-2">{detail.merk}</dd>
                            <dt className="font-medium text-[#515f74]">Kategori</dt>
                            <dd className="col-span-2">{detail.kategori}</dd>
                            <dt className="font-medium text-[#515f74]">Lokasi</dt>
                            <dd className="col-span-2">{detail.lokasi}</dd>
                            <dt className="font-medium text-[#515f74]">Kondisi</dt>
                            <dd className="col-span-2">{detail.kondisi}</dd>
                            <dt className="font-medium text-[#515f74]">Status</dt>
                            <dd className="col-span-2">{detail.status}</dd>
                            <dt className="font-medium text-[#515f74]">Jumlah</dt>
                            <dd className="col-span-2">{detail.jumlah}</dd>
                            <dt className="font-medium text-[#515f74]">Perolehan</dt>
                            <dd className="col-span-2">{detail.perolehan}</dd>
                            <dt className="font-medium text-[#515f74]">Harga</dt>
                            <dd className="col-span-2">{detail.harga}</dd>
                            <dt className="font-medium text-[#515f74]">Spesifikasi</dt>
                            <dd className="col-span-2">{detail.spesifikasi}</dd>
                        </dl>
                    </div>
                </div>
            )}
        </>
    );
}
