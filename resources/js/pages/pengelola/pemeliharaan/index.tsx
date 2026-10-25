import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';
import { Badge, EmptyState } from '@/components/sarpra/stat-card';
import { Input } from '@/components/ui/input';

// ----------------------------- tipe data -----------------------------

type Option = { id: number; name: string };

type Pemeliharaan = {
    id: number;
    nomor_pemeliharaan: string | null;
    status: string;
    tanggal_pengajuan: string | null;
    masalah: string;
    estimasi_biaya: number;
    jenis_pemeliharaan_id: number;
    barang: {
        id: number;
        nama_barang: string;
        kode_barang: string | null;
        lokasi: Option | null;
    } | null;
    jenis: Option | null;
    prioritas: Option | null;
    user: Option | null;
};

type Rincian = {
    nomor: string;
    tanggal: string | null;
    status: string;
    barang: string | null;
    kode: string | null;
    lokasi: string | null;
    jenis: string | null;
    prioritas: string | null;
    masalah: string | null;
    estimasi: number;
    pengaju: string | null;
    dokumen: Array<{ nama: string; tahap: string; url: string }>;
    riwayat: Array<{
        status: string;
        tanggal: string | null;
        tindakan: string | null;
        biaya: number | null;
        pelaksana: string | null;
        catatan: string | null;
        oleh: string | null;
    }>;
};

type Props = {
    data: Paginator<Pemeliharaan>;
    totalTiket: number;
    totalEstimasi: number;
    diajukan: number;
    dalamProses: number;
    selesaiBulanIni: number;
    jeniss: Option[];
    [key: string]: unknown;
};

type OptionBarang = { id: number; kode_barang: string | null; nama_barang: string };

const URL_INDEX = '/pengelolaan/pemeliharaan';
const URL_EKSPOR = '/pengelolaan/pemeliharaan/ekspor';

const rupiah = (n: number | null | undefined) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

const pesanStatus: Record<
    string,
    { varian: 'abu' | 'biru' | 'kuning' | 'hijau' | 'merah'; ikon: string; label: string }
> = {
    diajukan: { varian: 'kuning', ikon: 'hourglass_top', label: 'Diajukan' },
    dalam_pemeliharaan: { varian: 'biru', ikon: 'sync', label: 'Dalam Pemeliharaan' },
    selesai: { varian: 'hijau', ikon: 'check_circle', label: 'Selesai' },
    ditolak: { varian: 'merah', ikon: 'cancel', label: 'Ditolak' },
};

const tanggalIndo = (nilai: string | null) =>
    nilai
        ? new Date(nilai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-';

// Halaman daftar pemeliharaan (Pengelola) — replika pemeliharaan/index.blade.php.
export default function PemeliharaanIndex() {
    const { data, totalTiket, totalEstimasi, diajukan, dalamProses, selesaiBulanIni, jeniss } =
        usePage().props as unknown as Props;

    const flash = usePage().props as unknown as {
        status?: string;
        error?: string;
        errors?: Record<string, string>;
    };
    const pesanError =
        flash.error ??
        (flash.errors && Object.keys(flash.errors).length > 0 ? Object.values(flash.errors)[0] : null);

    // Filter aktif dibaca dari querystring browser.
    const kini = new URLSearchParams(window.location.search);
    const [cari, setCari] = useState(kini.get('cari') ?? '');
    const [jenis, setJenis] = useState(kini.get('jenis') ?? '');
    const [status, setStatus] = useState(kini.get('status') ?? '');
    const [prioritas, setPrioritas] = useState(kini.get('prioritas') ?? '');

    const muatNaik = (buang: string[]) => {
        const q = new URLSearchParams(window.location.search);
        buang.forEach((k) => q.delete(k));
        return q;
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

    const perHalaman = Number(data?.current_page ? kini.get('per_halaman') ?? '10' : '10') || 10;

    // ------------------- modal ajukan / ubah -------------------
    const [modalTerbuka, setModalTerbuka] = useState(false);
    const [ubahId, setUbahId] = useState<number | null>(null); // null = ajukan baru
    const [daftarBarang, setDaftarBarang] = useState<OptionBarang[]>([]);
    const [barangMuat, setBarangMuat] = useState(false);
    const [barangId, setBarangId] = useState('');
    const [jenisId, setJenisId] = useState('');
    const [prioritasForm, setPrioritasForm] = useState('Sedang');
    const [kerusakan, setKerusakan] = useState('');
    const [estimasiBiaya, setEstimasiBiaya] = useState('');
    const [pelaksana, setPelaksana] = useState('');
    const fotoRef = useRef<HTMLInputElement | null>(null);
    const [sedangSimpan, setSedangSimpan] = useState(false);

    // Daftar aset dari inventarisasi (halaman asal Blade memuat Barang inline).
    const muatBarang = async () => {
        if (barangMuat) return;
        setBarangMuat(true);
        try {
            const res = await fetch('/pengelolaan/inventarisasi?per_halaman=50');
            const tampilan = await res.text();
            const dom = new DOMParser().parseFromString(tampilan, 'text/html');
            const node = dom.querySelector('#app[data-page]');
            if (!node) return;
            const halaman = JSON.parse(node.getAttribute('data-page') ?? '{}');
            const baris: Array<Record<string, unknown>> = halaman?.props?.data?.data ?? [];
            setDaftarBarang(
                baris
                    .filter((b) => b.id != null && b.nama_barang)
                    .map((b) => ({
                        id: Number(b.id),
                        kode_barang: (b.kode_barang as string) ?? '',
                        nama_barang: String(b.nama_barang),
                    })),
            );
        } catch {
            // jika gagal muat, pilihan tetap kosong
        }
    };

    const bukaModalAjukan = () => {
        setUbahId(null);
        setBarangId('');
        setJenisId('');
        setPrioritasForm('Sedang');
        setKerusakan('');
        setEstimasiBiaya('');
        setPelaksana('');
        void muatBarang();
        setModalTerbuka(true);
    };

    const bukaModalUbah = (t: Pemeliharaan) => {
        setUbahId(t.id);
        setJenisId(String(t.jenis_pemeliharaan_id ?? ''));
        setPrioritasForm(t.prioritas?.name ?? 'Sedang');
        setKerusakan(t.masalah ?? '');
        setEstimasiBiaya(t.estimasi_biaya ? String(t.estimasi_biaya) : '');
        setModalTerbuka(true);
    };

    const tutupModal = () => setModalTerbuka(false);

    const simpanModal = () => {
        setSedangSimpan(true);
        if (ubahId != null) {
            router.put(
                `/pengelolaan/pemeliharaan/${ubahId}`,
                {
                    jenis_pemeliharaan_id: jenisId,
                    prioritas: prioritasForm,
                    kerusakan,
                    estimasi_biaya: estimasiBiaya || '0',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSedangSimpan(false);
                        setModalTerbuka(false);
                    },
                    onError: () => setSedangSimpan(false),
                },
            );
            return;
        }
        const fd = new FormData();
        fd.append('barang_id', barangId);
        fd.append('jenis_pemeliharaan_id', jenisId);
        fd.append('prioritas', prioritasForm);
        fd.append('kerusakan', kerusakan);
        if (estimasiBiaya) fd.append('estimasi_biaya', estimasiBiaya);
        if (pelaksana) fd.append('pelaksana', pelaksana);
        Array.from(fotoRef.current?.files ?? []).forEach((f) => fd.append('foto[]', f));
        router.post(URL_INDEX, fd, {
            preserveScroll: true,
            onSuccess: () => {
                setSedangSimpan(false);
                setModalTerbuka(false);
            },
            onError: () => setSedangSimpan(false),
        });
    };

    // ------------------- modal selesai -------------------
    const [modalSelesaiId, setModalSelesaiId] = useState<number | null>(null);
    const [tindakan, setTindakan] = useState('');
    const [biayaAktual, setBiayaAktual] = useState('');
    const [pelaksanaSelesai, setPelaksanaSelesai] = useState('');
    const fotoSesudahRef = useRef<HTMLInputElement | null>(null);

    const bukaModalSelesai = (id: number) => {
        setModalSelesaiId(id);
        setTindakan('');
        setBiayaAktual('');
        setPelaksanaSelesai('');
    };

    const simpanSelesai = () => {
        if (modalSelesaiId == null) return;
        const id = modalSelesaiId;
        const fd = new FormData();
        fd.append('tindakan', tindakan);
        if (biayaAktual) fd.append('biaya_aktual', biayaAktual);
        if (pelaksanaSelesai) fd.append('pelaksana', pelaksanaSelesai);
        Array.from(fotoSesudahRef.current?.files ?? []).forEach((f) => fd.append('foto_sesudah[]', f));
        router.post(`/pengelolaan/pemeliharaan/${id}/selesai`, fd, { preserveScroll: true });
        setModalSelesaiId(null);
    };

    // ------------------- aksi cepat -------------------
    const prosesTiket = (id: number) =>
        router.post(`/pengelolaan/pemeliharaan/${id}/proses`, {}, { preserveScroll: true });

    const tolakTiket = (id: number, nomor: string) => {
        if (!window.confirm(`Tolak tiket ${nomor}?`)) return;
        router.post(`/pengelolaan/pemeliharaan/${id}/tolak`, {}, { preserveScroll: true });
    };

    const hapusTiket = (id: number, nomor: string) => {
        if (!window.confirm(`Hapus tiket ${nomor}?`)) return;
        router.delete(`/pengelolaan/pemeliharaan/${id}`, { preserveScroll: true });
    };

    // ------------------- drawer detail -------------------
    const [rincian, setRincian] = useState<Rincian | null>(null);

    const bukaRincian = async (id: number) => {
        try {
            const res = await fetch(`/pengelolaan/pemeliharaan/${id}/rincian`);
            setRincian((await res.json()) as Rincian);
        } catch {
            setRincian(null);
        }
    };

    const tutupRincian = () => setRincian(null);

    return (
        <>
            <Head title="Manajemen Pemeliharaan" />
            <div className="mx-auto max-w-7xl">
                {/* Judul */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-[#131b2e]">Manajemen Pemeliharaan</h1>
                            <span className="rounded-full bg-[#d5e3fc] px-2.5 py-0.5 text-xs font-semibold text-[#57657a]">Modul Servis</span>
                        </div>
                        <p className="mt-1 text-sm text-[#515f74]">
                            Kelola tiket servis, perbaikan kerusakan, pemeliharaan berkala sarana dan prasarana terpadu.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={`${URL_EKSPOR}${kini.toString() ? `?${kini.toString()}` : ''}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-all hover:bg-[#f2f3ff] hover:text-[#022448]"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span>Unduh Rekap Servis</span>
                        </a>
                        <button
                            type="button"
                            onClick={bukaModalAjukan}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#022448] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#1e3a5f]"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Ajukan Pemeliharaan</span>
                        </button>
                    </div>
                </div>

                {/* Flash sukses */}
                {flash.status && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#e6f7ef] p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#0d7a52]">check_circle</span>
                        <p className="text-sm text-[#0d7a52]">{flash.status}</p>
                    </div>
                )}

                {/* Flash gagal */}
                {pesanError && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#ba1a1a]">error</span>
                        <p className="text-sm text-[#93000a]">{pesanError}</p>
                    </div>
                )}

                {/* Statistik */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total Tiket Servis',
                            nilai: totalTiket,
                            satuan: 'Tiket',
                            catatan: `Est. ${rupiah(totalEstimasi)}`,
                            ikon: 'build_circle',
                            ikonKelas: 'bg-[#d5e3fc]/60 text-[#022448]',
                            nilaiKelas: 'text-[#131b2e]',
                        },
                        {
                            label: 'Diajukan (Review)',
                            nilai: diajukan,
                            satuan: 'Tiket',
                            catatan: 'Perlu verifikasi teknis',
                            ikon: 'pending_actions',
                            ikonKelas: 'bg-amber-50 text-amber-600',
                            nilaiKelas: 'text-amber-600',
                        },
                        {
                            label: 'Dalam Pemeliharaan',
                            nilai: dalamProses,
                            satuan: 'Tiket',
                            catatan: 'Sedang ditangani teknisi',
                            ikon: 'handyman',
                            ikonKelas: 'bg-blue-50 text-blue-600',
                            nilaiKelas: 'text-blue-600',
                        },
                        {
                            label: 'Selesai (Bulan Ini)',
                            nilai: selesaiBulanIni,
                            satuan: 'Tiket',
                            catatan: 'Aset siap digunakan',
                            ikon: 'task_alt',
                            ikonKelas: 'bg-emerald-50 text-emerald-600',
                            nilaiKelas: 'text-emerald-600',
                        },
                    ].map((k) => (
                        <div
                            key={k.label}
                            className="flex items-center justify-between rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs"
                        >
                            <div>
                                <p className="text-xs font-medium text-[#515f74]">{k.label}</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className={`text-2xl font-bold ${k.nilaiKelas}`}>{k.nilai}</span>
                                    <span className="text-xs font-semibold text-[#515f74]">{k.satuan}</span>
                                </div>
                                <p className="mt-1 text-[11px] text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    {k.catatan}
                                </p>
                            </div>
                            <div className={`flex size-11 items-center justify-center rounded-lg ${k.ikonKelas}`}>
                                <span className="material-symbols-outlined text-2xl">{k.ikon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="mt-4 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <form
                        className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            gantiFilter({ cari, jenis, status, prioritas });
                        }}
                    >
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-2 text-lg text-[#515f74]">
                                <span className="material-symbols-outlined">search</span>
                            </span>
                            <Input
                                type="text"
                                name="cari"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari kode, nama aset, nomor tiket, atau teknisi..."
                                className="h-9 w-full bg-[#f2f3ff] pl-9 text-xs placeholder:text-[#94a3b8]"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                name="jenis"
                                value={jenis}
                                onChange={(e) => gantiFilter({ jenis: e.target.value })}
                                className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs text-[#131b2e]"
                            >
                                <option value="">Semua Jenis</option>
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
                                className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs text-[#131b2e]"
                            >
                                <option value="">Semua Status</option>
                                <option value="diajukan">Diajukan</option>
                                <option value="dalam_pemeliharaan">Dalam Pemeliharaan</option>
                                <option value="selesai">Selesai</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                            <select
                                name="prioritas"
                                value={prioritas}
                                onChange={(e) => gantiFilter({ prioritas: e.target.value })}
                                className="h-9 cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs text-[#131b2e]"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="Tinggi">Tinggi</option>
                                <option value="Sedang">Sedang</option>
                                <option value="Rendah">Rendah</option>
                            </select>
                            <a
                                href={URL_INDEX}
                                className="flex h-9 items-center gap-1 rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#e2e7ff]"
                            >
                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                <span>Reset</span>
                            </a>
                        </div>
                    </form>
                </div>

                {/* Tabel */}
                <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#e2e7ff] bg-[#f2f3ff]/70 text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                                    <th className="px-4 py-3.5">No. Tiket &amp; Tanggal</th>
                                    <th className="px-4 py-3.5">Barang &amp; Lokasi</th>
                                    <th className="px-4 py-3.5">Jenis Pemeliharaan</th>
                                    <th className="px-4 py-3.5">Kerusakan / Masalah</th>
                                    <th className="px-4 py-3.5 text-right">Estimasi Biaya</th>
                                    <th className="px-4 py-3.5 text-center">Status</th>
                                    <th className="px-4 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e7ff]">
                                {(data?.data ?? []).map((t) => {
                                    const st = pesanStatus[t.status] ?? pesanStatus.diajukan;
                                    return (
                                        <tr key={t.id} className="transition-colors hover:bg-[#f2f3ff]/40">
                                            <td className="px-4 py-3.5 font-medium text-[#022448]">
                                                <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.nomor_pemeliharaan ?? 'MNT-'}</div>
                                                <div className="text-[11px] text-[#515f74]">{tanggalIndo(t.tanggal_pengajuan)}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-[#131b2e]">{t.barang?.nama_barang ?? '-'}</div>
                                                <div className="text-[11px] text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {t.barang?.kode_barang ?? '-'} • {t.barang?.lokasi?.name ?? '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e7ff] bg-[#f2f3ff] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
                                                    {t.jenis?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3.5 text-[#475569]" title={t.masalah}>
                                                {t.masalah}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-[#131b2e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {rupiah(t.estimasi_biaya)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <Badge varian={st.varian}>
                                                    <span className="material-symbols-outlined text-[13px]">{st.ikon}</span> {st.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="Detail Tiket"
                                                        onClick={() => bukaRincian(t.id)}
                                                        className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#022448]"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    {t.status === 'diajukan' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                title="Mulai Pengerjaan"
                                                                onClick={() => prosesTiket(t.id)}
                                                                className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Edit Tiket"
                                                                onClick={() => bukaModalUbah(t)}
                                                                className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#022448]"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Tolak Pengajuan"
                                                                onClick={() => tolakTiket(t.id, t.nomor_pemeliharaan ?? '')}
                                                                className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#ffdad6] hover:text-[#dc2626]"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">block</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Hapus Tiket"
                                                                onClick={() => hapusTiket(t.id, t.nomor_pemeliharaan ?? '')}
                                                                className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#ffdad6] hover:text-[#dc2626]"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                    {t.status === 'dalam_pemeliharaan' && (
                                                        <button
                                                            type="button"
                                                            title="Selesaikan"
                                                            onClick={() => bukaModalSelesai(t.id)}
                                                            className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-50"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">task_alt</span>
                                                        </button>
                                                    )}
                                                    {t.status === 'selesai' && (
                                                        <button
                                                            type="button"
                                                            title="Berita Acara"
                                                            onClick={() => bukaRincian(t.id)}
                                                            className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-50"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">receipt_long</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(data?.data ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <EmptyState pesan="Belum ada tiket pemeliharaan." />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: jumlah + per halaman */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e2e7ff] p-4 text-xs text-[#515f74] sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span>Menampilkan</span>
                            <select
                                value={String(perHalaman)}
                                onChange={(e) => gantiFilter({ per_halaman: e.target.value })}
                                className="h-7 rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2 text-xs text-[#131b2e]"
                                aria-label="Baris per halaman"
                            >
                                {[10, 25, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>
                                dari <strong>{data?.total ?? 0}</strong> tiket pemeliharaan
                            </span>
                        </div>
                    </div>
                    <div className="px-4 pb-4">
                        <Pagination pag={data} />
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

            {/* Modal ajukan / ubah tiket */}
            {modalTerbuka && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022448]/60 p-4 backdrop-blur-xs">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#e2e7ff] bg-[#f2f3ff]/50 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#022448] text-white">
                                    <span className="material-symbols-outlined text-xl">build</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#131b2e]">
                                        {ubahId != null ? 'Ubah Tiket Pemeliharaan' : 'Pengajuan Tiket Pemeliharaan Baru'}
                                    </h3>
                                    <p className="text-xs text-[#515f74]">Lengkapi formulir untuk mencatat permintaan servis barang</p>
                                </div>
                            </div>
                            <button type="button" onClick={tutupModal} className="rounded-lg p-1 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]">
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 px-6 py-5 text-xs">
                            {ubahId == null && (
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">
                                        Pilih Barang dari Inventaris <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        value={barangId}
                                        onChange={(e) => setBarangId(e.target.value)}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Aset Sarpras --</option>
                                        {(daftarBarang.length > 0 ? daftarBarang : []).map((b) => (
                                            <option key={b.id} value={String(b.id)}>
                                                {b.kode_barang ? `${b.kode_barang} - ` : ''}
                                                {b.nama_barang}
                                            </option>
                                        ))}
                                    </select>
                                    {barangMuat && daftarBarang.length === 0 && (
                                        <p className="mt-0.5 text-[10px] text-[#94a3b8]">Daftar aset tidak dapat dimuat.</p>
                                    )}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">
                                        Jenis Pemeliharaan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        value={jenisId}
                                        onChange={(e) => setJenisId(e.target.value)}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        {(jeniss ?? []).map((j) => (
                                            <option key={j.id} value={String(j.id)}>
                                                {j.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">
                                        Tingkat Prioritas <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2" role="radiogroup">
                                        {[
                                            ['Rendah', 'Rendah', ''],
                                            ['Sedang', 'Sedang', ''],
                                            ['Tinggi', 'Darurat', 'font-bold text-[#dc2626]'],
                                        ].map(([nilai, tampil, teks]) => (
                                            <button
                                                key={nilai}
                                                type="button"
                                                role="radio"
                                                aria-checked={prioritasForm === nilai}
                                                onClick={() => setPrioritasForm(nilai)}
                                                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-[11px] font-medium transition-colors ${
                                                    prioritasForm === nilai
                                                        ? 'border-[#1e3a5f] bg-[#d5e3fc]/60 text-[#022448]'
                                                        : 'border-[#e2e7ff] bg-[#f2f3ff] text-[#515f74] hover:bg-[#e2e7ff]'
                                                }`}
                                            >
                                                <span className={teks}>{tampil}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block font-semibold text-[#131b2e]">
                                    Deskripsi Kerusakan / Kendala Operasional <span className="text-[#dc2626]">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={kerusakan}
                                    onChange={(e) => setKerusakan(e.target.value)}
                                    placeholder="Jelaskan gejala kerusakan fisik, kode eror, atau kendala pemakaian..."
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] p-2.5 text-xs placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">Estimasi Biaya Servis (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-xs font-bold text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={estimasiBiaya}
                                            onChange={(e) => setEstimasiBiaya(e.target.value)}
                                            placeholder="Contoh: 500000"
                                            className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] pl-10 pr-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">Penanggung Jawab / Vendor Servis</label>
                                    <input
                                        type="text"
                                        value={pelaksana}
                                        onChange={(e) => setPelaksana(e.target.value)}
                                        maxLength={150}
                                        disabled={ubahId != null}
                                        placeholder="Internal Sarpras / Nama Vendor"
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs focus:border-[#1e3a5f] focus:outline-none disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            {ubahId == null && (
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">Unggah Foto Kerusakan / Bukti Fisik</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        ref={fotoRef}
                                        className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#022448] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1e3a5f]"
                                    />
                                    <p className="mt-0.5 text-[10px] text-[#94a3b8]">Gambar, maks 5 MB per berkas.</p>
                                </div>
                            )}
                            <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-[#e2e7ff] bg-[#f2f3ff]/40 px-6 py-3">
                                <button
                                    type="button"
                                    onClick={tutupModal}
                                    className="rounded-lg border border-[#e2e7ff] bg-white px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:text-[#131b2e]"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="button"
                                    onClick={simpanModal}
                                    disabled={sedangSimpan}
                                    className="rounded-lg bg-[#022448] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1e3a5f] disabled:opacity-60"
                                >
                                    {ubahId != null ? 'Simpan Perubahan' : 'Kirim Pengajuan Pemeliharaan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal selesaikan */}
            {modalSelesaiId != null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022448]/60 p-4 backdrop-blur-xs">
                    <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xl">
                        <div className="border-b border-[#e2e7ff] bg-[#f2f3ff]/50 px-6 py-4">
                            <h3 className="text-base font-bold text-[#131b2e]">Selesaikan Tiket Pemeliharaan</h3>
                            <p className="text-xs text-[#515f74]">Catat hasil pengerjaan teknisi.</p>
                        </div>
                        <div className="flex flex-col gap-4 px-6 py-5 text-xs">
                            <div>
                                <label className="mb-1.5 block font-semibold text-[#131b2e]">
                                    Tindakan / Perbaikan <span className="text-[#dc2626]">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={tindakan}
                                    onChange={(e) => setTindakan(e.target.value)}
                                    placeholder="Uraikan tindakan perbaikan yang dilakukan..."
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] p-2.5 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">Biaya Aktual (Rp)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={biayaAktual}
                                        onChange={(e) => setBiayaAktual(e.target.value)}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block font-semibold text-[#131b2e]">Pelaksana</label>
                                    <input
                                        type="text"
                                        value={pelaksanaSelesai}
                                        onChange={(e) => setPelaksanaSelesai(e.target.value)}
                                        maxLength={150}
                                        className="h-9 w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block font-semibold text-[#131b2e]">Dokumentasi Sesudah</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fotoSesudahRef}
                                    className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#022448] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1e3a5f]"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setModalSelesaiId(null)}
                                    className="rounded-lg border border-[#e2e7ff] bg-white px-4 py-2 text-xs font-semibold text-[#515f74]"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="button"
                                    onClick={simpanSelesai}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                                >
                                    Tandai Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer detail */}
            {rincian && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div className="flex h-full max-w-2xl flex-col overflow-hidden border-l border-[#e2e7ff] bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-[#e2e7ff] bg-[#f2f3ff]/40 p-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-[#1e3a5f] px-2 py-0.5 text-xs font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {rincian.nomor || '-'}
                                    </span>
                                    <Badge varian={(pesanStatus[rincian.status] ?? pesanStatus.diajukan).varian}>
                                        {(pesanStatus[rincian.status] ?? pesanStatus.diajukan).label}
                                    </Badge>
                                </div>
                                <h2 className="mt-1 text-base font-bold text-[#131b2e]">
                                    {rincian.barang ?? '-'}{rincian.kode ? ` (${rincian.kode})` : ''}
                                </h2>
                                <p className="text-xs text-[#515f74]">
                                    Diajukan oleh:{' '}
                                    <strong className="text-[#131b2e]">
                                        {rincian.pengaju ?? '-'}
                                        {rincian.tanggal ? ` • ${rincian.tanggal}` : ''}
                                    </strong>
                                </p>
                            </div>
                            <button type="button" onClick={tutupRincian} className="rounded-lg p-1.5 text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448]">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                            {/* 1. Laporan kerusakan */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                    <span className="material-symbols-outlined text-lg">build</span>
                                    1. Laporan Kerusakan
                                </h3>
                                <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
                                    <dt className="text-[#515f74]">Jenis</dt>
                                    <dd className="col-span-2 font-semibold">{rincian.jenis ?? '-'}</dd>
                                    <dt className="text-[#515f74]">Prioritas</dt>
                                    <dd className="col-span-2">{rincian.prioritas ?? '-'}</dd>
                                    <dt className="text-[#515f74]">Tanggal</dt>
                                    <dd className="col-span-2">{rincian.tanggal ?? '-'}</dd>
                                    <dt className="text-[#515f74]">Masalah</dt>
                                    <dd className="col-span-2">{rincian.masalah ?? '-'}</dd>
                                    <dt className="text-[#515f74]">Estimasi</dt>
                                    <dd className="col-span-2 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {rupiah(rincian.estimasi)}
                                    </dd>
                                </dl>
                            </section>

                            {/* 2. Dokumentasi */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                    <span className="material-symbols-outlined text-lg">folder_open</span>
                                    2. Dokumentasi
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {rincian.dokumen.length === 0 && <p className="text-xs text-[#515f74]">Belum ada dokumentasi.</p>}
                                    {rincian.dokumen.map((dok, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg border border-[#e2e7ff] bg-white p-3 transition-colors hover:bg-[#f2f3ff]/40">
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-2xl ${dok.tahap === 'sesudah' ? 'text-emerald-600' : 'text-[#dc2626]'}`}>
                                                    image
                                                </span>
                                                <div>
                                                    <div className="text-xs font-semibold text-[#131b2e]">{dok.nama}</div>
                                                    <div className="text-[10px] text-[#515f74]">Tahap: {dok.tahap}</div>
                                                </div>
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
                                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#022448]">
                                    <span className="material-symbols-outlined text-lg">history</span>
                                    3. Riwayat Penanganan
                                </h3>
                                {rincian.riwayat.length === 0 && <p className="text-xs text-[#515f74]">Belum ada riwayat.</p>}
                                <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-[#e2e7ff]">
                                    {rincian.riwayat.map((r, i) => (
                                        <div key={i} className="relative flex items-start gap-3">
                                            <span className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-100" />
                                            <div>
                                                <div className="text-xs font-bold text-[#131b2e]">{String(r.status).replaceAll('_', ' ')}</div>
                                                <div className="text-[11px] text-[#515f74]">
                                                    {r.tanggal ?? ''} • Oleh <strong className="text-[#131b2e]">{r.oleh ?? '-'}</strong>
                                                    {r.pelaksana ? ` • Pelaksana: ${r.pelaksana}` : ''}
                                                </div>
                                                {r.tindakan && <p className="mt-0.5 text-[11px] text-[#131b2e]">Tindakan: {r.tindakan}</p>}
                                                {r.biaya != null && <p className="text-[11px] text-[#515f74]">Biaya: {rupiah(r.biaya)}</p>}
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

                        <div className="flex items-center justify-end border-t border-[#e2e7ff] bg-[#f2f3ff]/40 p-4">
                            <button
                                type="button"
                                onClick={tutupRincian}
                                className="rounded-lg border border-[#e2e7ff] bg-white px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:text-[#131b2e]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
