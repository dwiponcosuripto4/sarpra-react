import { Head, Link } from '@inertiajs/react';
import SarpraLogo from '@/components/sarpra/sarpra-logo';
import { dashboard, login } from '@/routes';
import type { Auth } from '@/types';

export default function Welcome({ auth }: { auth: Auth }) {
    return (
        <>
            <Head title="SARPRA — Sistem Pengelolaan Sarana dan Prasarana" />
            <div
                className="flex min-h-dvh flex-col px-4 py-10 antialiased sm:px-6"
                style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage:
                        'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(30,58,95,0.06), transparent), linear-gradient(to right, #edf2f7 1px, transparent 1px), linear-gradient(to bottom, #edf2f7 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 48px 48px, 48px 48px',
                }}
            >
                <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SarpraLogo className="size-10 rounded-xl shadow-md shadow-[#1e3a5f]/20" />
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-[#0f172a]">
                                SARPRA
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                                Asset &amp; Infrastructure
                            </span>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0]/80 bg-white px-3 py-1 text-[11px] font-semibold text-[#475569]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0d7a52]"></span>
                        Sistem Aktif
                    </span>
                </header>

                <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
                    <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0]/80 bg-white px-3 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a5f]"></span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                            Sistem Pengelolaan Sarana &amp; Prasarana
                        </span>
                    </span>
                    <h1 className="text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl">
                        Satu Pintu{' '}
                        <span className="text-[#1e3a5f]">Sarana &amp; Prasarana</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#475569] sm:text-base">
                        Perencanaan kebutuhan, pengadaan, inventarisasi, dan
                        pemeliharaan aset berjalan dalam satu sistem terpadu —
                        dari usulan hingga persetujuan pimpinan.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#1e3a5f]/20 transition-all hover:bg-[#152943] hover:shadow-lg"
                            >
                                Buka Dashboard
                                <span className="material-symbols-outlined text-[18px]">
                                    arrow_forward
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#1e3a5f]/20 transition-all hover:bg-[#152943] hover:shadow-lg"
                                >
                                    Masuk ke Sistem
                                    <span className="material-symbols-outlined text-[18px]">
                                        arrow_forward
                                    </span>
                                </Link>
                                <a
                                    href="#tentang"
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-6 py-3.5 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#f1f5f9]"
                                >
                                    Pelajari Modul
                                </a>
                            </>
                        )}
                    </div>

                    {/* Ringkasan modul */}
                    <div
                        id="tentang"
                        className="mt-14 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {[
                            { icon: 'assignment', judul: 'Perencanaan', isi: 'Usulan kebutuhan tahunan diatur prioritasnya.' },
                            { icon: 'shopping_bag', judul: 'Pengadaan', isi: 'Pengajuan & persetujuan pengadaan barang.' },
                            { icon: 'inventory_2', judul: 'Inventarisasi', isi: 'Registrasi aset dengan kondisi terkini.' },
                            { icon: 'build_circle', judul: 'Pemeliharaan', isi: 'Tiket pemeliharaan berkala & insidental.' },
                        ].map((m) => (
                            <div
                                key={m.judul}
                                className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left shadow-[0_4px_18px_rgb(15,23,42,0.04)]"
                            >
                                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#f2f3ff] text-[#1e3a5f]">
                                    <span className="material-symbols-outlined text-[22px]">
                                        {m.icon}
                                    </span>
                                </span>
                                <div className="text-sm font-bold text-[#0f172a]">
                                    {m.judul}
                                </div>
                                <div className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                    {m.isi}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                <footer className="mx-auto mt-10 text-center text-xs text-[#64748b]">
                    © {new Date().getFullYear()} SARPRA — Sistem Pengelolaan
                    Sarana dan Prasarana
                </footer>
            </div>
        </>
    );
}
