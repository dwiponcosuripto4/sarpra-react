import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

type Option = { id: number; name: string };

type Perencanaan = {
    id: number;
    nama_kebutuhan: string | null;
    jumlah: number;
    prioritas?: Option | null;
    created_at: string | null;
    [key: string]: unknown;
};

type Props = {
    jeniss: Option[];
    satuans: Option[];
    kategoris: Option[];
    perencanaans: Perencanaan[];
    [key: string]: unknown;
};

const URL_STORE = '/pengelolaan/pengadaan';
const URL_INDEX = '/pengelolaan/pengadaan';

const rupiah = (n: number | null | undefined) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

type BarisRincian = {
    nama_barang: string;
    spesifikasi: string;
    kategori_barang_id: string;
    jumlah: number;
    satuan_id: string;
    estimasi_harga: number;
};

const barisKosong = (): BarisRincian => ({
    nama_barang: '',
    spesifikasi: '',
    kategori_barang_id: '',
    jumlah: 1,
    satuan_id: '',
    estimasi_harga: 0,
});

// Angka ke teks terbilang bahasa Indonesia (replika skrip Blade create pengadaan).
function angkaKeTerbilang(nilai: number): string {
    const n = Math.floor(Number(nilai) || 0);
    if (n === 0) return 'Nol Rupiah';
    const huruf = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sepuluh', 'Sebelas'];
    const bagi = (x: number): string => {
        if (x < 12) return huruf[x];
        if (x < 20) return `${bagi(x - 10)} Belas`;
        if (x < 100) return `${bagi(Math.floor(x / 10))} Puluh ${huruf[x % 10]}`;
        if (x < 200) return `Seratus ${bagi(x - 100)}`;
        if (x < 1000) return `${bagi(Math.floor(x / 100))} Ratus ${bagi(x % 100)}`;
        if (x < 2000) return `Seribu ${bagi(x - 1000)}`;
        if (x < 1_000_000) return `${bagi(Math.floor(x / 1000))} Ribu ${bagi(x % 1000)}`;
        if (x < 1_000_000_000) return `${bagi(Math.floor(x / 1_000_000))} Juta ${bagi(x % 1_000_000)}`;
        return `${bagi(Math.floor(x / 1_000_000_000))} Miliar ${bagi(x % 1_000_000_000)}`;
    };
    return `${bagi(n)} Rupiah`.replace(/\s+/g, ' ').trim();
}

// Formulir pengajuan pengadaan baru — replika pengadaan/create.blade.php.
// POST ke pengadaan.store dengan FormData (banyak rincian + berkas dokumen).
export default function PengadaanCreate() {
    const { jeniss, satuans, kategoris, perencanaans } = usePage().props as unknown as Props;
    const { auth } = usePage().props as unknown as { auth: { user?: { name?: string; role?: string | null } | null } };

    const flash = usePage().props as unknown as {
        status?: string;
        error?: string;
        errors?: Record<string, string>;
    };
    const daftarError = flash.errors ?? {};

    const tanggalHariIni = new Date().toISOString().slice(0, 10);
    const perencanaanTahun = (nilai: string | null) =>
        nilai ? new Date(nilai).getFullYear() : '';

    const dokumenRef = useRef<HTMLInputElement | null>(null);

    // Satuan default = baris pertama (Blade tidak punya opsi kosong untuk satuan).
    const [detail, setDetail] = useState<BarisRincian[]>(() => {
        const awal = barisKosong();
        awal.satuan_id = String(satuans?.[0]?.id ?? '');
        return [awal];
    });
    const [namaPengajuan, setNamaPengajuan] = useState('');
    const [perencanaanId, setPerencanaanId] = useState('');
    const [jenisPengadaanId, setJenisPengadaanId] = useState('');
    const [tanggalPengajuan, setTanggalPengajuan] = useState(tanggalHariIni);
    const [alasan, setAlasan] = useState('');
    const [sedangKirim, setSedangKirim] = useState(false);
    const [bukaKonfirmasi, setBukaKonfirmasi] = useState(false);

    const total = useMemo(
        () => detail.reduce((a, d) => a + (Number(d.jumlah) || 0) * (Number(d.estimasi_harga) || 0), 0),
        [detail],
    );
    const jumlahItem = detail.filter((d) => Number(d.jumlah) > 0).length;
    const totalUnit = detail.reduce((a, d) => a + (Number(d.jumlah) || 0), 0);

    const ubahBaris = (i: number, kunci: keyof BarisRincian, nilai: string | number) => {
        setDetail((lama) =>
            lama.map((b, idx) =>
                idx === i
                    ? {
                          ...b,
                          [kunci]: kunci === 'jumlah' || kunci === 'estimasi_harga' ? Number(nilai) || 0 : (nilai as string),
                      }
                    : b,
            ),
        );
    };

    const tambahBaris = () => {
        const salinan = barisKosong();
        salinan.satuan_id = String(satuans?.[0]?.id ?? '');
        setDetail((lama) => [...lama, salinan]);
    };

    const hapusBaris = (i: number) => {
        if (detail.length <= 1) {
            window.alert('Minimal harus memiliki 1 rincian barang.');
            return;
        }
        setDetail((lama) => lama.filter((_, idx) => idx !== i));
    };

    const kirimkan = (aksi: 'draft' | 'kirim') => {
        const fd = new FormData();
        fd.append('aksi', aksi);
        if (namaPengajuan) fd.append('nama_pengajuan', namaPengajuan);
        if (perencanaanId) fd.append('perencanaan_id', perencanaanId);
        fd.append('jenis_pengadaan_id', jenisPengadaanId);
        fd.append('tanggal_pengajuan', tanggalPengajuan);
        if (alasan) fd.append('alasan', alasan);

        detail.forEach((d, i) => {
            fd.append(`detail[${i}][nama_barang]`, d.nama_barang);
            if (d.spesifikasi) fd.append(`detail[${i}][spesifikasi]`, d.spesifikasi);
            fd.append(`detail[${i}][jumlah]`, String(d.jumlah || 1));
            if (d.satuan_id) fd.append(`detail[${i}][satuan_id]`, d.satuan_id);
            fd.append(`detail[${i}][estimasi_harga]`, String(d.estimasi_harga || 0));
            if (d.kategori_barang_id) fd.append(`detail[${i}][kategori_barang_id]`, d.kategori_barang_id);
        });

        const berkas = (dokumenRef.current?.files ?? null) as FileList | null;
        Array.from(berkas ?? []).forEach((f) => fd.append('dokumen[]', f));

        setSedangKirim(true);
        router.post(URL_STORE, fd, {
            preserveScroll: true,
            onSuccess: () => setSedangKirim(false),
            onError: () => setSedangKirim(false),
        });
    };

    return (
        <>
            <Head title="Pengajuan Pengadaan Baru" />
            <div className="flex flex-col gap-6">
                {/* Judul */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 lg:flex-row lg:items-end">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#1e3a5f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                Modul Pengadaan • Dokumen Permohonan
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                <span className="size-1.5 rounded-full bg-amber-500" /> Status: Baru (Drafting)
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#131b2e]">Pengajuan Pengadaan Sarana &amp; Prasarana Baru</h1>
                        <p className="max-w-3xl text-sm leading-relaxed text-[#515f74]">
                            Ajukan usulan pembelian atau pengadaan sarana dan prasarana baru dengan rincian barang dan estimasi biaya yang jelas.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <Link
                            href={URL_INDEX}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-semibold text-[#515f74] shadow-xs transition-colors hover:bg-[#f2f3ff] hover:text-[#022448]"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span> Kembali ke Daftar Pengadaan
                        </Link>
                    </div>
                </div>

                {/* Banner error validasi server */}
                {(flash.error || Object.keys(daftarError).length > 0) && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-4">
                        <span className="material-symbols-outlined shrink-0 text-xl text-[#ba1a1a]">error</span>
                        <p className="text-sm text-[#93000a]">
                            {flash.error ??
                                (flash.errors ? Object.values(flash.errors)[0] : Object.values(daftarError)[0] ?? '')}
                        </p>
                    </div>
                )}

                {/* Grid kiri 8 kolom, kanan 4 kolom */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Kolom kiri */}
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        {/* 01 Informasi */}
                        <div className="flex flex-col gap-5 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#e2e7ff] pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f] text-xs font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        01
                                    </span>
                                    <h2 className="text-base font-bold text-[#022448]">Informasi Pengajuan</h2>
                                </div>
                                <span className="text-xs font-medium text-[#475569]">
                                    Wajib diisi <span className="text-[#dc2626]">*</span>
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center justify-between text-xs font-bold text-[#131b2e]">
                                    <span>
                                        Nama Pengajuan / Kebutuhan Barang <span className="text-[#dc2626]">*</span>
                                    </span>
                                    <span className="text-[11px] font-normal text-[#515f74]">Tulis judul atau uraian ringkas pengadaan</span>
                                </label>
                                <input
                                    type="text"
                                    value={namaPengajuan}
                                    onChange={(e) => setNamaPengajuan(e.target.value)}
                                    maxLength={150}
                                    placeholder="Contoh: Pengadaan 3 Unit Laptop Administrasi TU"
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 py-2 text-xs font-medium text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center justify-between text-xs font-bold text-[#131b2e]">
                                    <span>Dasar Perencanaan</span>
                                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                        <span className="material-symbols-outlined text-xs">sync</span> Terhubung RKBM Otomatis
                                    </span>
                                </label>
                                <select
                                    value={perencanaanId}
                                    onChange={(e) => setPerencanaanId(e.target.value)}
                                    className="w-full cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 py-2 text-xs font-medium text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                >
                                    <option value="">-- Tanpa dasar perencanaan --</option>
                                    {(perencanaans ?? []).map((pr) => (
                                        <option key={pr.id} value={String(pr.id)}>
                                            PRN-{perencanaanTahun(pr.created_at)}-{String(pr.id).padStart(3, '0')}: {pr.nama_kebutuhan ?? ''} - {pr.jumlah} unit · Prioritas: {pr.prioritas?.name ?? '-'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#131b2e]">
                                        Jenis Pengadaan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        value={jenisPengadaanId}
                                        onChange={(e) => setJenisPengadaanId(e.target.value)}
                                        className="w-full cursor-pointer rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 py-2 text-xs font-medium text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        {(jeniss ?? []).map((j) => (
                                            <option key={j.id} value={String(j.id)}>
                                                {j.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#131b2e]">
                                        Tanggal Pengajuan <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={tanggalPengajuan}
                                        onChange={(e) => setTanggalPengajuan(e.target.value)}
                                        className="w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] px-3 py-2 text-xs font-medium text-[#131b2e] focus:border-[#1e3a5f] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#131b2e]">Alasan / Urgensi Pengadaan</label>
                                <textarea
                                    rows={3}
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    placeholder="Uraikan alasan urgensi kebutuhan pengadaan sarana dan prasarana..."
                                    className="w-full rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] p-3 text-xs leading-relaxed text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* 02 Rincian */}
                        <div className="flex flex-col gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                            <div className="flex flex-col justify-between gap-3 border-b border-[#e2e7ff] pb-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f] text-xs font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        02
                                    </span>
                                    <div>
                                        <h2 className="text-base font-bold text-[#022448]">Daftar Rincian Pengadaan &amp; Spesifikasi Teknis</h2>
                                        <p className="text-xs text-[#515f74]">Cantumkan rincian merk, spesifikasi minimum, jumlah, dan estimasi harga perolehan.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={tambahBaris}
                                    className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#022448] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1e3a5f] sm:self-auto"
                                >
                                    <span className="material-symbols-outlined text-base">add</span> Tambah Baris Barang
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-[#e2e7ff]">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-[#e2e7ff] bg-[#f2f3ff] font-semibold text-[#515f74]">
                                        <tr>
                                            <th className="w-12 p-2.5 text-center">No</th>
                                            <th className="min-w-[200px] p-2.5">Nama Barang &amp; Spesifikasi Teknis</th>
                                            <th className="min-w-[130px] p-2.5">Kategori</th>
                                            <th className="w-20 p-2.5 text-center">Jumlah</th>
                                            <th className="w-28 p-2.5">Satuan</th>
                                            <th className="w-40 p-2.5 text-right">Harga Satuan (Rp)</th>
                                            <th className="w-40 p-2.5 text-right">Subtotal (Rp)</th>
                                            <th className="w-12 p-2.5 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e2e7ff] bg-white">
                                        {detail.map((d, i) => (
                                            <tr key={i} className="transition-colors hover:bg-[#f2f3ff]/50">
                                                <td className="p-2.5 text-center text-[#515f74]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {i + 1}
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="text"
                                                        value={d.nama_barang}
                                                        onChange={(e) => ubahBaris(i, 'nama_barang', e.target.value)}
                                                        maxLength={150}
                                                        placeholder="Nama barang..."
                                                        className="mb-1 w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2.5 py-1.5 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={d.spesifikasi}
                                                        onChange={(e) => ubahBaris(i, 'spesifikasi', e.target.value)}
                                                        placeholder="Spesifikasi teknis..."
                                                        className="w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2.5 py-1.5 text-[11px] focus:border-[#1e3a5f] focus:outline-none"
                                                    />
                                                    <select
                                                        value={d.kategori_barang_id}
                                                        onChange={(e) => ubahBaris(i, 'kategori_barang_id', e.target.value)}
                                                        className="mt-1 w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2 py-1.5 text-[11px] focus:border-[#1e3a5f] focus:outline-none"
                                                    >
                                                        <option value="">-- Kategori --</option>
                                                        {(kategoris ?? []).map((k) => (
                                                            <option key={k.id} value={String(k.id)}>
                                                                {k.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={d.jumlah}
                                                        onChange={(e) => ubahBaris(i, 'jumlah', e.target.value)}
                                                        className="w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2 py-1.5 text-center text-xs font-semibold focus:border-[#1e3a5f] focus:outline-none"
                                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                    />
                                                </td>
                                                <td className="p-2.5">
                                                    <select
                                                        value={d.satuan_id}
                                                        onChange={(e) => ubahBaris(i, 'satuan_id', e.target.value)}
                                                        className="w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2 py-1.5 text-xs focus:border-[#1e3a5f] focus:outline-none"
                                                    >
                                                        {(satuans ?? []).map((s) => (
                                                            <option key={s.id} value={String(s.id)}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={d.estimasi_harga}
                                                        onChange={(e) => ubahBaris(i, 'estimasi_harga', e.target.value)}
                                                        className="w-full rounded border border-[#e2e7ff] bg-[#f2f3ff] px-2 py-1.5 text-right text-xs font-semibold focus:border-[#1e3a5f] focus:outline-none"
                                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap p-2.5 text-right font-bold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {rupiah((Number(d.jumlah) || 0) * (Number(d.estimasi_harga) || 0))}
                                                </td>
                                                <td className="p-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        title="Hapus baris"
                                                        onClick={() => hapusBaris(i)}
                                                        className="rounded p-1 text-[#515f74] transition-colors hover:bg-[#ffdad6] hover:text-[#dc2626]"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t-2 border-[#e2e7ff] bg-[#f2f3ff]/80 font-semibold">
                                        <tr>
                                            <td colSpan={8} className="px-4 py-2 text-[11px] italic text-[#515f74]">
                                                *tambahkan barang/perlengkapan jika diperlukan
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={6} className="p-3 text-right uppercase tracking-wider text-[#515f74]">
                                                Total Estimasi Nilai Pengajuan:
                                            </td>
                                            <td className="whitespace-nowrap p-3 text-right text-base font-extrabold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {rupiah(total)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border border-[#d5e3fc] bg-[#d5e3fc]/40 p-3">
                                <span className="material-symbols-outlined text-lg text-[#022448]">payments</span>
                                <div className="flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center">
                                    <span className="font-bold text-[#022448]">Terbilang:</span>
                                    <span className="italic text-[#475569]">{angkaKeTerbilang(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 03 Dokumen */}
                        <div className="flex flex-col gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#e2e7ff] pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f] text-xs font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        03
                                    </span>
                                    <h2 className="text-base font-bold text-[#022448]">Dokumen Pendukung (Opsional)</h2>
                                </div>
                                <span className="text-xs text-[#515f74]">Format PDF, JPG, PNG maks. 10MB</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx"
                                    ref={dokumenRef}
                                    className="w-full text-xs text-[#131b2e] file:mr-3 file:rounded-lg file:border-0 file:bg-[#022448] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1e3a5f]"
                                />
                                <p className="text-[11px] text-[#515f74]">Berkas KAK, HPS/RAB, atau surat permohonan kebutuhan.</p>
                            </div>
                        </div>
                    </div>

                    {/* Kolom kanan */}
                    <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:col-span-4">
                        <div className="flex flex-col gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#e2e7ff] pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl text-[#022448]">receipt_long</span>
                                    <h3 className="text-sm font-bold text-[#022448]">Ringkasan Pengajuan</h3>
                                </div>
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Draf</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#515f74]">Total Rincian Barang:</span>
                                    <span className="font-semibold text-[#131b2e]">
                                        {jumlahItem} Item <span className="font-normal text-[#515f74]">({totalUnit} Unit fisik)</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#515f74]">Unit Pemohon:</span>
                                    <span className="font-medium text-[#131b2e]">{auth?.user?.role ?? '-'}</span>
                                </div>
                                <div className="my-0.5 h-px bg-[#e2e7ff]" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#515f74]">Total Estimasi Biaya:</span>
                                    <span className="text-2xl font-extrabold text-[#022448]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {rupiah(total)}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 rounded-lg border border-[#e2e7ff] bg-[#f2f3ff] p-2.5 text-[11px] text-[#515f74]">
                                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-[#022448]">info</span>
                                    <span>Biaya dihitung otomatis berdasarkan jumlah unit dan estimasi harga satuan pada tabel.</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-[#e2e7ff] pb-3">
                                <span className="material-symbols-outlined text-xl text-[#022448]">account_tree</span>
                                <h3 className="text-sm font-bold text-[#022448]">Alur Persetujuan</h3>
                            </div>
                            <div className="ml-2 flex flex-col gap-4 border-l-2 border-[#1e3a5f]/30 pl-4">
                                <div className="relative flex flex-col gap-1">
                                    <span className="absolute -left-[23px] top-0 flex size-5 items-center justify-center rounded-full bg-[#022448] text-white ring-4 ring-white">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                    </span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#022448]">1. Pemohon</span>
                                        <span className="rounded bg-[#022448] px-1.5 py-0.5 text-[10px] font-semibold text-white">Aktif</span>
                                    </div>
                                    <p className="text-[11px] leading-snug text-[#515f74]">
                                        {auth?.user?.name ?? '-'} ({auth?.user?.role ?? '-'})
                                    </p>
                                </div>
                                <div className="relative flex flex-col gap-1">
                                    <span className="absolute -left-[23px] top-0 flex size-5 items-center justify-center rounded-full bg-[#f2f3ff] text-[10px] font-bold text-[#515f74] ring-4 ring-white">
                                        2
                                    </span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#131b2e]">2. Pejabat Penyetujui / Pimpinan</span>
                                        <span className="rounded bg-[#f2f3ff] px-1.5 py-0.5 text-[10px] font-medium text-[#515f74]">Menunggu Kirim</span>
                                    </div>
                                    <p className="text-[11px] leading-snug text-[#515f74]">Verifikasi kebutuhan operasional &amp; persetujuan pengadaan.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setBukaKonfirmasi(true)}
                                disabled={sedangKirim}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#022448] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1e3a5f] disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                                <span>Kirim Pengajuan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => kirimkan('draft')}
                                disabled={sedangKirim}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f3ff] px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#e2e7ff] hover:text-[#022448] disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-base">save</span>
                                <span>Simpan sebagai Draft</span>
                            </button>
                            <Link href={URL_INDEX} className="w-full py-1.5 text-center text-xs font-medium text-[#515f74] transition-colors hover:text-[#dc2626]">
                                Batalkan
                            </Link>
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

            {/* Modal konfirmasi kirim */}
            {bukaKonfirmasi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-[#e2e7ff] bg-white p-6 shadow-xl">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#d5e3fc] text-[#022448]">
                            <span className="material-symbols-outlined text-[28px]">verified</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-bold text-[#022448]">Konfirmasi Pengiriman Pengajuan</h3>
                            <p className="text-xs leading-relaxed text-[#515f74]">
                                Kirim pengajuan sejumlah <span className="font-bold text-[#022448]">{rupiah(total)}</span> ke Pimpinan? Draft yang
                                dikirim tidak dapat diubah lagi.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-[#e2e7ff] pt-2">
                            <button
                                type="button"
                                onClick={() => setBukaKonfirmasi(false)}
                                className="rounded-lg px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#f2f3ff]"
                            >
                                Periksa Kembali
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setBukaKonfirmasi(false);
                                    kirimkan('kirim');
                                }}
                                className="flex items-center gap-1.5 rounded-lg bg-[#022448] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1e3a5f]"
                            >
                                <span className="material-symbols-outlined text-base">send</span> Ya, Kirimkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
