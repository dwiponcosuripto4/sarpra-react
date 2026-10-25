# Diagram Use Case UML SARPRA

# Ringkasan Use Case SARPRA
## Sistem Pengelolaan Sarana dan Prasarana
Dokumen ini merangkum fungsi dan hak akses pengguna berdasarkan **Use Case Diagram SARPRA**.

Sistem memiliki tiga aktor utama:

1. Administrator
2. Pengelola Sarana dan Prasarana
3. Pimpinan / Pejabat Berwenang
---

# 1. Administrator
Administrator bertanggung jawab terhadap pengelolaan pengguna, hak akses, data master, dan konfigurasi sistem.

## Autentikasi
- Masuk
- Keluar
## Pengguna dan Administrasi
- Mengelola Pengguna
- Mengatur Peran dan Hak Akses
- Mengelola Data Master
- Mengelola Konfigurasi Sistem
- Melihat Aktivitas Sistem
## Perencanaan Kebutuhan
Administrator memiliki akses terhadap:

- Mengelola Perencanaan Kebutuhan
- Menambah Kebutuhan
- Melihat Detail Kebutuhan
- Mengubah Kebutuhan
---

# 2. Pengelola Sarana dan Prasarana
Pengelola bertanggung jawab terhadap proses operasional sarana dan prasarana, mulai dari kebutuhan, pengadaan, inventarisasi, pemeliharaan, hingga pelaporan.

## Autentikasi dan Dasbor
- Masuk
- Keluar
## Perencanaan Kebutuhan
- Mengelola Perencanaan Kebutuhan
- Menambah Kebutuhan
- Melihat Detail Kebutuhan
- Mengubah Kebutuhan
## Pengadaan
- Mengelola Pengadaan
- Membuat Pengajuan Pengadaan
- Menyimpan Draf Pengadaan
- Mengirim Pengajuan Pengadaan
- Melihat Detail Pengadaan
- Melihat Riwayat Pengadaan
## Inventarisasi
- Mengelola Inventarisasi
- Menambah Barang
- Melihat Detail Barang
- Mengubah Barang
- Menghapus Barang
- Mencari dan Memfilter Barang
- Memperbarui Kondisi Barang
- Memperbarui Lokasi Barang
## Pemeliharaan
- Mengelola Pemeliharaan
- Mengajukan Pemeliharaan
- Melihat Detail Pemeliharaan
- Memperbarui Status Pemeliharaan
- Melihat Riwayat Pemeliharaan
## Pelaporan
- Mengelola Pelaporan
- Melihat Laporan Inventaris
- Melihat Laporan Pengadaan
- Melihat Laporan Kebutuhan
- Melihat Laporan Pemeliharaan
- Melihat Laporan Kondisi Aset
## Fitur Pendukung
- Melihat Notifikasi
- Melihat Riwayat Aktivitas
---

# 3. Pimpinan / Pejabat Berwenang
Pimpinan bertanggung jawab terhadap persetujuan pengadaan serta pemantauan informasi sarana dan prasarana.

## Autentikasi dan Dasbor
- Masuk
- Keluar
## Pengadaan
- Melihat Detail Pengadaan
- Menyetujui Pengadaan
- Menolak Pengadaan
- Melihat Riwayat Pengadaan
## Pemeliharaan
- Melihat Detail Pemeliharaan
- Memperbarui Status Pemeliharaan
- Melihat Riwayat Pemeliharaan
## Pelaporan
- Melihat Laporan Inventaris
- Melihat Laporan Pengadaan
- Melihat Laporan Kebutuhan
- Melihat Laporan Pemeliharaan
- Melihat Laporan Kondisi Aset
## Fitur Pendukung
- Melihat Notifikasi
---

# 4. Struktur Modul dan Use Case
## Autentikasi dan Dasbor
Use case:

- Masuk
- Keluar
Digunakan oleh seluruh aktor untuk mengakses dan mengakhiri sesi penggunaan sistem.

---

## Pengguna dan Administrasi
Use case utama:

**Mengelola Pengguna**

**Mengatur Peran dan Hak Akses**

**Mengelola Data Master**

**Mengelola Konfigurasi Sistem**

**Melihat Aktivitas Sistem**

Modul ini terutama digunakan oleh Administrator.

---

## Perencanaan Kebutuhan
Use case utama:

**Mengelola Perencanaan Kebutuhan**

Use case pendukung:

- Menambah Kebutuhan
- Melihat Detail Kebutuhan
- Mengubah Kebutuhan
Modul digunakan untuk mengelola kebutuhan sarana dan prasarana.

---

## Pengadaan
Use case utama:

**Mengelola Pengadaan**

Use case pendukung:

- Membuat Pengajuan Pengadaan
- Menyimpan Draf Pengadaan
- Mengirim Pengajuan Pengadaan
- Melihat Detail Pengadaan
- Menyetujui Pengadaan
- Menolak Pengadaan
- Melihat Riwayat Pengadaan
Modul ini melibatkan Pengelola dan Pimpinan.

---

## Inventarisasi
Use case utama:

**Mengelola Inventarisasi**

Use case pendukung:

- Menambah Barang
- Melihat Detail Barang
- Mengubah Barang
- Menghapus Barang
- Mencari dan Memfilter Barang
- Memperbarui Kondisi Barang
- Memperbarui Lokasi Barang
Modul digunakan oleh Pengelola untuk mengelola data barang dan informasi kondisi aset.

---

## Pemeliharaan
Use case utama:

**Mengelola Pemeliharaan**

Use case pendukung:

- Mengajukan Pemeliharaan
- Melihat Detail Pemeliharaan
- Memperbarui Status Pemeliharaan
- Melihat Riwayat Pemeliharaan
Modul digunakan untuk mencatat dan memantau proses pemeliharaan sarana dan prasarana.

---

## Pelaporan
Use case utama:

**Mengelola Pelaporan**

Use case pendukung:

- Melihat Laporan Inventaris
- Melihat Laporan Pengadaan
- Melihat Laporan Kebutuhan
- Melihat Laporan Pemeliharaan
- Melihat Laporan Kondisi Aset
Modul digunakan untuk menyediakan informasi dan laporan terkait sarana dan prasarana.

---

## Fitur Pendukung
Use case:

- Melihat Notifikasi
- Melihat Riwayat Aktivitas
Fitur ini mendukung pemantauan aktivitas dan informasi sistem.

---

# 5. Hubungan Use Case Utama
Use case utama memiliki hubungan dengan use case yang lebih spesifik.

## Pengadaan
```text
Mengelola Pengadaan
        │
        ├── Membuat Pengajuan Pengadaan
        ├── Menyimpan Draf Pengadaan
        ├── Mengirim Pengajuan Pengadaan
        ├── Melihat Detail Pengadaan
        ├── Menyetujui Pengadaan
        ├── Menolak Pengadaan
        └── Melihat Riwayat Pengadaan
```
## Inventarisasi
```text
Mengelola Inventarisasi
        │
        ├── Menambah Barang
        ├── Melihat Detail Barang
        ├── Mengubah Barang
        ├── Menghapus Barang
        ├── Mencari dan Memfilter Barang
        ├── Memperbarui Kondisi Barang
        └── Memperbarui Lokasi Barang
```
## Pemeliharaan
```text
Mengelola Pemeliharaan
        │
        ├── Mengajukan Pemeliharaan
        ├── Melihat Detail Pemeliharaan
        ├── Memperbarui Status Pemeliharaan
        └── Melihat Riwayat Pemeliharaan
```
## Pelaporan
```text
Mengelola Pelaporan
        │
        ├── Melihat Laporan Inventaris
        ├── Melihat Laporan Pengadaan
        ├── Melihat Laporan Kebutuhan
        ├── Melihat Laporan Pemeliharaan
        └── Melihat Laporan Kondisi Aset
```
---

# 6. Hubungan Antar Role pada Pengadaan
Proses pengadaan merupakan proses yang melibatkan dua role utama.

```text
Pengelola
    ↓
Membuat Pengajuan Pengadaan
    ↓
Mengirim Pengajuan
    ↓
Pimpinan
    ↓
Melihat Detail Pengadaan
    ↓
Keputusan
   ↙   ↘
Setujui  Tolak
   ↓       ↓
Pengadaan  Pengadaan
Diproses   Ditolak
```
Pengelola bertanggung jawab membuat dan mengirim pengajuan.

Pimpinan bertanggung jawab melakukan persetujuan atau penolakan pengadaan.

---

# 7. Ringkasan Hak Akses
| Modul / Fitur | Administrator | Pengelola | Pimpinan |
| ----- | ----- | ----- | ----- |
| Masuk | ✓ | ✓ | ✓ |
| Keluar | ✓ | ✓ | ✓ |
| Pengguna | ✓ | - | - |
| Peran & Hak Akses | ✓ | - | - |
| Data Master | ✓ | - | - |
| Konfigurasi Sistem | ✓ | - | - |
| Aktivitas Sistem | ✓ | - | - |
| Perencanaan Kebutuhan | ✓ | ✓ | - |
| Pengadaan | - | ✓ | ✓ |
| Persetujuan Pengadaan | - | - | ✓ |
| Inventarisasi | - | ✓ | - |
| Pemeliharaan | - | ✓ | ✓ |
| Pelaporan | - | ✓ | ✓ |
| Notifikasi | - | ✓ | ✓ |
| Riwayat Aktivitas | - | ✓ | - |
Keterangan:

- `✓`  = memiliki akses
- `-`  = tidak memiliki akses
---

# 8. Ringkasan Per Role
| Role | Fokus Utama |
| ----- | ----- |
| **Administrator** | Pengguna, hak akses, data master, konfigurasi, dan aktivitas sistem |
| **Pengelola Sarana dan Prasarana** | Perencanaan, pengadaan, inventarisasi, pemeliharaan, dan pelaporan |
| **Pimpinan / Pejabat Berwenang** | Persetujuan pengadaan, pemantauan, dan pelaporan |
---

# 9. Ringkasan Seluruh Use Case
```text
SARPRA
│
├── Autentikasi
│   ├── Masuk
│   └── Keluar
│
├── Pengguna & Administrasi
│   ├── Mengelola Pengguna
│   ├── Mengatur Peran & Hak Akses
│   ├── Mengelola Data Master
│   ├── Mengelola Konfigurasi Sistem
│   └── Melihat Aktivitas Sistem
│
├── Perencanaan Kebutuhan
│   ├── Mengelola Perencanaan
│   ├── Menambah Kebutuhan
│   ├── Melihat Detail Kebutuhan
│   └── Mengubah Kebutuhan
│
├── Pengadaan
│   ├── Mengelola Pengadaan
│   ├── Membuat Pengajuan
│   ├── Menyimpan Draf
│   ├── Mengirim Pengajuan
│   ├── Melihat Detail
│   ├── Menyetujui Pengadaan
│   ├── Menolak Pengadaan
│   └── Melihat Riwayat
│
├── Inventarisasi
│   ├── Mengelola Inventarisasi
│   ├── Menambah Barang
│   ├── Melihat Detail Barang
│   ├── Mengubah Barang
│   ├── Menghapus Barang
│   ├── Mencari & Memfilter Barang
│   ├── Memperbarui Kondisi
│   └── Memperbarui Lokasi
│
├── Pemeliharaan
│   ├── Mengelola Pemeliharaan
│   ├── Mengajukan Pemeliharaan
│   ├── Melihat Detail Pemeliharaan
│   ├── Memperbarui Status
│   └── Melihat Riwayat
│
├── Pelaporan
│   ├── Mengelola Pelaporan
│   ├── Laporan Inventaris
│   ├── Laporan Pengadaan
│   ├── Laporan Kebutuhan
│   ├── Laporan Pemeliharaan
│   └── Laporan Kondisi Aset
│
└── Fitur Pendukung
    ├── Melihat Notifikasi
    └── Melihat Riwayat Aktivitas
```
---

# 10. Business Rules Utama
## Pengadaan
- Pengelola membuat pengajuan pengadaan.
- Pengelola dapat menyimpan pengajuan sebagai draf.
- Pengelola mengirim pengajuan kepada Pimpinan.
- Pimpinan melihat detail pengajuan.
- Pimpinan menyetujui atau menolak pengajuan.
- Pengajuan yang disetujui dapat dilanjutkan ke proses pengadaan.
- Pengajuan yang ditolak dapat dilihat hasil keputusannya oleh Pengelola.
- Riwayat pengadaan mencatat proses pengajuan dan keputusan.
## Inventarisasi
- Barang dikelola melalui Modul Inventarisasi.
- Data barang dapat ditambah, dilihat, diubah, dan dihapus sesuai kewenangan.
- Barang dapat dicari dan difilter.
- Kondisi dan lokasi barang dapat diperbarui.
- Informasi perubahan barang menjadi bagian dari riwayat barang.
## Pemeliharaan
- Pengelola mengajukan pemeliharaan.
- Pengajuan pemeliharaan berkaitan dengan data barang.
- Detail pemeliharaan dapat dilihat.
- Status pemeliharaan dapat diperbarui.
- Riwayat pemeliharaan tersimpan dalam sistem.
## Pelaporan
- Laporan dikelompokkan berdasarkan jenis informasi.
- Laporan mencakup inventaris, pengadaan, kebutuhan, pemeliharaan, dan kondisi aset.
- Laporan dapat dilihat oleh pengguna yang memiliki hak akses.
---

# 11. Posisi Use Case dalam Perancangan SARPRA
```text
PRD
 ↓
**Use Case Diagram**
 ↓
Flowchart
 ↓
Database Schema
 ↓
Google Stitch / UI/UX
 ↓
Development
 ↓
Testing
 ↓
Deployment
```
**PRD** menjadi dasar kebutuhan dan ruang lingkup sistem.

**Use Case Diagram** digunakan untuk menentukan aktor, hak akses, dan fungsi sistem.

**Flowchart** digunakan untuk menggambarkan alur proses bisnis utama.

**Database Schema** digunakan untuk merancang struktur tabel, kolom, tipe data, primary key, foreign key, dan relasi database.

**Google Stitch / UI/UX** digunakan untuk merancang tampilan dan pengalaman pengguna.

**Development** mengimplementasikan rancangan menjadi aplikasi.

**Testing** menguji fungsi, alur, validasi, dan hak akses.

**Deployment** menerapkan aplikasi ke lingkungan penggunaan.

