# Konvensi Konversi Blade → React/TSX (SARPRA)

Acuan wajib saat menulis halaman di `resources/js/pages/**`.

## Tumpukan
- React 19 + TypeScript + Inertia 3 + Tailwind v4 (Laravel 13 starter kit).
- Halaman = 1 default export function di `resources/js/pages/<komponen>.tsx` (komponen harus persis dengan nama yang dirender `Inertia::render()` di `routes/web.php`).
- Layout aplikasi (sidebar navy + header) **sudah otomatis** diterapkan `app.tsx` untuk semua halaman di bawah `admin/`, `pengelola/`, `pimpinan/` dan `settings/`. Halaman TIDAK boleh me-render sidebar/header sendiri. Isi saja konten utama.
- Ukuran layar utama: gunakan `<div className="mx-auto max-w-7xl space-y-6">` atau grid layout serupa.

## Ikon
- Hanya Material Symbols (bukan lucide):
  `<span className="material-symbols-outlined text-xl">grid_view</span>`

## Palet warna (Stitch "Institutional Modernity", tanpa dark mode)
| Kegunaan | Hex |
| --- | --- |
| Latar halaman (dari layout) | `#f8fafc` |
| Navy primary (tombol aksi, teks judul) | `#022448` |
| Navy container (sidebar, avatar) | `#1e3a5f` |
| Teks utama | `#131b2e` |
| Teks sekunder | `#515f74` |
| Teks muted | `#74777f` |
| Border/garis | `#e2e7ff` |
| Surface biru muda (hover/chip) | `#f2f3ff` |
| Chip biru (badge ringan/label) | `#d5e3fc` |
| Sidebar teks non-aktif | `#8aa4cf` |
| Sidebar hover | `#254670` |
| Sukses | bg `#e6f7ef` / teks `#0d7a52` |
| Error | bg `#ffdad6` / teks `#93000a` (aksi bahaya `#ba1a1a`) |
| Warning | bg `#fff4d6` / teks `#8a6100` |

- Tombol aksi utama: `bg-[#022448] text-white hover:bg-[#0a2f57] shadow-sm` (via shadcn Button dengan className tambahan, atau `<Button className="bg-[#022448] text-white hover:bg-[#0a2f57]">`).
- Kartu: `rounded-xl border border-[#e2e7ff] bg-white shadow-sm`.

## Komponen yang BOLEH dipakai
- shadcn/ui tersedia: `@/components/ui/{button,card,badge,input,label,select,dialog,dropdown-menu,table,textarea,alert,skeleton,separator,checkbox,tooltip,sheet,spinner}`.
- Helper SARPRA (dibuat di `@/components/sarpra/`):
  - `PageHeader` (`title`, `description?`, `actions?`) → dari `@/components/sarpra/page-header`
  - `StatCard` (`icon`, `nilai`, `label`, `catatan?`, `aksen?`, `latar?`) dan `Badge` (`varian: hijau|merah|kuning|biru|abu`) serta `Panel` (`judul?`, `aksi?`) dan `EmptyState` (`icon?`, `pesan`, `sub?`) → dari `@/components/sarpra/stat-card`
  - default `Pagination` di `@/components/sarpra/pagination`, dengan type `Paginator<T>`

## Bentuk data paginator (Laravel → Inertia, DATAR)
```ts
type Paginator<T> = {
  data: T[];
  links?: { url: string | null; label: string; active: boolean }[];
  current_page?: number;
  from?: number | null;
  to?: number | null;
  last_page?: number;
  total?: number;
};
```
Items selalu di `pag.data`. Searh/filter/lazy props: gunakan `<Input>` dengan `onChange` debounced + `router.get(urlJakarta)` — lebih aman: pattern form `<select>`/filter tombol yang `router.get()` dengan query param, `preserveState: true`, `preserveScroll: true`.

## Interaksi server
- Navigasi link: `<Link href="...">` dari `@inertiajs/react`.
- Submit form: gunakan `useForm()` (`reset`, `post`, `put`, `delete`, `errors`, `processing`) — paling aman, atau komponen `<Form>` bila route wayfinder menyediakan `.form()` (cek eksport file route dulu).
- URL route: gunakan modul wayfinder yang sudah tergenerate di `resources/js/routes/<modul>` (`pengadaan`, `perencanaan`, `inventarisasi`, `pemeliharaan`, `pengguna`, `master`, `aktivitas`, `persetujuan`, `monitoring`, `pelaporan`, `laporan`, `dashboard`, `login`, `logout`). PENTING: **baca dulu file route-nya** untuk melihat nama function yang tergenerate (`index`, `create`, `store`, `update`, `destroy`, `ekspor`…). Kalau tidak yakin, pakai URL string persis seperti di `routes/web.php` (path space se-character exact).
- Aksi delete/confirm via `router.delete(url)` + inline confirm sederhana (`window.confirm("...")`), sesuai Blade lama.
- File (unggah): `<Input type="file">` + FormData lewat `router.post` — lihat halaman aslinya.

## Flash message
`usePage().props.status` (sukses) dan `.error` (gagal) → satu banner di atas konten:
sukses bg `#e6f7ef` teks `#0d7a52`, gagal bg `#ffdad6` teks `#93000a`. Bundler icon `<span className="material-symbols-outlined">check_circle</span>` / `error`.

## Budaya menulis
- Seluruh copy UI berbahasa Indonesia (label, tombol, pesan, kosong, halaman header).
- Deskripsi/label teknis yang merujuk istilah data: ikuti Blade asli.
- Tidak ada kelas `dark:*`. Tidak ada referensi log-out warna hitam bawaan kit. Tidak ada import komponen yang sudah dihapus (2FA/passkeys/verify-email). Jangan import `@/routes/two-factor`, `@/routes/passkeys`, `@/routes/verification`, `@/actions/Laravel/Passkeys/**`.
- Wajib lolos `npm run types:check` (tsc --noEmit) dan `npm run build`. Definisikan tipe props lokal per halaman dengan field yang dipakai saja (fitur Blade lain boleh dirapiin).
- Hasil visual setara Blade asli (layout, warna, urutan section), dengan penambahan struktur bersih ala dua kolom 1/3–2/3 bila di Blade dipisah kanan/kiri.
- Detail token warna, ikon, ikon material, dsb. sebaiknya sesuai Blade setara; pilihan grid `*gap-4 sm:*` dst. dari Blade diadaptasi ke React + tailwind class sama.
