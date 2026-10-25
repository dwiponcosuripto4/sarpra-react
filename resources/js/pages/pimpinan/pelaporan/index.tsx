import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent, type MouseEvent } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';

const rupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n);

const rupiahM = (n: number) =>
    n >= 1_000_000
        ? `Rp ${(n / 1_000_000).toLocaleString('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })} M`
        : rupiah(n);

const angka = (n: number) => new Intl.NumberFormat('id-ID').format(n);

const satuDesimal = (n: number) =>
    n.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

const nomorDuaDigit = (i: number) => String(i + 1).padStart(2, '0');

type BarisLaporan = {
    kode: string;
    nama: string;
    kategori: string;
    lokasi: string;
    status: string;
    kondisi: 'baik' | 'tindak';
    nilai: string;
    nilaiRaw: number;
};

type JenisLaporanDef = {
    label: string;
    ikon: string;
    desc: string;
};

type MasterOption = {
    id: number;
    name: string;
};

type Props = {
    jenisLaporan: Record<string, JenisLaporanDef>;
    jenis: string;
    data: Paginator<BarisLaporan> & { per_page?: number };
    totalData: number;
    totalNilai: number;
    baik: number;
    tindak: number;
    kategoris: MasterOption[];
    lokasis: MasterOption[];
};

const labelDetail: Record<'kode' | 'nama' | 'kategori' | 'lokasi' | 'status' | 'nilai', string> = {
    kode: 'Kode',
    nama: 'Nama',
    kategori: 'Kategori',
    lokasi: 'Lokasi',
    status: 'Status',
    nilai: 'Nilai',
};

export default function PimpinanPelaporanIndex() {
    const { props, url } = usePage();
    const p = props as unknown as Props;

    const qs = new URLSearchParams(url.split('?')[1] ?? '');
    const rows = p.data?.data ?? [];
    const pctBaik = p.baik + p.tindak > 0 ? Math.round((p.baik / (p.baik + p.tindak)) * 1000) / 10 : 0;
    const tahunKini = new Date().getFullYear();

    const [dari, setDari] = useState(qs.get('dari') ?? '');
    const [sampai, setSampai] = useState(qs.get('sampai') ?? '');
    const [kategori, setKategori] = useState(qs.get('kategori') ?? '');
    const [lokasi, setLokasi] = useState(qs.get('lokasi') ?? '');
    const [kondisi, setKondisi] = useState(qs.get('kondisi') ?? '');
    const [cari, setCari] = useState(qs.get('cari') ?? '');
    const [detail, setDetail] = useState<BarisLaporan | null>(null);

    const kueriSaatIni = () => {
        const obj: Record<string, string> = {};
        new URLSearchParams(window.location.search).forEach((v, k) => {
            obj[k] = v;
        });
        return obj;
    };

    const menuju = (param: Record<string, string>) => {
        const params: Record<string, string> = {};
        Object.entries(param).forEach(([k, v]) => {
            if (v) {
                params[k] = v;
            }
        });
        router.get('/pimpinan/pelaporan', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const terapkanFilter = (e: FormEvent) => {
        e.preventDefault();
        menuju({ jenis: p.jenis, dari, sampai, kategori, lokasi, kondisi });
    };

    const resetFilter = () => {
        setDari('');
        setSampai('');
        setKategori('');
        setLokasi('');
        setKondisi('');
        setCari('');
        router.get('/pimpinan/pelaporan', { jenis: p.jenis }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const kirimCari = (e: FormEvent) => {
        e.preventDefault();
        // Pertahankan filter aktif lain (dari/sampai/kategori/lokasi/kondisi),
        // hanya ganti kata kunci pencarian & kembalikan ke halaman 1.
        const params = kueriSaatIni();
        if (cari) {
            params.cari = cari;
        } else {
            delete params.cari;
        }
        delete params.page;
        router.get('/pimpinan/pelaporan', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const ubahBarisHalaman = (n: string) => {
        const params = kueriSaatIni();
        if (n) {
            params.per_halaman = n;
        }
        delete params.page;
        router.get('/pimpinan/pelaporan', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const unduhEkspor = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const query = new URLSearchParams(kueriSaatIni()).toString();
        window.location.href = `/pimpinan/pelaporan/ekspor?${query}`;
    };

    const cetak = () => window.print();

    const laporanAktif = p.jenisLaporan[p.jenis] ?? {
        label: 'Laporan Inventaris',
        ikon: 'inventory_2',
        desc: '',
    };

    return (
        <>
            <Head title="Pusat Pelaporan" />

            {/* Judul */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 md:flex-row md:items-center">
                <div className="flex flex-col">
                    <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-[#1e3a5f] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                            Modul Pelaporan Eksekutif
                        </span>
                        <span
                            className="text-xs font-medium text-[#515f74]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            • TA {angka(tahunKini)}/{angka(tahunKini + 1)}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#131b2e]">
                        Pusat Pelaporan Sarana & Prasarana
                    </h1>
                    <p className="mt-1 text-xs text-[#475569]">
                        Pilih jenis laporan, tentukan rentang parameter filter, cetak dan ekspor
                        rekap data aset institusi secara terpadu.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={cetak}
                        className="flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-colors hover:bg-[#f1f5f9] hover:text-[#022448]"
                    >
                        <span className="material-symbols-outlined text-lg">print</span>
                        <span>Cetak</span>
                    </button>
                    <a
                        href="/pimpinan/pelaporan/ekspor"
                        onClick={unduhEkspor}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span>Export Excel / PDF</span>
                    </a>
                </div>
            </div>

            {/* Pilih jenis laporan */}
            <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#515f74]">
                        <span className="material-symbols-outlined text-lg text-[#022448]">
                            category
                        </span>
                        <span>Pilih Jenis Laporan (5 Kategori Utama)</span>
                    </span>
                    <span className="text-xs text-[#515f74]">
                        Laporan aktif:{' '}
                        <strong className="font-bold text-[#022448]">
                            {laporanAktif.label}
                        </strong>
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {Object.entries(p.jenisLaporan).map(([key, jl]) => (
                        <Link
                            key={key}
                            href={`/pimpinan/pelaporan?jenis=${key}`}
                            preserveState
                            preserveScroll
                            className={`flex flex-col rounded-xl border-2 p-3.5 text-left transition-all ${
                                p.jenis === key
                                    ? 'border-[#022448] bg-white shadow-sm'
                                    : 'border-[#e2e7ff] bg-white shadow-xs hover:border-[#2d4d7a]/50'
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div
                                    className={`flex size-9 items-center justify-center rounded-lg ${
                                        p.jenis === key
                                            ? 'bg-[#1e3a5f] text-white'
                                            : 'bg-[#f1f5f9] text-[#515f74]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {jl.ikon}
                                    </span>
                                </div>
                                <span
                                    className={`h-2 w-2 rounded-full bg-emerald-500 ${
                                        p.jenis === key ? '' : 'hidden'
                                    }`}
                                />
                            </div>
                            <span className="mb-0.5 text-xs font-bold text-[#131b2e]">
                                {jl.label}
                            </span>
                            <span className="text-[11px] leading-snug text-[#515f74]">
                                {jl.desc}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Parameter filter */}
            <form
                onSubmit={terapkanFilter}
                className="mt-6 flex flex-col gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs"
            >
                <div className="flex items-center justify-between border-b border-[#e2e7ff] pb-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl text-[#022448]">
                            tune
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#131b2e]">
                            Parameter & Filter Data Laporan
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={resetFilter}
                        className="flex items-center gap-1 text-xs font-semibold text-[#515f74] transition-colors hover:text-[#022448]"
                    >
                        <span className="material-symbols-outlined text-base">
                            restart_alt
                        </span>
                        <span>Reset Filter</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1 text-xs font-semibold text-[#515f74]">
                            <span className="material-symbols-outlined text-base">
                                calendar_today
                            </span>
                            <span>Rentang Periode / Waktu</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={dari}
                                onChange={(e) => setDari(e.target.value)}
                                className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-xs text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                            />
                            <input
                                type="date"
                                value={sampai}
                                onChange={(e) => setSampai(e.target.value)}
                                className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-xs text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1 text-xs font-semibold text-[#515f74]">
                            <span className="material-symbols-outlined text-base">devices</span>
                            <span>Kategori Barang / Aset</span>
                        </label>
                        <select
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="h-9 w-full cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-xs text-[#131b2e] focus:outline-none"
                        >
                            <option value="">Semua Kategori</option>
                            {p.kategoris.map((k) => (
                                <option key={k.id} value={String(k.id)}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1 text-xs font-semibold text-[#515f74]">
                            <span className="material-symbols-outlined text-base">
                                location_city
                            </span>
                            <span>Lokasi & Gedung / Satker</span>
                        </label>
                        <select
                            value={lokasi}
                            onChange={(e) => setLokasi(e.target.value)}
                            className="h-9 w-full cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-xs text-[#131b2e] focus:outline-none"
                        >
                            <option value="">Semua Lokasi / Unit</option>
                            {p.lokasis.map((l) => (
                                <option key={l.id} value={String(l.id)}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1 text-xs font-semibold text-[#515f74]">
                            <span className="material-symbols-outlined text-base">
                                health_and_safety
                            </span>
                            <span>Kondisi Aset / Status</span>
                        </label>
                        <select
                            value={kondisi}
                            onChange={(e) => setKondisi(e.target.value)}
                            className="h-9 w-full cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] px-2.5 text-xs text-[#131b2e] focus:outline-none"
                        >
                            <option value="">Semua Kondisi & Status</option>
                            <option value="Baik">Kondisi Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#e2e7ff] pt-2">
                    <div className="flex items-center gap-2 text-xs text-[#515f74]">
                        <span className="material-symbols-outlined text-lg text-emerald-600">
                            check_circle
                        </span>
                        <span>
                            Filter siap diaplikasikan pada{' '}
                            <strong>{angka(p.totalData)} total rekaman</strong>
                        </span>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#022448]"
                    >
                        <span className="material-symbols-outlined text-lg">filter_alt</span>
                        <span>Tampilkan Laporan</span>
                    </button>
                </div>
            </form>

            {/* 4 KPI */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Data Ditemukan
                        </span>
                        <span
                            className="mt-0.5 text-2xl font-bold text-[#131b2e]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {angka(p.totalData)}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <span className="material-symbols-outlined text-sm">check</span>
                            Sesuai parameter kriteria
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#022448]">
                        <span className="material-symbols-outlined text-[22px]">
                            format_list_bulleted
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Total Valuasi Terdata
                        </span>
                        <span
                            className="mt-0.5 text-2xl font-bold text-[#022448]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {rupiahM(p.totalNilai)}
                        </span>
                        <span className="mt-1 text-[11px] font-medium text-[#515f74]">
                            Estimasi nilai buku akumulatif
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <span className="material-symbols-outlined text-[22px]">payments</span>
                    </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Aset Kondisi Baik
                        </span>
                        <span
                            className="mt-0.5 text-2xl font-bold text-emerald-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {angka(p.baik)} Unit
                        </span>
                        <span className="mt-1 text-[11px] font-medium text-[#515f74]">
                            {satuDesimal(pctBaik)}% Siap pakai optimal
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <span className="material-symbols-outlined text-[22px]">verified</span>
                    </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Perlu Tindak Lanjut
                        </span>
                        <span
                            className="mt-0.5 text-2xl font-bold text-[#dc2626]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {angka(p.tindak)} Unit
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#dc2626]">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Perlu servis / afkir
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#fef2f2] text-[#dc2626]">
                        <span className="material-symbols-outlined text-[22px]">build</span>
                    </div>
                </div>
            </div>

            {/* Tabel pratinjau */}
            <div className="mt-6 flex flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                <div className="flex flex-col justify-between gap-3 border-b border-[#e2e7ff] p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#022448]">
                            <span className="material-symbols-outlined text-lg">
                                table_chart
                            </span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[#131b2e]">
                                Tabel Pratinjau: {laporanAktif.label}
                            </h2>
                            <p className="mt-0.5 text-xs text-[#515f74]">
                                Menampilkan baris hasil penelusuran parameter terpadu
                            </p>
                        </div>
                    </div>
                    <form onSubmit={kirimCari} className="flex items-center">
                        <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-2.5 text-base text-[#515f74]">
                                search
                            </span>
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari dalam tabel..."
                                className="h-8 w-56 rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-8 pr-3 text-xs text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                            />
                            <button type="submit" className="hidden" aria-hidden />
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#e2e7ff] bg-[#f1f5f9] font-bold text-[#515f74]">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Kode Aset / Usulan</th>
                                <th className="px-4 py-3">Nama Barang / Kegiatan</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3">Lokasi / Satker</th>
                                <th className="px-4 py-3">Kondisi / Status</th>
                                <th className="px-4 py-3 text-right">Nilai / Estimasi Biaya</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] font-medium text-[#131b2e]">
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-sm text-[#515f74]"
                                    >
                                        Tidak ada data untuk parameter ini.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row, i) => (
                                <tr
                                    key={`${row.kode}-${i}`}
                                    className="transition-colors hover:bg-[#f1f5f9]/60"
                                >
                                    <td
                                        className="px-4 py-3 text-[#515f74]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {nomorDuaDigit(i)}
                                    </td>
                                    <td
                                        className="px-4 py-3 font-bold text-[#022448]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {row.kode}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{row.nama}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-semibold text-[#515f74]">
                                            {row.kategori}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#515f74]">{row.lokasi}</td>
                                    <td className="px-4 py-3">
                                        {row.kondisi === 'baik' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {row.status}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/20 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                {row.status}
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-right font-bold"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {row.nilai}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            title="Lihat Detail"
                                            onClick={() => setDetail(row)}
                                            className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#022448]"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                visibility
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] p-4 text-xs text-[#515f74] sm:flex-row">
                    <div className="flex items-center gap-2">
                        <Pagination<BarisLaporan> pag={p.data} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span>Baris per halaman:</span>
                        <select
                            value={String(p.data?.per_page ?? '')}
                            onChange={(e) => ubahBarisHalaman(e.target.value)}
                            className="rounded border border-[#e2e7ff] bg-[#f1f5f9] px-1.5 py-0.5 text-xs font-semibold text-[#131b2e] focus:outline-none"
                        >
                            {[10, 25, 50].map((n) => (
                                <option key={n} value={String(n)}>
                                    {n}
                                </option>
                            ))}
                        </select>
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
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operasional
                        Aktif
                    </span>
                    <span>•</span>
                    <span>Hak Cipta © 2026</span>
                </div>
            </footer>

            {/* Modal detail baris */}
            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022448]/60 p-4 backdrop-blur-xs">
                    <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#e2e7ff] bg-[#f1f5f9]/50 px-5 py-4">
                            <h3 className="text-base font-bold text-[#131b2e]">Detail Rekaman</h3>
                            <button
                                type="button"
                                onClick={() => setDetail(null)}
                                className="rounded-lg p-1 text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 overflow-y-auto p-5 text-xs">
                            {(Object.keys(labelDetail) as Array<keyof typeof labelDetail>)
                                .map((k) => (
                                    <div key={k} className="contents">
                                        <dt className="font-medium text-[#515f74]">
                                            {labelDetail[k]}
                                        </dt>
                                        <dd className="col-span-2 font-semibold text-[#131b2e]">
                                            {detail[k] ?? '-'}
                                        </dd>
                                    </div>
                                ))}
                        </dl>
                    </div>
                </div>
            )}
        </>
    );
}
