import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Bentuk paginator Laravel setelah diserialisasi oleh Inertia (datar).
export type Paginator<T = unknown> = {
    data: T[];
    links?: Array<{ url: string | null; label: string; active: boolean }>;
    current_page?: number;
    from?: number | null;
    to?: number | null;
    last_page?: number;
    total?: number;
};

const labelLink = (label: string) =>
    label.replace(/&laquo;|&raquo;/g, '').trim();

export default function Pagination<T = unknown>({ pag }: { pag: Paginator<T> | undefined }) {
    if (!pag || (pag.current_page ?? 1) < 1 || (pag.last_page ?? 1) <= 1) {
        return null;
    }

    const current = pag.current_page ?? 1;
    const last = pag.last_page ?? 1;
    const links = (pag.links ?? []).filter(
        (l) =>
            l.url !== null &&
            !/previous|sebelumnya|next|berikutnya|&mdash;/i.test(l.label),
    );

    const ke = (url: string | null) => {
        if (!url) {
            return;
        }
        const target = new URL(url, window.location.origin);
        router.get(
            target.pathname + target.search,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
            <p className="text-xs text-[#515f74]">
                Menampilkan{' '}
                <span className="font-semibold text-[#131b2e]">
                    {pag.from ?? 0}–{pag.to ?? 0}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-[#131b2e]">
                    {pag.total}
                </span>{' '}
                item
            </p>
            <div className="flex items-center gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    disabled={current <= 1}
                    onClick={() =>
                        ke(
                            pag.links?.find((l) =>
                                /previous|sebelumnya/i.test(l.label),
                            )?.url ?? null,
                        )
                    }
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                {links.map((l, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => ke(l.url)}
                        aria-current={l.active ? 'page' : undefined}
                        className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition-colors ${
                            l.active
                                ? 'bg-[#022448] text-white'
                                : 'text-[#515f74] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                        }`}
                    >
                        {labelLink(l.label)}
                    </button>
                ))}
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    disabled={current >= last}
                    onClick={() =>
                        ke(
                            pag.links?.find((l) =>
                                /next|berikutnya/i.test(l.label),
                            )?.url ?? null,
                        )
                    }
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
