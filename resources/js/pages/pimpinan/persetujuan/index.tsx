import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';

const rupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n);

const rupiahJt = (n: number) =>
    n >= 1_000_000
        ? `Rp ${(n / 1_000_000).toLocaleString('id-ID', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
          })} Jt`
        : rupiah(n);

const batas = (s: string | null, n = 70) =>
    !s ? '' : s.length > n ? s.slice(0, n).trimEnd() + '...' : s;

const kelasPrioritas: Record<string, string> = {
    Tinggi: 'bg-rose-100 text-rose-800 border-rose-200',
    Sedang: 'bg-amber-100 text-amber-800 border-amber-200',
    Rendah: 'bg-slate-100 text-slate-700 border-slate-200',
    Mendesak: 'bg-red-100 text-red-800 border-red-300',
};

type Usulan = {
    id: number;
    nomor_pengadaan: string;
    tanggal_pengajuan: string | null;
    alasan: string | null;
    user?: {
        name: string | null;
        role?: { name: string | null } | null;
    } | null;
    detail: Array<{
        nama_barang: string | null;
        spesifikasi: string | null;
        subtotal: number;
    }>;
    perencanaan?: {
        prioritas?: { name: string | null } | null;
    } | null;
};

type Props = {
    data: Paginator<Usulan>;
    menunggu: number;
    disetujuiBulanIni: number;
    ditolak: number;
    totalEstimasi: number;
};

const URL_SETUJUI = (id: number) => `/dashboard/pengadaan/${id}/setujui`;
const URL_TOLAK = (id: number) => `/dashboard/pengadaan/${id}/tolak`;

export default function PimpinanPersetujuanIndex() {
    const { props, url } = usePage();
    const p = props as unknown as Props;

    const rows = p.data?.data ?? [];
    const utama = rows[0];
    const prioritasAktif =
        new URLSearchParams(url.split('?')[1] ?? '').get('prioritas') ?? '';

    const [dipilih, setDipilih] = useState<Usulan | null>(null);
    const [catatan, setCatatan] = useState('');
    const [proses, setProses] = useState(false);
    const status = props.status as string | undefined;

    const bukaKonfirmasi = (usulan: Usulan) => {
        setCatatan('');
        setDipilih(usulan);
    };

    const tutupKonfirmasi = () => {
        setDipilih(null);
        setCatatan('');
        setProses(false);
    };

    const putuskan = (keputusan: 'setujui' | 'tolak') => {
        if (!dipilih) {
            return;
        }
        setProses(true);
        router.post(
            keputusan === 'setujui' ? URL_SETUJUI(dipilih.id) : URL_TOLAK(dipilih.id),
            { catatan },
            { preserveScroll: true, onFinish: () => setProses(false) },
        );
    };

    const saringPrioritas = (v: string) => {
        router.get('/pimpinan/persetujuan', { prioritas: v }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const biaya = (usulan: Usulan) =>
        usulan.detail.reduce((a, d) => a + Number(d.subtotal ?? 0), 0);

    return (
        <>
            <Head title="Persetujuan Pengadaan" />

            {/* Judul */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-2 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[28px] text-[#022448]">
                            verified_user
                        </span>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#131b2e]">
                            Persetujuan Pengadaan
                        </h1>
                        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                            {p.menunggu} Menunggu Keputusan
                        </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#515f74]">
                        Tinjau dan berikan persetujuan untuk permohonan pengadaan sarana dan
                        prasarana.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {utama && (
                        <button
                            type="button"
                            onClick={() => bukaKonfirmasi(utama)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#022448] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#1e3a5f]"
                        >
                            <span className="material-symbols-outlined text-lg">
                                rate_review
                            </span>
                            <span>Tinjau Usulan Utama</span>
                        </button>
                    )}
                </div>
            </div>

            {status && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#ecfdf5] p-4">
                    <span className="material-symbols-outlined shrink-0 text-xl text-emerald-600">
                        check_circle
                    </span>
                    <p className="text-sm text-emerald-800">{status}</p>
                </div>
            )}

            {/* 4 kartu KPI */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Usulan Menunggu
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <span className="material-symbols-outlined text-xl">
                                pending_actions
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span
                            className="text-2xl font-extrabold text-[#131b2e]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {p.menunggu}
                        </span>
                        <span
                            className="text-[11px] font-medium text-amber-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Permohonan
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#515f74]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Perlu
                        persetujuan
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Disetujui Bulan Ini
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <span className="material-symbols-outlined text-xl">task_alt</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span
                            className="text-2xl font-extrabold text-emerald-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {p.disetujuiBulanIni}
                        </span>
                        <span
                            className="text-[11px] font-medium text-emerald-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Permohonan
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#515f74]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Disetujui
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-rose-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Ditolak / Revisi
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                            <span className="material-symbols-outlined text-xl">
                                rule_folder
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span
                            className="text-2xl font-extrabold text-rose-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {p.ditolak}
                        </span>
                        <span
                            className="text-[11px] font-medium text-rose-700"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Permohonan
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#515f74]">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Perlu revisi
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-[#e2e7ff] bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#515f74]">
                            Total Anggaran Diajukan
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#022448]">
                            <span className="material-symbols-outlined text-xl">payments</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span
                            className="text-xl font-extrabold text-[#022448]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {rupiahJt(p.totalEstimasi)}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#515f74]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#022448]" /> Total estimasi
                        biaya
                    </div>
                </div>
            </div>

            {/* Tabel antrean */}
            <div className="mt-6 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                <div className="flex flex-col justify-between gap-3 border-b border-[#e2e7ff] bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl text-[#022448]">
                            table_chart
                        </span>
                        <h2 className="text-sm font-bold text-[#131b2e]">
                            Daftar Pengajuan Pengadaan Menunggu Persetujuan
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#515f74]">Penyortiran:</span>
                        <select
                            value={prioritasAktif}
                            onChange={(e) => saringPrioritas(e.target.value)}
                            className="rounded-lg border border-[#e2e7ff] bg-white px-2.5 py-1.5 text-xs font-medium text-[#131b2e] focus:outline-none"
                        >
                            <option value="">Prioritas Tertinggi</option>
                            {['Mendesak', 'Tinggi', 'Sedang', 'Rendah'].map((pr) => (
                                <option key={pr} value={pr}>
                                    {pr}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#e2e7ff] bg-[#f1f5f9]/60 text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                                <th className="px-4 py-3">No. Pengadaan</th>
                                <th className="px-4 py-3">Tanggal Usulan</th>
                                <th className="px-4 py-3">Pengaju & Unit Kerja</th>
                                <th className="px-4 py-3">Nama Paket & Lingkup</th>
                                <th className="px-4 py-3">Prioritas</th>
                                <th className="px-4 py-3 text-right">Total Estimasi Biaya</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] text-[#131b2e]">
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-sm text-[#515f74]"
                                    >
                                        Tidak ada usulan menunggu keputusan. Kerja bagus!
                                    </td>
                                </tr>
                            )}
                            {rows.map((usulan) => {
                                const namaPrioritas =
                                    usulan.perencanaan?.prioritas?.name ?? '-';
                                const paket = usulan.detail[0];
                                return (
                                    <tr
                                        key={usulan.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td
                                            className="px-4 py-3.5 font-bold text-[#022448]"
                                            style={{
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        >
                                            {usulan.nomor_pengadaan}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3.5 text-[#515f74]">
                                            {usulan.tanggal_pengajuan ?? '-'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold">
                                                {usulan.user?.name ?? '-'}
                                            </p>
                                            <p className="text-[11px] text-[#515f74]">
                                                {usulan.user?.role?.name ?? '-'}
                                            </p>
                                        </td>
                                        <td className="max-w-xs px-4 py-3.5">
                                            <p className="font-semibold">
                                                {paket?.nama_barang ?? '-'}
                                                {usulan.detail.length > 1
                                                    ? ` (+${usulan.detail.length - 1} item)`
                                                    : ''}
                                            </p>
                                            <p className="truncate text-[11px] text-[#515f74]">
                                                {batas(usulan.alasan)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                                    kelasPrioritas[namaPrioritas] ??
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                {namaPrioritas}
                                            </span>
                                        </td>
                                        <td
                                            className="px-4 py-3.5 text-right text-sm font-bold text-emerald-700"
                                            style={{
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        >
                                            {rupiah(biaya(usulan))}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                Menunggu Persetujuan
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => bukaKonfirmasi(usulan)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-[#022448] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1e3a5f]"
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    gavel
                                                </span>
                                                <span>Tinjau & Otorisasi</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-[#e2e7ff] bg-[#f1f5f9]/20 px-3">
                    <Pagination<Usulan> pag={p.data} />
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

            {/* Modal konfirmasi persetujuan */}
            {dipilih && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#022448]/70 p-4 backdrop-blur-xs">
                    <div className="my-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-[#e2e7ff] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-[#e2e7ff] pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-[#022448] text-white shadow-xs">
                                    <span className="material-symbols-outlined text-2xl">
                                        gavel
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-[#131b2e]">
                                            Konfirmasi Persetujuan Pengadaan
                                        </h3>
                                        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                            Menunggu Persetujuan
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-[#515f74]">
                                        Tinjau detail permohonan pengadaan sarana dan prasarana.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={tutupKonfirmasi}
                                className="rounded-lg p-1.5 text-[#515f74] transition-colors hover:bg-[#f1f5f9] hover:text-[#022448]"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#e2e7ff] bg-[#f1f5f9]/60 p-4 text-xs sm:grid-cols-2">
                            <div>
                                <span className="text-[11px] font-medium text-[#515f74]">
                                    Nomor & Tanggal Pengajuan:
                                </span>
                                <p
                                    className="mt-0.5 text-sm font-bold text-[#022448]"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    {dipilih.nomor_pengadaan}{' '}
                                    <span className="font-sans text-xs font-normal text-[#515f74]">
                                        • {dipilih.tanggal_pengajuan ?? '-'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className="text-[11px] font-medium text-[#515f74]">
                                    Estimasi Biaya:
                                </span>
                                <p
                                    className="mt-0.5 text-base font-bold text-emerald-700"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    {rupiah(biaya(dipilih))}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-[11px] font-medium text-[#515f74]">
                                    Pengaju:
                                </span>
                                <p className="mt-0.5 font-semibold text-[#131b2e]">
                                    {dipilih.user?.name ?? '-'}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-[11px] font-medium text-[#515f74]">
                                    Nama Barang & Spesifikasi:
                                </span>
                                <p className="mt-0.5 font-semibold leading-relaxed text-[#131b2e]">
                                    {dipilih.detail[0]?.nama_barang ?? '-'}
                                    {dipilih.detail[0]?.spesifikasi
                                        ? ` - ${dipilih.detail[0].spesifikasi}`
                                        : ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="catatanKeputusan"
                                        className="text-xs font-bold text-[#131b2e]"
                                    >
                                        Catatan / Alasan Keputusan:
                                    </label>
                                    <span
                                        className="text-[11px] text-[#515f74]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {catatan.length} / 300 karakter
                                    </span>
                                </div>
                                <textarea
                                    id="catatanKeputusan"
                                    rows={2}
                                    maxLength={300}
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Tuliskan catatan persetujuan atau alasan jika permohonan ditolak..."
                                    className="mt-1 w-full rounded-lg border border-[#e2e7ff] bg-[#f1f5f9] p-3 text-xs text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#1e3a5f] focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-[#e2e7ff] pt-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={tutupKonfirmasi}
                                    className="w-full rounded-lg border border-[#e2e7ff] px-4 py-2 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#f1f5f9] sm:w-auto"
                                >
                                    Batal
                                </button>
                                <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
                                    <button
                                        type="button"
                                        disabled={proses}
                                        onClick={() => putuskan('tolak')}
                                        className="flex-1 rounded-lg bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-red-700 disabled:opacity-50 sm:flex-initial"
                                    >
                                        <span className="flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-base">
                                                cancel
                                            </span>
                                            <span>Tolak</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={proses}
                                        onClick={() => putuskan('setujui')}
                                        className="flex-1 rounded-lg bg-[#16a34a] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:flex-initial"
                                    >
                                        <span className="flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-base">
                                                check_circle
                                            </span>
                                            <span>Setujui</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
