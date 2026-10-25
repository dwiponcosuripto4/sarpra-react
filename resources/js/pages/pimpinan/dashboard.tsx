import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Pola format uang Rupiah dipakai ulang di seluruh halaman pimpinan.
const rupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n);

const angka = (n: number) => new Intl.NumberFormat('id-ID').format(n);

const satuDesimal = (n: number) =>
    n.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

const batas = (s: string | null, n = 70) =>
    !s ? '' : s.length > n ? s.slice(0, n).trimEnd() + '...' : s;

const nomorDuaDigit = (i: number) => String(i + 1).padStart(2, '0');

const kelasPrioritas: Record<string, string> = {
    Tinggi: 'bg-rose-100 text-rose-700 border-rose-200',
    Sedang: 'bg-amber-100 text-amber-800 border-amber-200',
    Rendah: 'bg-slate-100 text-slate-700 border-slate-200',
    Mendesak: 'bg-red-100 text-red-800 border-red-300',
};

type AntreanItem = {
    id: number;
    nomor_pengadaan: string;
    tanggal_pengajuan: string | null;
    alasan: string | null;
    user?: {
        name: string | null;
        role?: { name: string | null } | null;
    } | null;
    detail: Array<{ nama_barang: string | null; subtotal: number }>;
    perencanaan?: {
        prioritas?: { name: string | null } | null;
    } | null;
};

type Props = {
    tanggalHariIni: string;
    totalUnit: number;
    valuasi: number;
    pagu: number;
    realisasi: number;
    baik: number;
    ringan: number;
    berat: number;
    antrean: AntreanItem[];
    totalAntrean: number;
    totalButuhRespon: number;
};

const TARGET_TAHUN = new Date().getFullYear();

export default function PimpinanDashboard() {
    const { props, url } = usePage();
    const p = props as unknown as Props;

    const pctRealisasi = p.pagu > 0 ? Math.round((p.realisasi / p.pagu) * 1000) / 10 : 0;
    const pctBaik = p.totalUnit > 0 ? Math.round((p.baik / p.totalUnit) * 1000) / 10 : 0;
    const pctRingan = p.totalUnit > 0 ? Math.round((p.ringan / p.totalUnit) * 1000) / 10 : 0;
    const pctBerat = p.totalUnit > 0 ? Math.round((p.berat / p.totalUnit) * 1000) / 10 : 0;

    const [proses, setProses] = useState<number | null>(null);
    const status = props.status as string | undefined;
    const prioritasAktif = new URLSearchParams(url.split('?')[1] ?? '').get('prioritas') ?? '';

    const saringPrioritas = (v: string) => {
        router.get('/dashboard', { prioritas: v }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const putuskan = (id: number, aksi: 'setujui' | 'tolak') => {
        setProses(id);
        router.post(`/dashboard/pengadaan/${id}/${aksi}`, {}, {
            preserveScroll: true,
            onFinish: () => setProses(null),
        });
    };

    return (
        <>
            <Head title="Dashboard Pimpinan" />

            {/* Judul */}
            <div className="flex flex-col gap-4 pb-1 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[#131b2e]">
                            Dashboard Eksekutif & Pengawasan
                        </h1>
                        <span className="rounded-full border border-[#022448]/20 bg-[#022448]/10 px-2.5 py-0.5 text-xs font-bold text-[#022448]">
                            Portal Pimpinan
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[#515f74]">
                        Pemantauan aset strategis, realisasi anggaran pengadaan, dan otorisasi
                        persetujuan terpadu.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#515f74] shadow-xs">
                        <span className="material-symbols-outlined text-base text-[#022448]">
                            calendar_today
                        </span>
                        <span>
                            T.A. {angka(TARGET_TAHUN)}/{angka(TARGET_TAHUN + 1)}
                        </span>
                    </div>
                    <a
                        href="/dashboard/ekspor-eksekutif"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#022448] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1e3a5f]"
                    >
                        <span className="material-symbols-outlined text-base">
                            picture_as_pdf
                        </span>
                        <span>Ekspor Laporan Eksekutif</span>
                    </a>
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

            {/* Kartu metrik */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs transition-all hover:border-[#8aa4cf]">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                Total Keseluruhan Aset
                            </span>
                            <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#131b2e]">
                                {angka(p.totalUnit)}{' '}
                                <span className="text-sm font-semibold text-[#515f74]">Unit</span>
                            </h3>
                        </div>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#022448]">
                            <span className="material-symbols-outlined text-[22px]">
                                devices_other
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-xs">
                        <span className="font-medium text-[#515f74]">
                            Valuasi Est.{' '}
                            <strong className="font-semibold text-[#131b2e]">
                                {rupiah(p.valuasi)}
                            </strong>
                        </span>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs transition-all hover:border-[#8aa4cf]">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                Realisasi Anggaran
                            </span>
                            <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#131b2e]">
                                {rupiah(p.realisasi)}
                            </h3>
                        </div>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <span className="material-symbols-outlined text-[22px]">
                                account_balance_wallet
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-1.5 border-t border-[#f1f5f9] pt-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[#515f74]">Pagu: {rupiah(p.pagu)}</span>
                            <span className="font-bold text-[#022448]">
                                {satuDesimal(pctRealisasi)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                            <div
                                className="h-full rounded-full bg-[#022448]"
                                style={{ width: `${Math.min(100, pctRealisasi)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs transition-all hover:border-[#8aa4cf]">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                    Menunggu Otorisasi
                                </span>
                                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                            </div>
                            <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#131b2e]">
                                {angka(p.totalAntrean)}{' '}
                                <span className="text-sm font-semibold text-amber-800">Usulan</span>
                            </h3>
                        </div>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-amber-900">
                            <span className="material-symbols-outlined text-[22px]">
                                notification_important
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-xs">
                        <span className="font-medium text-[#515f74]">Total butuh respon:</span>
                        <span
                            className="font-bold text-amber-950"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {rupiah(p.totalButuhRespon)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs transition-all hover:border-[#8aa4cf]">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                Kondisi & Kelaikan Aset
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-2">
                                <h3 className="text-2xl font-extrabold tracking-tight text-emerald-700">
                                    {satuDesimal(pctBaik)}%
                                </h3>
                                <span className="text-xs font-semibold text-[#515f74]">
                                    Kondisi Baik
                                </span>
                            </div>
                        </div>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                            <span className="material-symbols-outlined text-[22px]">verified</span>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-[#f1f5f9] pt-3">
                        <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-emerald-500" style={{ width: `${pctBaik}%` }} />
                            <div className="h-full bg-amber-400" style={{ width: `${pctRingan}%` }} />
                            <div className="h-full bg-rose-500" style={{ width: `${pctBerat}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#515f74]">
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Baik (
                                {angka(p.baik)})
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-400" /> R. Ringan (
                                {angka(p.ringan)})
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-rose-500" /> R. Berat (
                                {angka(p.berat)})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Antrean persetujuan */}
            <div className="mt-6 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                <div className="flex flex-col justify-between gap-3 border-b border-[#e2e7ff] bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 rounded-lg bg-amber-100 p-2 text-amber-800">
                            <span className="material-symbols-outlined text-xl">gavel</span>
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[#131b2e]">
                                    Pengajuan Pengadaan Menunggu Persetujuan
                                </h2>
                                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                                    {p.totalAntrean} Menunggu
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#515f74]">
                                Daftar proposal pengadaan yang memerlukan otorisasi Pejabat Pembuat
                                Komitmen (PPK) / Pimpinan.
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                        <span className="font-medium text-[#515f74]">Filter Prioritas:</span>
                        <select
                            value={prioritasAktif}
                            onChange={(e) => saringPrioritas(e.target.value)}
                            className="rounded-lg border border-[#e2e7ff] bg-white px-2.5 py-1.5 text-xs font-medium text-[#131b2e] focus:border-[#022448] focus:outline-none"
                        >
                            <option value="">Semua Prioritas</option>
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
                            <tr className="border-b border-[#e2e7ff] bg-[#f1f5f9]/70 text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                                <th className="w-12 px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3">Tanggal & No. Usulan</th>
                                <th className="px-4 py-3">Pengaju & Unit Kerja</th>
                                <th className="px-4 py-3">Nama Paket & Lingkup</th>
                                <th className="px-4 py-3 text-right">Total Estimasi Biaya</th>
                                <th className="px-4 py-3 text-center">Prioritas</th>
                                <th className="w-52 px-4 py-3 text-center">Aksi Keputusan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] text-[#131b2e]">
                            {p.antrean.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-[#515f74]"
                                    >
                                        Tidak ada usulan menunggu keputusan.
                                    </td>
                                </tr>
                            )}
                            {p.antrean.map((item, i) => {
                                const namaPrioritas = item.perencanaan?.prioritas?.name ?? '-';
                                const paket = item.detail[0];
                                return (
                                    <tr
                                        key={item.id}
                                        className="group transition-colors hover:bg-slate-50"
                                    >
                                        <td
                                            className="px-4 py-3.5 text-center font-medium text-[#515f74]"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {nomorDuaDigit(i)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div
                                                className="font-bold text-[#022448]"
                                                style={{
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                }}
                                            >
                                                {item.nomor_pengadaan}
                                            </div>
                                            <div className="mt-0.5 text-[11px] text-[#515f74]">
                                                {item.tanggal_pengajuan ?? '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold">
                                                {item.user?.name ?? '-'}
                                            </div>
                                            <div className="mt-0.5 text-[11px] text-[#515f74]">
                                                {item.user?.role?.name ?? '-'}
                                            </div>
                                        </td>
                                        <td className="max-w-xs px-4 py-3.5">
                                            <div className="font-bold transition-colors group-hover:text-[#022448]">
                                                {paket?.nama_barang ?? '-'}
                                                {item.detail.length > 1
                                                    ? ` (+${item.detail.length - 1} item)`
                                                    : ''}
                                            </div>
                                            <div className="mt-0.5 truncate text-[11px] text-[#515f74]">
                                                {batas(item.alasan)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div
                                                className="text-sm font-extrabold"
                                                style={{
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                }}
                                            >
                                                {rupiah(item.detail.reduce((a, d) => a + Number(d.subtotal ?? 0), 0))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                                    kelasPrioritas[namaPrioritas] ??
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                {namaPrioritas}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    title="Setujui Proposal"
                                                    disabled={proses !== null}
                                                    onClick={() => putuskan(item.id, 'setujui')}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        check_circle
                                                    </span>
                                                    <span>Setujui</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Tolak / Kembalikan"
                                                    disabled={proses !== null}
                                                    onClick={() => putuskan(item.id, 'tolak')}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        cancel
                                                    </span>
                                                    <span>Tolak</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-[#e2e7ff] bg-[#f1f5f9]/40 px-6 py-3.5 text-xs text-[#515f74]">
                    <div>
                        Menampilkan{' '}
                        <strong>
                            <span
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {p.antrean.length}
                            </span>
                        </strong>{' '}
                        dari <strong>{p.totalAntrean}</strong> usulan menunggu keputusan
                    </div>
                    <a
                        href="/pimpinan/persetujuan"
                        className="inline-flex items-center gap-1 font-semibold text-[#022448] hover:underline"
                    >
                        <span>Buka Antrean Lengkap Pengadaan</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
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
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operasional Aktif
                    </span>
                    <span>•</span>
                    <span>Hak Cipta © 2026</span>
                </div>
            </footer>
        </>
    );
}
