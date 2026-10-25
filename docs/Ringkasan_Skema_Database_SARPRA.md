# Ringkasan Domain Table Berdasarkan Role SARPRA

Dokumen ini merangkum domain dan tabel database yang digunakan oleh masing-masing role dalam sistem SARPRA.

> Catatan: satu tabel dapat digunakan oleh lebih dari satu role. Perbedaannya terletak pada fungsi dan hak operasi terhadap data.

---

# 1. Administrator

Administrator berfokus pada pengelolaan pengguna, master data, dan pemantauan aktivitas sistem.

## Domain Administrator

```text
Administrator
│
├── User Management
│   ├── user
│   └── role
│
├── Master Data
│   ├── kategori_barang
│   ├── satuan
│   ├── lokasi
│   ├── kondisi_barang
│   ├── status_barang
│   ├── jenis_pemeliharaan
│   ├── jenis_pengadaan
│   ├── prioritas
│   └── periode
│
└── Activity History
    └── riwayat_aktivitas
```

## Tabel yang Digunakan

| Tabel                | Fungsi Administrator                   |
| -------------------- | -------------------------------------- |
| `user`               | Mengelola akun pengguna                |
| `role`               | Mengelola role pengguna                |
| `kategori_barang`    | Mengelola master kategori barang       |
| `satuan`             | Mengelola master satuan                |
| `lokasi`             | Mengelola master lokasi                |
| `kondisi_barang`     | Mengelola master kondisi barang        |
| `status_barang`      | Mengelola master status barang         |
| `jenis_pemeliharaan` | Mengelola master jenis pemeliharaan    |
| `jenis_pengadaan`    | Mengelola master jenis pengadaan       |
| `prioritas`          | Mengelola master prioritas             |
| `periode`            | Mengelola master periode               |
| `riwayat_aktivitas`  | Memantau aktivitas pengguna dan sistem |

---

# 2. Pimpinan / Pejabat Berwenang

Pimpinan berfokus pada **persetujuan pengadaan, monitoring, dan pelaporan**.

## Domain Pimpinan

```text
Pimpinan
│
├── Approval Pengadaan
│   ├── pengadaan
│   ├── detail_pengadaan
│   ├── dokumen_pengadaan
│   ├── persetujuan_pengadaan
│   └── riwayat_pengadaan
│
├── Monitoring
│   ├── perencanaan
│   ├── barang
│   └── pemeliharaan
│
├── Pelaporan
│   └── Data dari berbagai domain
│
└── Notifikasi
    └── notifikasi
```

## Tabel yang Digunakan

| Tabel                   | Fungsi Pimpinan                           |
| ----------------------- | ----------------------------------------- |
| `pengadaan`             | Melihat pengajuan dan status pengadaan    |
| `detail_pengadaan`      | Melihat detail barang yang diajukan       |
| `dokumen_pengadaan`     | Melihat dokumen pendukung pengadaan       |
| `persetujuan_pengadaan` | Menyetujui atau menolak pengadaan         |
| `riwayat_pengadaan`     | Melihat riwayat proses pengadaan          |
| `perencanaan`           | Melihat dan memonitor data perencanaan    |
| `barang`                | Melihat dan memonitor data inventaris     |
| `pemeliharaan`          | Melihat dan memonitor proses pemeliharaan |
| `notifikasi`            | Menerima informasi atau notifikasi sistem |
| Berbagai tabel domain   | Menjadi sumber data pelaporan             |

## Fokus Utama

```text
Pengajuan Pengadaan
        │
        ▼
    Pimpinan
        │
   ┌────┴────┐
   ▼         ▼
Setujui     Tolak
```

Pimpinan berperan sebagai **pengambil keputusan pada proses persetujuan** serta melakukan monitoring terhadap data SARPRA.

---

# 3. Pengelola Sarana & Prasarana

Pengelola merupakan role yang menangani proses operasional utama SARPRA.

## Domain Pengelola

```text
Pengelola Sarana & Prasarana
│
├── Perencanaan
│   ├── perencanaan
│   └── riwayat_perencanaan
│
├── Pengadaan
│   ├── pengadaan
│   ├── detail_pengadaan
│   ├── dokumen_pengadaan
│   └── riwayat_pengadaan
│
├── Inventarisasi
│   ├── barang
│   └── riwayat_barang
│
├── Pemeliharaan
│   ├── pemeliharaan
│   ├── dokumen_pemeliharaan
│   └── riwayat_pemeliharaan
│
├── Pelaporan
│   └── Data dari berbagai domain
│
└── Notifikasi
    └── notifikasi
```

## Aturan Status Perencanaan

- Status perencanaan disimpan langsung pada kolom status di tabel `perencanaan`.
- Status yang digunakan adalah `Draft` dan `Diajukan`.
- `Diajukan` berarti perencanaan dicatat untuk dokumentasi dan tindak lanjut pengadaan, bukan persetujuan formal dari Pimpinan.
- Tidak diperlukan tabel `persetujuan_perencanaan` maupun foreign key/relasi persetujuan Pimpinan khusus untuk perencanaan.
- Persetujuan formal oleh Pimpinan hanya dilakukan pada proses pengadaan melalui tabel `persetujuan_pengadaan`.

## Tabel yang Digunakan

| Tabel                  | Fungsi Pengelola                                    |
| ---------------------- | --------------------------------------------------- |
| `perencanaan`          | Membuat dan mengelola data perencanaan              |
| `riwayat_perencanaan`  | Mencatat dan melihat riwayat perencanaan            |
| `pengadaan`            | Membuat dan mengelola pengajuan pengadaan           |
| `detail_pengadaan`     | Mengelola detail barang pengadaan                   |
| `dokumen_pengadaan`    | Mengelola dokumen pengadaan                         |
| `riwayat_pengadaan`    | Melihat riwayat proses pengadaan                    |
| `barang`               | Mengelola data inventaris barang                    |
| `riwayat_barang`       | Mencatat perubahan data, kondisi, dan status barang |
| `pemeliharaan`         | Mengajukan dan mengelola pemeliharaan               |
| `dokumen_pemeliharaan` | Mengelola dokumen pemeliharaan                      |
| `riwayat_pemeliharaan` | Mencatat riwayat tindakan pemeliharaan              |
| `notifikasi`           | Menerima informasi atau notifikasi sistem           |
| Berbagai tabel domain  | Menjadi sumber data pelaporan                       |

---

# Ringkasan Akses Antar Role

| Domain / Tabel          | Administrator | Pimpinan | Pengelola |
| ----------------------- | :-----------: | :------: | :-------: |
| `user`                  |       ✅       |     —    |     —     |
| `role`                  |       ✅       |     —    |     —     |
| Master Data             |       ✅       |    👁️   |    👁️    |
| `perencanaan`           |      👁️      |    👁️   |     ✅     |
| `riwayat_perencanaan`   |      👁️      |    👁️   |     ✅     |
| `pengadaan`             |      👁️      |    👁️   |     ✅     |
| `detail_pengadaan`      |      👁️      |    👁️   |     ✅     |
| `dokumen_pengadaan`     |      👁️      |    👁️   |     ✅     |
| `persetujuan_pengadaan` |       —       |     ✅    |    👁️    |
| `riwayat_pengadaan`     |      👁️      |    👁️   |     ✅     |
| `barang`                |      👁️      |    👁️   |     ✅     |
| `riwayat_barang`        |      👁️      |    👁️   |     ✅     |
| `pemeliharaan`          |      👁️      |    👁️   |     ✅     |
| `dokumen_pemeliharaan`  |      👁️      |    👁️   |     ✅     |
| `riwayat_pemeliharaan`  |      👁️      |    👁️   |     ✅     |
| `notifikasi`            |       —       |     ✅    |     ✅     |
| `riwayat_aktivitas`     |       ✅       |    👁️   |    👁️    |

### Keterangan

* **✅** = fungsi utama / mengelola data
* **👁️** = melihat / monitoring
* **—** = bukan tanggung jawab utama

---

# Struktur Domain Berdasarkan Role

```text
SARPRA
│
├── ADMINISTRATOR
│   ├── User Management
│   ├── Master Data
│   └── Activity History
│
├── PIMPINAN
│   ├── Approval Pengadaan
│   ├── Monitoring
│   ├── Pelaporan
│   └── Notifikasi
│
└── PENGELOLA SARANA & PRASARANA
    ├── Perencanaan
    ├── Pengadaan
    ├── Inventarisasi
    ├── Pemeliharaan
    ├── Pelaporan
    └── Notifikasi
```

## Kesimpulan

Pembagian tanggung jawab role dalam database SARPRA dapat diringkas menjadi:

```text
Administrator
    → Mengelola sistem dan data pendukung

Pimpinan
    → Melakukan approval dan monitoring

Pengelola
    → Menjalankan proses operasional SARPRA
```

Sedangkan hubungan proses bisnis utama tetap:

```text
Perencanaan
     ↓
Pengadaan
     ↓
Inventarisasi
     ↓
Pemeliharaan
```

dan **Pelaporan** menggunakan data dari berbagai domain.

SEEDER
├── role
├── user (akun demo/default)
├── kategori_barang
├── satuan
├── lokasi
├── kondisi_barang
├── status_barang
├── jenis_pemeliharaan
├── jenis_pengadaan
├── prioritas
└── periode

FACTORY
├── user (testing)
├── barang
├── perencanaan
├── pengadaan
├── detail_pengadaan
└── persetujuan_pengadaan

FACTORY OPSIONAL UNTUK TESTING
├── riwayat_perencanaan
├── riwayat_pengadaan
├── riwayat_barang
├── riwayat_pemeliharaan
└── riwayat_aktivitas

DIBUAT OLEH BUSINESS PROCESS / SYSTEM
├── notifikasi
├── dokumen_pengadaan
└── dokumen_pemeliharaan
