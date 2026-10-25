# SARPRA — Sistem Pengelolaan Sarana dan Prasarana

SARPRA adalah aplikasi untuk mengelola perencanaan kebutuhan, pengadaan, inventarisasi, pemeliharaan, dan pelaporan sarana dan prasarana.

## Teknologi

- Laravel 13
- React
- TypeScript (TSX)
- Inertia.js
- Tailwind CSS v4
- Vite
- Laravel Fortify untuk autentikasi

## Struktur Repository

```text
sarpra-react/
├── AGENTS.md
├── README.md
├── docs/
│   ├── database-schema/
│   ├── ui-ux/
│   ├── PRD_SARPRA.md
│   ├── Ringkasan Flowchart SARPRA.md
│   ├── Ringkasan Use Case SARPRA.md
│   ├── Ringkasan_Skema_Database_SARPRA.md
│   ├── SARPRA.png
│   ├── Compact SARPRA.png
│   ├── Flowchart SARPRA.png
│   └── Use Case Diagram SARPRA.png
├── app/
├── bootstrap/
├── config/
├── database/
├── resources/
├── routes/
├── tests/
├── composer.json
├── package.json
└── vite.config.ts
```

## Dokumentasi

Folder `docs/` berisi dokumen acuan pengembangan SARPRA:

- `PRD_SARPRA.md` — kebutuhan, ruang lingkup, pengguna, dan fitur sistem.
- `database-schema/` — skema database dan diagram ERD.
- `Ringkasan_Skema_Database_SARPRA.md` — ringkasan struktur tabel dan relasi.
- `Ringkasan Flowchart SARPRA.md` — alur proses bisnis.
- `Ringkasan Use Case SARPRA.md` — aktor dan interaksi dengan sistem.
- `ui-ux/` — rancangan antarmuka dan aset desain dari Stitch.
- File PNG — diagram dan visualisasi sistem.

## Modul Sistem

- Perencanaan kebutuhan
- Pengadaan
- Inventarisasi
- Pemeliharaan
- Pelaporan
- Pengguna dan hak akses

## Menjalankan Proyek

1. Pastikan PHP, Composer, Node.js, dan npm sudah terpasang.
2. Instal dependensi PHP:

   ```bash
   composer install
   ```

3. Instal dependensi frontend:

   ```bash
   npm install
   ```

4. Salin `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi database dan lingkungan lokal.
5. Buat application key:

   ```bash
   php artisan key:generate
   ```

6. Jalankan migrasi database:

   ```bash
   php artisan migrate
   ```

7. Jalankan aplikasi Laravel dan Vite sekaligus:

   ```bash
   composer run dev
   ```
