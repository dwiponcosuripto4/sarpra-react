import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Pagination, { type Paginator } from '@/components/sarpra/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';

type Peran = { id: number; name: string; aktif_count?: number };

type UserRow = {
    id: number;
    name: string;
    email: string;
    role_id?: number | null;
    is_active: boolean;
    created_at?: string | null;
    role?: { name: string } | null;
};

type Props = {
    pengguna: Paginator<UserRow>;
    roles: Peran[];
    totalPengguna: number;
    perPeran: Peran[];
    status?: string;
};

const bulanId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function fmtTanggal(iso?: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const dua = (n: number) => String(n).padStart(2, '0');
    return `${dua(d.getDate())} ${bulanId[d.getMonth()]} ${d.getFullYear()}`;
}

function inisial(nama?: string | null): string {
    if (!nama) return '–';
    const bagian = nama.trim().split(/\s+/).filter(Boolean);
    const huruf = (bagian[0]?.[0] ?? '') + (bagian.length > 1 ? bagian[bagian.length - 1][0] : '');
    return huruf.toUpperCase() || '–';
}

// Kelas badge peran (Administrator / Pimpinan / Pengelola) sesuai Blade.
function badgePeran(peran?: string | null): { kelas: string; ikon: string } {
    switch (peran) {
        case 'Administrator':
            return { kelas: 'bg-[#d5e3ff] text-[#022448]', ikon: 'shield' };
        case 'Pimpinan':
            return { kelas: 'bg-[#00422c] text-[#85f8c4]', ikon: 'verified_user' };
        case 'Pengelola Sarana & Prasarana':
            return { kelas: 'bg-[#d5e3fc] text-[#57657a]', ikon: 'inventory' };
        default:
            return { kelas: 'bg-[#f2f3ff] text-[#515f74]', ikon: 'badge' };
    }
}

export default function UsersIndex(props: Props) {
    const { url } = usePage();
    const authId = (usePage().props as { auth?: { user?: { id?: number } } }).auth?.user?.id;

    const [cari, setCari] = useState('');
    const [terpilih, setTerpilih] = useState<number[]>([]);
    const [modalBuka, setModalBuka] = useState(false);
    const pertama = useRef(true);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        is_active: true,
    });

    const timpaKueri = (perubahan: Record<string, string | undefined>) => {
        const target = new URL(url, window.location.origin);
        for (const [k, v] of Object.entries(perubahan)) {
            if (v === undefined || v === '') target.searchParams.delete(k);
            else target.searchParams.set(k, v);
        }
        target.searchParams.delete('page');
        router.get(target.pathname + target.search, {}, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        if (pertama.current) {
            pertama.current = false;
            return;
        }
        const t = setTimeout(() => timpaKueri({ cari }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cari]);

    const perHalaman = ambilKueri(url, 'per_halaman') || '10';

    const semuaTerpilih = props.pengguna.data.length > 0 && terpilih.length === props.pengguna.data.length;

    const pilihSemua = (centang: boolean) => {
        setTerpilih(centang ? props.pengguna.data.map((u) => u.id) : []);
    };

    const kirimBatch = (aksi: 'aktifkan' | 'nonaktifkan') => {
        router.post(
            '/admin/pengguna/batch',
            { ids: terpilih, aksi },
            {
                preserveScroll: true,
                onSuccess: () => setTerpilih([]),
            },
        );
    };

    const submitTambah = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/pengguna', {
            preserveScroll: true,
            onSuccess: () => {
                setModalBuka(false);
                form.reset();
            },
        });
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Kartu judul */}
            <div className="flex flex-col justify-between gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div className="flex max-w-2xl flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center rounded-lg bg-[#d5e3fc] p-1.5 text-[#57657a]">
                            <span className="material-symbols-outlined text-xl">manage_accounts</span>
                        </span>
                        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-[#131b2e]">
                            Manajemen Pengguna
                        </h1>
                    </div>
                    <p className="text-sm text-[#515f74]">
                        Kelola akun pengguna, penugasan peran akses sistem, dan status kredensial operasional sarana
                        prasarana.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/admin/pengguna/ekspor${kueriSaatIni(url)}`}
                        as="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#f2f3ff] px-5 py-2 text-sm font-medium text-[#57657a] shadow-sm transition-colors hover:bg-[#eaedff]"
                    >
                        <span className="material-symbols-outlined text-lg">file_download</span>
                        <span>Export Data</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            form.reset();
                            setModalBuka(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#022448]"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span>+ Tambah Pengguna Baru</span>
                    </button>
                </div>
            </div>

            {props.status && (
                <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: '#e6f7ef', color: '#0d7a52' }}
                >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <p className="text-sm font-medium">{props.status}</p>
                </div>
            )}

            {/* 4 kartu statistik */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#d5e3fc] text-[#1e3a5f]">
                        <span className="material-symbols-outlined text-[26px]">groups</span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                            Total Pengguna
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[28px] font-bold leading-9 text-[#131b2e]">{props.totalPengguna}</span>
                            <span className="text-xs text-[#515f74]">Akun Terdaftar</span>
                        </div>
                    </div>
                </div>
                {props.perPeran.map((peran, i) => {
                    const ikonStat = ['shield_person', 'home_repair_service', 'verified_user'][i % 3];
                    const bgStat = ['bg-[#d5e3ff] text-[#022448]', 'bg-[#d5e3fc] text-[#57657a]', 'bg-[#85f8c4] text-[#005137]'][i % 3];
                    return (
                        <div key={peran.id} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
                            <div
                                className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${bgStat}`}
                            >
                                <span className="material-symbols-outlined text-[26px]">{ikonStat}</span>
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                    {peran.name}
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-[28px] font-bold leading-9 text-[#131b2e]">
                                        {peran.aktif_count ?? 0}
                                    </span>
                                    <span className="text-xs text-[#515f74]">Akun</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-stretch">
                <div className="relative flex flex-1 items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-[#515f74]">
                        search
                    </span>
                    <input
                        type="text"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        placeholder="Cari nama atau email..."
                        className="h-10 w-full rounded-lg bg-[#f2f3ff] pl-11 pr-4 text-sm text-[#131b2e] transition-all placeholder:text-[#74777f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    />
                </div>
                <div className="relative w-full sm:w-56">
                    <select
                        aria-label="Filter peran"
                        value={ambilKueri(url, 'role')}
                        onChange={(e) => timpaKueri({ role: e.target.value })}
                        className="h-10 w-full appearance-none cursor-pointer rounded-lg bg-[#f2f3ff] pl-4 pr-9 text-sm text-[#131b2e] focus:outline-none"
                    >
                        <option value="">Semua Peran</option>
                        {props.roles.map((r) => (
                            <option key={r.id} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-xl text-[#515f74]">
                        expand_more
                    </span>
                </div>
                <div className="relative w-full sm:w-48">
                    <select
                        aria-label="Filter status"
                        value={ambilKueri(url, 'status')}
                        onChange={(e) => timpaKueri({ status: e.target.value })}
                        className="h-10 w-full appearance-none cursor-pointer rounded-lg bg-[#f2f3ff] pl-4 pr-9 text-sm text-[#131b2e] focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-xl text-[#515f74]">
                        expand_more
                    </span>
                </div>
                <Link
                    href="/admin/pengguna"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                >
                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                    <span>Reset Filter</span>
                </Link>
                {terpilih.length > 0 && (
                    <div className="flex items-center justify-end gap-3 rounded-lg bg-[#d5e3fc] px-4 py-1.5">
                        <span className="text-xs font-semibold text-[#57657a]">{terpilih.length} terpilih</span>
                        <button
                            type="button"
                            onClick={() => kirimBatch('aktifkan')}
                            className="rounded bg-white px-2.5 py-1 text-xs text-[#131b2e] shadow-sm hover:bg-[#eaedff]"
                        >
                            Aktifkan
                        </button>
                        <button
                            type="button"
                            onClick={() => kirimBatch('nonaktifkan')}
                            className="rounded bg-[#ba1a1a] px-2.5 py-1 text-xs text-white shadow-sm"
                        >
                            Nonaktifkan
                        </button>
                    </div>
                )}
            </div>

            {/* Tabel */}
            <div className="mt-6 flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f2f3ff] text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                                <th className="w-12 px-5 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        aria-label="Pilih semua"
                                        className="h-4 w-4 cursor-pointer rounded accent-[#1e3a5f]"
                                        checked={semuaTerpilih}
                                        onChange={(e) => pilihSemua(e.target.checked)}
                                    />
                                </th>
                                <th className="min-w-[240px] px-5 py-3">Nama Lengkap &amp; Identitas</th>
                                <th className="min-w-[200px] px-5 py-3">Email / Username</th>
                                <th className="min-w-[190px] px-5 py-3">Peran / Role</th>
                                <th className="min-w-[130px] px-5 py-3">Status Akun</th>
                                <th className="min-w-[140px] px-5 py-3">Tanggal Dibuat</th>
                                <th className="w-28 px-5 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#131b2e]">
                            {props.pengguna.data.map((u) => {
                                const badge = badgePeran(u.role?.name);
                                return (
                                    <tr
                                        key={u.id}
                                        className={`group transition-colors hover:bg-[#f2f3ff]/60 ${u.is_active ? '' : 'opacity-85'}`}
                                    >
                                        <td className="px-5 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                aria-label={`Pilih ${u.name}`}
                                                className="h-4 w-4 cursor-pointer rounded accent-[#1e3a5f]"
                                                checked={terpilih.includes(u.id)}
                                                onChange={(e) =>
                                                    setTerpilih(
                                                        e.target.checked
                                                            ? [...terpilih, u.id]
                                                            : terpilih.filter((id) => id !== u.id),
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        u.is_active
                                                            ? 'bg-[#d5e3fc] text-[#57657a]'
                                                            : 'bg-[#e2e7ff] text-[#515f74]'
                                                    }`}
                                                >
                                                    {inisial(u.name)}
                                                </div>
                                                <div className="flex min-w-0 flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate text-sm font-semibold">{u.name}</span>
                                                        {!u.is_active && (
                                                            <span
                                                                className="material-symbols-outlined text-sm text-[#ba1a1a]"
                                                                title="Akses dibekukan"
                                                            >
                                                                lock
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="text-xs leading-tight text-[#515f74]"
                                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                    >
                                                        ID: USR-{String(u.id).padStart(5, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col">
                                                <span
                                                    className="text-[13px]"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    {u.email}
                                                </span>
                                                <span className="text-xs text-[#515f74]">@{u.email.split('@')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${badge.kelas}`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{badge.ikon}</span>
                                                {u.role?.name ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00422c]/15 px-2.5 py-0.5 text-xs font-medium text-[#00422c]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#3fb687]"></span> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdad6] px-2.5 py-0.5 text-xs font-medium text-[#ba1a1a]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a]"></span> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="px-5 py-3 text-xs text-[#515f74]"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {fmtTanggal(u.created_at)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    className="rounded-lg p-1.5 text-[#515f74] transition-colors hover:bg-[#eaedff] hover:text-[#022448]"
                                                    title="Ubah Profil Pengguna"
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    className="rounded-lg p-1.5 text-[#515f74] transition-colors hover:bg-[#eaedff] hover:text-[#022448]"
                                                    title="Kirim Reset Password"
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-lg">key</span>
                                                </button>
                                                {u.id !== authId && (
                                                    <button
                                                        className={`rounded-lg p-1.5 transition-colors ${
                                                            u.is_active
                                                                ? 'text-[#515f74] hover:bg-[#ffdad6]/40 hover:text-[#ba1a1a]'
                                                                : 'text-[#00422c] hover:bg-[#00422c]/20'
                                                        }`}
                                                        title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun Kembali'}
                                                        type="button"
                                                        onClick={() =>
                                                            router.post(
                                                                `/admin/pengguna/${u.id}/toggle`,
                                                                {},
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            {u.is_active ? 'person_off' : 'check_circle'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {props.pengguna.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#515f74]">
                                        Tidak ada data pengguna.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col items-center justify-between gap-3 bg-[#f2f3ff] px-5 py-3 text-sm text-[#515f74] sm:flex-row">
                    <div className="flex items-center gap-4">
                        <span>
                            Menampilkan{' '}
                            <span className="font-semibold text-[#131b2e]">
                                {props.pengguna.from ?? 0} - {props.pengguna.to ?? 0}
                            </span>{' '}
                            dari{' '}
                            <span className="font-semibold text-[#131b2e]">{props.pengguna.total ?? 0}</span> data
                        </span>
                        <label className="flex items-center gap-1.5">
                            <span>Baris:</span>
                            <select
                                aria-label="Baris per halaman"
                                value={perHalaman}
                                onChange={(e) => timpaKueri({ per_halaman: e.target.value })}
                                className="h-8 rounded bg-white px-1 text-xs text-[#131b2e] focus:outline-none"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {[10, 25, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="border-t border-[#e2e7ff]">
                    <Pagination pag={props.pengguna} />
                </div>
            </div>

            {/* Modal tambah pengguna */}
            <Dialog open={modalBuka} onOpenChange={setModalBuka}>
                <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl">
                    <DialogHeader className="sticky top-0 rounded-t-lg bg-[#f2f3ff] px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-[#1e3a5f] text-white">
                                <span className="material-symbols-outlined text-xl">person_add</span>
                            </span>
                            <div className="flex flex-col">
                                <DialogTitle className="text-base font-bold text-[#131b2e]">
                                    Registrasi Pengguna Baru
                                </DialogTitle>
                                <span className="text-xs text-[#515f74]">
                                    Kredensial dan penugasan akses modul SARPRA
                                </span>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={submitTambah} className="flex flex-col gap-3 p-6 pt-2">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="nama">
                                    Nama Lengkap
                                </label>
                                <input
                                    className="h-10 rounded-lg bg-[#f2f3ff] px-4 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                    id="nama"
                                    name="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Andi Pratama"
                                    required
                                    type="text"
                                />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="email">
                                    Email Dinas
                                </label>
                                <input
                                    className="h-10 rounded-lg bg-[#f2f3ff] px-4 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                    id="email"
                                    name="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="nama@sarpra.go.id"
                                    required
                                    type="email"
                                />
                                <InputError message={form.errors.email} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="password">
                                    Kata Sandi
                                </label>
                                <input
                                    className="h-10 rounded-lg bg-[#f2f3ff] px-4 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                    id="password"
                                    name="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    required
                                    type="password"
                                />
                                <InputError message={form.errors.password} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="password_confirmation">
                                    Konfirmasi Sandi
                                </label>
                                <input
                                    className="h-10 rounded-lg bg-[#f2f3ff] px-4 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    required
                                    type="password"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="role_id">
                                    Peran Akses (Role)
                                </label>
                                <select
                                    className="h-10 rounded-lg bg-[#f2f3ff] px-4 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                    id="role_id"
                                    name="role_id"
                                    value={form.data.role_id}
                                    onChange={(e) => form.setData('role_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Pilih peran
                                    </option>
                                    {props.roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.role_id} />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex cursor-pointer select-none items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer rounded accent-[#1e3a5f]"
                                        name="is_active"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-[#515f74]">Langsung aktifkan akun</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-[#d5e3fc]/60 p-2 text-xs text-[#57657a]">
                            <span className="material-symbols-outlined shrink-0 text-lg text-[#022448]">info</span>
                            <span>
                                Akun dibuat dengan kata sandi di atas. Sampaikan kredensial kepada pengguna terkait.
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                className="rounded-lg px-5 py-2 text-sm text-[#515f74] transition-colors hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                                type="button"
                                onClick={() => setModalBuka(false)}
                            >
                                Batalkan
                            </button>
                            <button
                                className="rounded-lg bg-[#1e3a5f] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#022448]"
                                type="submit"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Akun'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Ambil satu parameter querystring dari URL halaman Inertia.
function ambilKueri(url: string, kunci: string): string {
    const i = url.indexOf('?');
    if (i < 0) return '';
    return new URLSearchParams(url.slice(i + 1)).get(kunci) ?? '';
}

// Kueri saat ini untuk link ekspor (tetap mengikuti filter aktif).
function kueriSaatIni(url: string): string {
    const i = url.indexOf('?');
    return i < 0 ? '' : url.slice(i);
}
