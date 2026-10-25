import { Link, usePage } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SarpraLogo from '@/components/sarpra/sarpra-logo';
import { logout } from '@/routes';
import { router } from '@inertiajs/react';
import type { AppLayoutProps, BreadcrumbItem } from '@/types';

type MenuItem = {
    key: string;
    icon: string;
    label: string;
    href: string;
};

// Menu modul operasional per peran (replika sidebar.blade.php).
const menuAdmin: MenuItem[] = [
    { key: 'dashboard', icon: 'grid_view', label: 'Dashboard', href: '/dashboard' },
    { key: 'pengguna', icon: 'manage_accounts', label: 'Manajemen Pengguna', href: '/admin/pengguna' },
    { key: 'master', icon: 'inventory_2', label: 'Data Master', href: '/admin/master' },
    { key: 'aktivitas', icon: 'history', label: 'Riwayat Aktivitas', href: '/admin/aktivitas' },
];

const menuPengelola: MenuItem[] = [
    { key: 'dashboard', icon: 'grid_view', label: 'Dashboard', href: '/dashboard' },
    { key: 'perencanaan', icon: 'assignment', label: 'Perencanaan Kebutuhan', href: '/pengelolaan/perencanaan' },
    { key: 'pengadaan', icon: 'shopping_bag', label: 'Pengadaan', href: '/pengelolaan/pengadaan' },
    { key: 'inventarisasi', icon: 'inventory_2', label: 'Inventarisasi', href: '/pengelolaan/inventarisasi' },
    { key: 'pemeliharaan', icon: 'build_circle', label: 'Pemeliharaan', href: '/pengelolaan/pemeliharaan' },
];

const menuPimpinan: MenuItem[] = [
    { key: 'dashboard', icon: 'grid_view', label: 'Dashboard', href: '/dashboard' },
    { key: 'persetujuan', icon: 'assignment_turned_in', label: 'Pengadaan & Persetujuan', href: '/pimpinan/persetujuan' },
    { key: 'monitoring', icon: 'monitoring', label: 'Monitoring Aset', href: '/pimpinan/monitoring' },
    { key: 'pelaporan', icon: 'summarize', label: 'Pelaporan', href: '/pimpinan/pelaporan' },
];

const judulPerMenu: Record<string, string> = {
    dashboard: 'Dashboard',
    pengguna: 'Pengguna',
    master: 'Data Master',
    aktivitas: 'Aktivitas',
    perencanaan: 'Perencanaan',
    pengadaan: 'Pengadaan',
    inventarisasi: 'Inventarisasi',
    pemeliharaan: 'Pemeliharaan',
    persetujuan: 'Persetujuan',
    monitoring: 'Monitoring',
    pelaporan: 'Pelaporan',
};

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps & { breadcrumbs?: BreadcrumbItem[] }) {
    const { auth, notifikasi, tanggalHariIni } = usePage().props;
    const user = auth?.user;
    const namaPeran = user?.role ?? 'Pengguna';

    const menuItems =
        namaPeran === 'Pengelola Sarana & Prasarana'
            ? menuPengelola
            : namaPeran === 'Pimpinan'
                ? menuPimpinan
                : menuAdmin;

    // Menu aktif ditentukan dari URL saat ini (setara prop menuAktif Blade).
    const currentPath = typeof window !== 'undefined' ? window.location.href.replace(window.location.origin, '') : '';
    const aktif = [...menuItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => currentPath.startsWith(item.href) || (item.key === 'dashboard' && (currentPath === '/' || currentPath.startsWith('/dashboard')))) ?? menuItems[0];

    const judulHalaman = breadcrumbs[0]?.title ?? judulPerMenu[aktif.key] ?? 'Dashboard';

    const handleLogout = () => {
        router.post(logout().url);
    };

    // Jam aman guest (nilai nol bila tanpa notifikasi).
    const notifBelumDibaca = notifikasi?.belumDibaca ?? 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#131b2e] antialiased">
            {/* Sidebar SARPRA */}
            <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col justify-between bg-[#1e3a5f] shadow-sm lg:flex">
                <div className="flex flex-col">
                    <div className="flex h-16 items-center gap-3 border-b border-[#022448] px-6">
                        <SarpraLogo className="size-8 rounded-lg shadow-sm" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white leading-tight">SARPRA</span>
                            <span className="text-xs font-semibold text-[#8aa4cf] tracking-wider uppercase">Asset &amp; Infra</span>
                        </div>
                    </div>
                    <div className="px-5 pt-6 pb-2">
                        <span className="px-2 text-xs font-semibold text-[#8aa4cf] uppercase tracking-wider">Modul Operasional</span>
                    </div>
                    <nav className="flex flex-col gap-1 px-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    aktif.key === item.key
                                        ? 'bg-[#022448] font-bold text-white shadow-sm'
                                        : 'text-[#8aa4cf] hover:bg-[#254670] hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-5">
                    <div className="mx-1 mb-5 rounded-lg bg-[#022448] p-4">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#85f8c4] opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#85f8c4]"></span>
                            </span>
                            <span className="text-xs font-semibold text-white">SARPRA v1.0</span>
                        </div>
                        <div className="text-xs text-[#8aa4cf] leading-relaxed">Sistem Pengelolaan Sarana dan Prasarana</div>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-64">
                {/* Header SARPRA */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:px-8">
                    <div className="flex items-center gap-3">
                        <SarpraLogo className="size-8 rounded-lg lg:hidden" />
                        <div className="hidden items-center gap-1.5 text-xs font-semibold text-[#515f74] sm:flex">
                            <span className="font-bold text-[#1e3a5f]">SARPRA</span>
                            <span>/</span>
                            <span className="text-[#43474e]">{namaPeran}</span>
                            <span>/</span>
                            <span className="rounded bg-[#d5e3fc]/60 px-2 py-0.5 font-bold text-[#022448]">{judulHalaman}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="flex items-center gap-1">
                            <button
                                aria-label="Notifikasi"
                                className="relative rounded-lg p-2 text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[22px]">notifications</span>
                                {notifBelumDibaca > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white">
                                        {notifBelumDibaca > 9 ? '9+' : notifBelumDibaca}
                                    </span>
                                )}
                            </button>
                            <button
                                aria-label="Bantuan"
                                className="rounded-lg p-2 text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[22px]">help_outline</span>
                            </button>
                        </div>
                        <div className="hidden h-6 w-px bg-[#e2e7ff] sm:block"></div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-[#f2f3ff]" type="button">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
                                        {user?.initials || '–'}
                                    </span>
                                    <span className="hidden flex-col text-left leading-tight sm:flex">
                                        <span className="text-sm font-semibold text-[#131b2e]">{user?.name ?? '–'}</span>
                                        <span className="mt-0.5 self-start rounded bg-[#d5e3fc] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[#57657a]">
                                            {namaPeran}
                                        </span>
                                    </span>
                                    <span className="material-symbols-outlined text-lg text-[#515f74]">keyboard_arrow_down</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
                                        {user?.initials || '–'}
                                    </span>
                                    <div className="grid leading-tight">
                                        <span className="truncate text-sm font-semibold text-[#131b2e]">{user?.name ?? '–'}</span>
                                        <span className="truncate text-xs text-[#515f74]">{user?.email ?? ''}</span>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">cog</span>
                                        Pengaturan
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-[#ba1a1a] focus:text-[#ba1a1a]"
                                    onClick={handleLogout}
                                >
                                    <span className="material-symbols-outlined text-base">arrow_right_alt</span>
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-4rem)] px-4 py-6 md:px-8 md:py-8">{children}</main>
            </div>
        </div>
    );
}
