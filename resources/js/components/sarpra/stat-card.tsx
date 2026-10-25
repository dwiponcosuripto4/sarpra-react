import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Kartu statistik ringkas ala dashboard Stitch: ikon, angka besar, label.
export default function StatCard({
    icon,
    nilai,
    label,
    aksen = '#022448',
    latar = '#f2f3ff',
    catatan,
    className,
}: {
    icon: string;
    nilai: ReactNode;
    label: string;
    aksen?: string;
    latar?: string;
    catatan?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-4 rounded-xl border border-[#e2e7ff] bg-white p-5 shadow-sm',
                className,
            )}
        >
            <span
                className="flex size-11 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: latar, color: aksen }}
            >
                <span className="material-symbols-outlined text-2xl">
                    {icon}
                </span>
            </span>
            <div className="min-w-0">
                <div className="text-2xl font-bold tracking-tight text-[#022448]">
                    {nilai}
                </div>
                <div className="text-xs font-semibold text-[#515f74]">
                    {label}
                </div>
                {catatan && (
                    <div className="mt-0.5 text-[11px] text-[#74777f]">
                        {catatan}
                    </div>
                )}
            </div>
        </div>
    );
}

const badgeVars: Record<string, [string, string]> = {
    hijau: ['#e6f7ef', '#0d7a52'],
    merah: ['#ffdad6', '#93000a'],
    kuning: ['#fff4d6', '#8a6100'],
    biru: ['#d5e3fc', '#022448'],
    abu: ['#f2f3ff', '#57657a'],
};

export function Badge({
    varian = 'abu',
    children,
    className,
}: {
    varian?: keyof typeof badgeVars;
    children: ReactNode;
    className?: string;
}) {
    const [bg, fg] = badgeVars[varian] ?? badgeVars.abu;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                className,
            )}
            style={{ backgroundColor: bg, color: fg }}
        >
            {children}
        </span>
    );
}

// Panel baku untuk kartu konten memanjang.
export function Panel({
    children,
    className,
    judul,
    aksi,
}: {
    children: ReactNode;
    className?: string;
    judul?: string;
    aksi?: ReactNode;
}) {
    return (
        <section
            className={cn(
                'rounded-xl border border-[#e2e7ff] bg-white shadow-sm',
                className,
            )}
        >
            {(judul || aksi) && (
                <div className="flex items-center justify-between border-b border-[#e2e7ff] px-5 py-4">
                    <h2 className="text-sm font-bold text-[#022448]">{judul}</h2>
                    {aksi}
                </div>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

export function EmptyState({
    icon = 'inbox',
    pesan,
    sub,
}: {
    icon?: string;
    pesan: string;
    sub?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c6cf]">
                {icon}
            </span>
            <p className="text-sm font-semibold text-[#43474e]">{pesan}</p>
            {sub && <p className="text-xs text-[#74777f]">{sub}</p>}
        </div>
    );
}
