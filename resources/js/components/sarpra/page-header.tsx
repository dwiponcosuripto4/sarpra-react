import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

// Kepala halaman konsisten ala desain Stitch: judul + deskripsi + aksi kanan.
export default function PageHeader({
    title,
    description,
    actions,
    warnaTitle = '#022448',
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    warnaTitle?: string;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <Head title={title} />
                <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: warnaTitle }}
                >
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-[#515f74]">{description}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
