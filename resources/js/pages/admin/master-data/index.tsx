import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type EntitasMaster = {
    label: string;
    ikon?: string;
    model?: string;
    relasi?: unknown;
};

export type MasterRow = {
    id: number;
    name: string;
    description?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
};

type Props = {
    daftar: Record<string, EntitasMaster>;
    kunci: string;
    data: Paginator<MasterRow>;
    counts: Record<string, number>;
    relasiCount: Record<string, number>;
    totalTerintegrasi: number;
    terakhirDiperbarui?: string | null;
    status?: string;
    error?: string;
};

const bulanId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function fmtTanggal(iso?: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const dua = (n: number) => String(n).padStart(2, '0');
    return `${dua(d.getDate())} ${bulanId[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtWaktuPendek(iso?: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const dua = (n: number) => String(n).padStart(2, '0');
    return `${dua(d.getDate())} ${bulanId[d.getMonth()]} ${d.getFullYear()}, ${dua(d.getHours())}:${dua(d.getMinutes())}`;
}

const formatRibuan = (n: number) => new Intl.NumberFormat('id-ID').format(n);

export default function MasterDataIndex(props: Props) {
    const { url } = usePage();
    const kunci = props.kunci;
    const label = props.daftar[kunci]?.label ?? 'Data Master';
    const labelKecil = label.toLowerCase();

    const [cari, setCari] = useState('');
    const pertama = useRef(true);

    const [modalEntitas, setModalEntitas] = useState(false);
    const [entitasBaru, setEntitasBaru] = useState(kunci);

    const [modeMaster, setModeMaster] = useState<'tambah' | 'ubah' | null>(null);
    const [idUbah, setIdUbah] = useState<number | null>(null);

    const formEntitas = useForm({ name: '', description: '' });
    const formMaster = useForm({ name: '', description: '' });

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

    const perHalaman = ambilKueri(url, 'per_halaman') || '10';

    const hapus = (row: MasterRow) => {
        if (!window.confirm(`Hapus ${row.name} dari master?`)) return;
        router.delete(`/admin/master/${kunci}/${row.id}`, { preserveScroll: true });
    };

    const submitEntitas = (e: React.FormEvent) => {
        e.preventDefault();
        formEntitas.post(`/admin/master/${entitasBaru}`, {
            preserveScroll: true,
            onSuccess: () => {
                setModalEntitas(false);
                formEntitas.reset();
            },
        });
    };

    const bukaTambah = () => {
        formMaster.reset();
        setIdUbah(null);
        setModeMaster('tambah');
    };

    const bukaUbah = (row: MasterRow) => {
        formMaster.setData({ name: row.name, description: row.description ?? '' });
        setIdUbah(row.id);
        setModeMaster('ubah');
    };

    const tutupMaster = () => {
        setModeMaster(null);
        setIdUbah(null);
    };

    const submitMaster = (e: React.FormEvent) => {
        e.preventDefault();
        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                tutupMaster();
                formMaster.reset();
            },
        };
        if (modeMaster === 'tambah') formMaster.post(`/admin/master/${kunci}`, opsi);
        else if (modeMaster === 'ubah' && idUbah !== null) formMaster.put(`/admin/master/${kunci}/${idUbah}`, opsi);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Judul */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Kelola Data Master</h1>
                            <span
                                className="rounded bg-[#d5e3fc] px-2 py-0.5 text-xs font-bold text-[#022448]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                Standard V2.4
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#515f74]">
                            Pusat standarisasi dan kamus data klasifikasi inventaris, lokasi prasarana, serta parameter
                            operasional SARPRA.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/admin/master/ekspor"
                            as="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#0f172a] shadow-sm transition-colors hover:bg-[#f1f5f9]"
                        >
                            <span className="material-symbols-outlined text-lg text-[#515f74]">download</span>
                            Ekspor Kamus Data
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                formEntitas.reset();
                                setEntitasBaru(kunci);
                                setModalEntitas(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#022448] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Tambah Data Baru
                        </button>
                    </div>
                </div>

                {props.status && (
                    <div
                        className="flex items-start gap-3 rounded-xl p-4"
                        style={{ backgroundColor: '#e6f7ef', color: '#0d7a52' }}
                    >
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        <p className="text-sm font-medium">{props.status}</p>
                    </div>
                )}

                {props.error && (
                    <div
                        className="flex items-start gap-3 rounded-xl p-4"
                        style={{ backgroundColor: '#ffdad6', color: '#93000a' }}
                    >
                        <span className="material-symbols-outlined text-xl">error</span>
                        <p className="text-sm font-medium">{props.error}</p>
                    </div>
                )}

                {/* Tab entitas */}
                <div className="overflow-x-auto border-b border-[#e2e7ff]">
                    <div className="flex min-w-max items-center gap-1 pb-1">
                        {Object.entries(props.daftar).map(([key, entitas]) => {
                            const aktif = kunci === key;
                            return (
                                <Link
                                    key={key}
                                    href={`/admin/master?entitas=${key}`}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-all ${
                                        aktif
                                            ? 'border-b-2 border-[#022448] font-bold text-[#022448]'
                                            : 'font-medium text-[#515f74] hover:text-[#0f172a]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{entitas.ikon ?? 'list'}</span>
                                    {entitas.label}
                                    <span
                                        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                            aktif
                                                ? 'bg-[#d5e3fc] text-[#022448]'
                                                : 'bg-[#f1f5f9] text-[#515f74]'
                                        }`}
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {props.counts[key] ?? 0}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-[#515f74]">Total {label}</span>
                            <span
                                className="text-2xl font-bold text-[#0f172a]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {props.data.total ?? 0}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                <span className="material-symbols-outlined text-sm">check</span> Terdaftar di master
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d5e3fc]/60 text-[#022448]">
                            <span className="material-symbols-outlined text-2xl">layers</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-[#515f74]">Terintegrasi Data</span>
                            <span
                                className="text-2xl font-bold text-[#0f172a]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {formatRibuan(props.totalTerintegrasi)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#022448]">
                                <span className="material-symbols-outlined text-sm">sync</span> Baris relasi tercatat
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d5e3fc]/60 text-[#022448]">
                            <span className="material-symbols-outlined text-2xl">devices_other</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-[#515f74]">Total Entitas</span>
                            <span
                                className="text-2xl font-bold text-[#0f172a]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {Object.keys(props.daftar).length}
                            </span>
                            <span className="text-[11px] font-medium text-[#515f74]">Kamus data SARPRA</span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-[#515f74]">Terakhir Diperbarui</span>
                            <span
                                className="mt-1 text-base font-bold text-[#0f172a]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {fmtWaktuPendek(props.terakhirDiperbarui)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#515f74]">
                                <span className="material-symbols-outlined text-sm">person</span> Data master SARPRA
                            </span>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d5e3fc]/60 text-[#022448]">
                            <span className="material-symbols-outlined text-2xl">update</span>
                        </div>
                    </div>
                </div>

                {/* Tabel */}
                <div className="flex flex-col rounded-xl border border-[#e2e7ff] bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#e2e7ff] p-4 md:flex-row md:items-center">
                        <div className="relative flex max-w-md flex-1 items-center">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-[#515f74]">
                                search
                            </span>
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder={`Cari nama ${labelKecil}...`}
                                className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] pl-9 pr-8 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#022448] focus:outline-none"
                            />
                            {cari && (
                                <button
                                    type="button"
                                    onClick={() => setCari('')}
                                    className="absolute right-2.5 text-[#515f74] hover:text-[#022448]"
                                    aria-label="Hapus pencarian"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#022448] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e3a5f] md:ml-auto"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Tambah {label} Baru
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] font-bold uppercase tracking-wider text-[#515f74]">
                                <tr>
                                    <th className="p-3 pl-4">Nama &amp; Keterangan</th>
                                    <th className="p-3">Relasi Data</th>
                                    <th className="p-3">Diperbarui</th>
                                    <th className="p-3 pr-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff] text-xs text-[#0f172a]">
                                {props.data.data.map((row) => (
                                    <tr key={row.id} className="transition-colors hover:bg-[#f1f5f9]/60">
                                        <td className="p-3 pl-4">
                                            <div className="font-bold">{row.name}</div>
                                            <div className="text-[11px] text-[#515f74]">{row.description ?? '-'}</div>
                                        </td>
                                        <td
                                            className="p-3 font-semibold"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {formatRibuan(props.relasiCount[String(row.id)] ?? 0)} baris
                                        </td>
                                        <td className="p-3 text-[11px] text-[#515f74]">{fmtTanggal(row.updated_at)}</td>
                                        <td className="p-3 pr-4 text-center">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Edit Data"
                                                    onClick={() => bukaUbah(row)}
                                                    className="rounded p-1 text-[#515f74] hover:text-[#022448]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Hapus Data"
                                                    onClick={() => hapus(row)}
                                                    className="rounded p-1 text-[#515f74] hover:text-[#dc2626]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {props.data.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-sm text-[#515f74]">
                                            Belum ada data {labelKecil}.
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
                                <strong>
                                    {props.data.from ?? 0} - {props.data.to ?? 0}
                                </strong>{' '}
                                dari <strong>{props.data.total ?? 0}</strong>
                            </span>
                            <span className="text-[#94a3b8]">|</span>
                            <label className="flex items-center gap-1.5">
                                Tampilkan
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
                                </select>{' '}
                                baris
                            </label>
                        </div>
                    </div>
                    <div className="border-t border-[#e2e7ff]">
                        <Pagination pag={props.data} />
                    </div>
                </div>

                <footer className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] pb-2 pt-5 text-xs text-[#515f74] sm:flex-row">
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

            {/* Modal tambah data baru: pilih entitas master dulu */}
            <Dialog open={modalEntitas} onOpenChange={setModalEntitas}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="-mx-6 -mt-6 rounded-t-lg bg-[#f1f5f9] px-5 py-4">
                        <DialogTitle className="text-base font-bold text-[#0f172a]">Tambah Data Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEntitas} className="-mx-6 -mb-6 flex flex-col gap-3 p-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="pilihEntitas">
                                Master data <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <select
                                className="h-10 rounded-lg bg-[#f1f5f9] px-4 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                id="pilihEntitas"
                                value={entitasBaru}
                                onChange={(e) => setEntitasBaru(e.target.value)}
                                required
                            >
                                {Object.entries(props.daftar).map(([key, entitas]) => (
                                    <option key={key} value={key}>
                                        {entitas.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="baruNama">
                                Nama <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <input
                                className="h-10 rounded-lg bg-[#f1f5f9] px-4 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                id="baruNama"
                                value={formEntitas.data.name}
                                onChange={(e) => formEntitas.setData('name', e.target.value)}
                                required
                                type="text"
                                maxLength={100}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="baruDeskripsi">
                                Keterangan
                            </label>
                            <textarea
                                className="rounded-lg bg-[#f1f5f9] p-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                id="baruDeskripsi"
                                value={formEntitas.data.description}
                                onChange={(e) => formEntitas.setData('description', e.target.value)}
                                rows={3}
                                maxLength={255}
                            />
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                className="rounded-lg px-5 py-2 text-sm text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                                type="button"
                                onClick={() => setModalEntitas(false)}
                            >
                                Batalkan
                            </button>
                            <button
                                className="rounded-lg bg-[#022448] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                                type="submit"
                                disabled={formEntitas.processing}
                            >
                                {formEntitas.processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal tambah/ubah per entitas aktif */}
            <Dialog open={modeMaster !== null} onOpenChange={(o) => (o ? null : tutupMaster())}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="-mx-6 -mt-6 rounded-t-lg bg-[#f1f5f9] px-5 py-4">
                        <DialogTitle className="text-base font-bold text-[#0f172a]">
                            {modeMaster === 'tambah' ? `Tambah ${label}` : `Ubah ${label}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitMaster} className="-mx-6 -mb-6 flex flex-col gap-3 p-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="masterNama">
                                Nama <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <input
                                className="h-10 rounded-lg bg-[#f1f5f9] px-4 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                id="masterNama"
                                value={formMaster.data.name}
                                onChange={(e) => formMaster.setData('name', e.target.value)}
                                required
                                type="text"
                                maxLength={100}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="masterDeskripsi">
                                Keterangan
                            </label>
                            <textarea
                                className="rounded-lg bg-[#f1f5f9] p-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                id="masterDeskripsi"
                                value={formMaster.data.description}
                                onChange={(e) => formMaster.setData('description', e.target.value)}
                                rows={3}
                                maxLength={255}
                            />
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                className="rounded-lg px-5 py-2 text-sm text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                                type="button"
                                onClick={tutupMaster}
                            >
                                Batalkan
                            </button>
                            <button
                                className="rounded-lg bg-[#022448] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3a5f]"
                                type="submit"
                                disabled={formMaster.processing}
                            >
                                {formMaster.processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
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
