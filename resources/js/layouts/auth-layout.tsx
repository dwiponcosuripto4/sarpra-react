import SarpraLogo from '@/components/sarpra/sarpra-logo';
import type { AuthLayoutProps } from '@/types';

// Cangkang halaman auth ala Stitch "Login Card Terpusat": kartu putih
// dengan aksen navy di atas latar bergrid. Konten form disumbangkan halaman.
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div
            className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 antialiased sm:px-6"
            style={{
                backgroundColor: '#f8fafc',
                backgroundImage:
                    'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(30,58,95,0.05), transparent), linear-gradient(to right, #edf2f7 1px, transparent 1px), linear-gradient(to bottom, #edf2f7 1px, transparent 1px)',
                backgroundSize: '100% 100%, 48px 48px, 48px 48px',
            }}
        >
            <main className="flex w-full flex-1 flex-col items-center justify-center">
                <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_8px_30px_rgb(15,23,42,0.06)]">
                    {/* Aksen dekoratif atas */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#1e3a5f] via-[#2d5587] to-[#1e3a5f]" />

                    <div className="p-8 sm:p-10">
                        {/* Identitas merek */}
                        <div className="mb-6 flex flex-col items-center text-center">
                            <SarpraLogo className="mb-4 size-16 rounded-2xl shadow-md shadow-[#1e3a5f]/20 ring-4 ring-[#1e3a5f]/5" />
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0]/80 bg-[#f1f5f9] px-3 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a5f]"></span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                                    Sistem Pengelolaan Sarana &amp; Prasarana
                                </span>
                            </div>
                        </div>

                        {children}
                    </div>
                </div>

                <footer className="mt-6 text-center text-xs text-[#64748b]">
                    <p>
                        © {new Date().getFullYear()} SARPRA — Sistem Pengelolaan
                        Sarana dan Prasarana
                    </p>
                </footer>
            </main>
        </div>
    );
}
