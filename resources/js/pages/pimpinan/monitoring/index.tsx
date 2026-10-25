import { Head, usePage } from '@inertiajs/react';

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

type Kategori = {
    id: number;
    name: string;
    total_unit: number;
};

type Props = {
    tanggalHariIni: string;
    totalUnit: number;
    baik: number;
    ringan: number;
    berat: number;
    valuasi: number;
    perKategori: Kategori[];
};

export default function PimpinanMonitoringIndex() {
    const p = usePage().props as unknown as Props;

    const pctBaik = p.totalUnit > 0 ? Math.round((p.baik / p.totalUnit) * 1000) / 10 : 0;

    return (
        <>
            <Head title="Monitoring Aset" />

            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e7ff] pb-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#131b2e]">
                        Monitoring Aset
                    </h1>
                    <p className="text-sm text-[#515f74]">
                        Pantauan jumlah, valuasi, dan kondisi aset strategis.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#e2e7ff] bg-white px-3.5 py-2 text-xs font-medium text-[#515f74] shadow-xs">
                    <span className="material-symbols-outlined text-lg text-[#1e3a5f]">
                        calendar_today
                    </span>
                    <span>{p.tanggalHariIni}</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                        Total Unit
                    </span>
                    <p className="mt-1 text-3xl font-extrabold text-[#131b2e]">
                        {angka(p.totalUnit)}
                    </p>
                </div>
                <div className="rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                        Valuasi Aset
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#131b2e]">
                        {rupiah(p.valuasi)}
                    </p>
                </div>
                <div className="rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                        Kondisi Baik
                    </span>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                        {satuDesimal(pctBaik)}%
                    </p>
                    <p className="mt-1 text-xs text-[#515f74]">{angka(p.baik)} unit</p>
                </div>
                <div className="rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-xs">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#515f74]">
                        Perlu Perhatian
                    </span>
                    <p className="mt-1 text-3xl font-extrabold text-amber-700">
                        {angka(p.ringan + p.berat)}
                    </p>
                    <p className="mt-1 text-xs text-[#515f74]">Rusak ringan + berat (unit)</p>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#e2e7ff] bg-white shadow-xs">
                <div className="border-b border-[#e2e7ff] p-5">
                    <h2 className="text-base font-bold text-[#131b2e]">
                        Sebaran Aset per Kategori
                    </h2>
                    <p className="mt-0.5 text-xs text-[#515f74]">
                        Jumlah unit per kategori barang
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#e2e7ff] bg-[#f1f5f9] text-[11px] font-semibold uppercase tracking-wider text-[#515f74]">
                            <tr>
                                <th className="px-5 py-3.5">Kategori</th>
                                <th className="px-5 py-3.5">Total Unit</th>
                                <th className="px-5 py-3.5">Proporsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e7ff] text-[#131b2e]">
                            {p.perKategori.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-5 py-10 text-center text-sm text-[#515f74]"
                                    >
                                        Tidak ada data kategori.
                                    </td>
                                </tr>
                            )}
                            {p.perKategori.map((kat) => {
                                const pct =
                                    p.totalUnit > 0
                                        ? Math.round((kat.total_unit / p.totalUnit) * 1000) / 10
                                        : 0;
                                return (
                                    <tr
                                        key={kat.id}
                                        className="transition-colors hover:bg-[#f1f5f9]/60"
                                    >
                                        <td className="px-5 py-3.5 font-semibold">{kat.name}</td>
                                        <td
                                            className="px-5 py-3.5"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {angka(kat.total_unit)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#f1f5f9]">
                                                    <div
                                                        className="h-full rounded-full bg-[#022448]"
                                                        style={{
                                                            width: `${Math.min(100, pct)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] text-[#515f74]">
                                                    {satuDesimal(pct)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
