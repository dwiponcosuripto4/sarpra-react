import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { request } from '@/routes/password';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [lihatSandi, setLihatSandi] = useState(false);
    const [tutupError, setTutupError] = useState(false);
    const [tutupStatus, setTutupStatus] = useState(false);

    const form = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store().url, {
            onSuccess: () => form.reset('password'),
            onError: () => setTutupError(false),
        });
    };

    return (
        <>
            <Head title="Masuk ke Sistem" />

            <div className="mb-6 flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                    Masuk ke Sistem
                </h1>
                <p className="mt-1 text-sm font-normal text-[#475569]">
                    Kelola sarana dan prasarana terpadu
                </p>
            </div>

            {/* Banner gagal kredensial */}
            {form.errors.email && !tutupError && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#f87171]/40 border-l-4 border-l-[#b91c1c] bg-[#fef2f2] p-3.5">
                    <span className="mt-0.5 shrink-0 text-[20px] text-[#b91c1c]">
                        <span className="material-symbols-outlined">error</span>
                    </span>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-[#b91c1c]">
                            Kredensial tidak valid
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#b91c1c]/90">
                            Username/email atau kata sandi yang Anda masukkan
                            salah. Silakan coba lagi.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTutupError(true)}
                        className="rounded p-0.5 text-[#b91c1c]/70 transition-colors hover:text-[#b91c1c]"
                        aria-label="Tutup notifikasi"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            close
                        </span>
                    </button>
                </div>
            )}

            {/* Flash status */}
            {status && !tutupStatus && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#86efac]/60 border-l-4 border-l-[#15803d] bg-[#f0fdf4] p-3.5">
                    <span className="shrink-0 text-[20px] text-[#15803d]">
                        <span className="material-symbols-outlined">
                            task_alt
                        </span>
                    </span>
                    <p className="flex-1 text-xs font-medium text-[#15803d]">
                        {status}
                    </p>
                    <button
                        type="button"
                        onClick={() => setTutupStatus(true)}
                        className="rounded p-0.5 text-[#15803d]/70 transition-colors hover:text-[#15803d]"
                        aria-label="Tutup notifikasi"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            close
                        </span>
                    </button>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
                {/* Identitas */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#475569]"
                    >
                        Username / Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-[#64748b]">
                            account_circle
                        </span>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            placeholder="Masukkan username atau email"
                            autoComplete="username"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="w-full rounded-xl border border-[#cbd5e1] bg-white py-3 pl-11 pr-4 text-sm text-[#0f172a] transition duration-150 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 focus:outline-none"
                        />
                    </div>
                    <div className="mt-1">
                        <InputError message={form.errors.email} />
                    </div>
                </div>

                {/* Kata Sandi */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#475569]"
                    >
                        Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-[#64748b]">
                            lock
                        </span>
                        <input
                            id="password"
                            type={lihatSandi ? 'text' : 'password'}
                            name="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Masukkan kata sandi"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            className="w-full rounded-xl border border-[#cbd5e1] bg-white py-3 pl-11 pr-11 text-sm text-[#0f172a] transition duration-150 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setLihatSandi((v) => !v)}
                            className="absolute right-3.5 flex items-center justify-center rounded p-1 text-[#64748b] transition-colors hover:text-[#0f172a]"
                            aria-label="Tampilkan atau sembunyikan kata sandi"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {lihatSandi ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    <div className="mt-1">
                        <InputError message={form.errors.password} />
                    </div>
                </div>

                {/* Opsi bantu */}
                {canResetPassword && (
                    <div className="flex items-center justify-between pt-1">
                        <label
                            htmlFor="remember"
                            className="flex cursor-pointer items-center gap-2 select-none"
                        >
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                checked={form.data.remember}
                                onCheckedChange={(v: boolean | string) =>
                                    form.setData('remember', Boolean(v))
                                }
                                className="accent-[#1e3a5f]"
                            />
                            <span className="text-xs font-medium text-[#475569]">
                                Ingat saya
                            </span>
                        </label>
                        <TextLink
                            href={request()}
                            tabIndex={4}
                            className="text-xs font-semibold text-[#1e3a5f] underline-offset-2 hover:underline"
                        >
                            Lupa Password?
                        </TextLink>
                    </div>
                )}

                {form.errors.remember && (
                    <InputError message={form.errors.remember} />
                )}

                {/* Tombol masuk */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        data-test="login-button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#1e3a5f]/20 transition-all duration-200 hover:bg-[#152943] hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    >
                        <span>{form.processing ? 'Memproses…' : 'Masuk'}</span>
                        {form.processing ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">
                                progress_activity
                            </span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
