# Flowchart SARPRA

# Ringkasan Flowchart SARPRA
## Sistem Pengelolaan Sarana dan Prasarana
Dokumen ini merangkum alur proses utama sistem SARPRA berdasarkan Flowchart Utama.

---

# 1. Alur Umum Sistem
## Login
**Mulai**
↓
Pengguna membuka aplikasi SARPRA
↓
Masuk ke sistem
↓
Validasi kredensial
↓
**Apakah login berhasil?**

### Jika Tidak
→ Sistem menampilkan pesan login gagal
→ Pengguna kembali ke halaman masuk

### Jika Ya
→ Sistem mengenali role pengguna
→ Sistem menampilkan dasbor sesuai role

## Percabangan Role
Sistem mengarahkan pengguna berdasarkan role:

- Administrator
- Pengelola Sarana & Prasarana
- Pimpinan / Pejabat Berwenang
---

# 2. Alur Administrator
Administrator
↓
Dasbor Administrator
↓
Memilih menu / aktivitas

Aktivitas Administrator:

- Mengelola Pengguna
- Mengatur Peran dan Hak Akses
- Mengelola Data Master
- Mengelola Konfigurasi Sistem
- Melihat Aktivitas Sistem
Setelah aktivitas selesai:

↓
Kembali ke Dasbor Administrator
↓
**Ingin keluar?**

### Jika Tidak
→ Kembali memilih aktivitas

### Jika Ya
→ Keluar dari sistem
→ Selesai

---

# 3. Alur Pengelola Sarana & Prasarana
Pengelola Sarana & Prasarana
↓
Dasbor Pengelola
↓
Memilih modul

Modul yang dapat diakses:

- Perencanaan Kebutuhan
- Pengadaan
- Inventarisasi
- Pemeliharaan
- Pelaporan & Notifikasi
Setelah menyelesaikan proses pada modul:

↓
Kembali ke Dasbor / Pemilihan Modul

Pengelola dapat melanjutkan ke modul lain atau keluar dari sistem.

---

# 4. Alur Perencanaan Kebutuhan
Pengelola
↓
Memilih Perencanaan Kebutuhan
↓
Mengelola data kebutuhan
↓
Menentukan informasi kebutuhan
↓
Menyimpan kebutuhan

Status kebutuhan:

**Draft**

Kemudian:

↓
**Apakah kebutuhan diajukan?**

### Jika Tidak
→ Kebutuhan tetap berstatus Draft
→ Kembali ke daftar kebutuhan

### Jika Ya
→ Mengirim kebutuhan
→ Status menjadi Diajukan
→ Proses kebutuhan berlanjut

---

# 5. Alur Pengadaan
## Pengajuan Pengadaan
Pengelola
↓
Memilih Pengadaan
↓
Melihat daftar pengadaan
↓
Membuat pengajuan pengadaan
↓
Mengisi informasi pengadaan
↓
**Simpan sebagai draf?**

### Jika Ya
→ Menyimpan pengajuan
→ Status = Draft
→ Kembali ke daftar pengadaan

### Jika Tidak
→ Mengirim pengajuan
→ Status = Menunggu Persetujuan
→ Pengajuan diteruskan kepada Pimpinan

---

# 6. Alur Persetujuan Pengadaan
Pimpinan / Pejabat Berwenang
↓
Melihat pengajuan pengadaan
↓
Melihat detail pengajuan
↓
Memeriksa pengajuan
↓
**Keputusan Pimpinan**

### Jika Disetujui
→ Status = Disetujui
→ Pengadaan diproses
→ Pengadaan selesai
→ Riwayat pengadaan diperbarui

### Jika Ditolak
→ Status = Ditolak
→ Pimpinan memberikan catatan / alasan
→ Pengelola dapat melihat hasil keputusan
→ Riwayat pengadaan diperbarui

## Alur Antar Role
```text
Pengelola
    ↓
Membuat Pengajuan Pengadaan
    ↓
Mengirim Pengajuan
    ↓
Menunggu Persetujuan
    ↓
Pimpinan
    ↓
Memeriksa Pengajuan
    ↓
Keputusan
   ↙   ↘
Setuju  Tolak
   ↓      ↓
Diproses  Ditolak
   ↓
Selesai
   ↓
Riwayat Pengadaan
```
---

# 7. Alur Inventarisasi
Pengelola
↓
Memilih Inventarisasi
↓
Melihat / mengelola data barang

Aktivitas inventarisasi meliputi:

- Menambah barang
- Melihat detail barang
- Mengubah barang
- Menghapus barang sesuai kewenangan
- Mencari dan memfilter barang
- Memperbarui kondisi barang
- Memperbarui lokasi barang
- Memperbarui status barang
- Melihat riwayat barang
Setiap perubahan penting terhadap barang:

↓
Dicatat dalam **Riwayat Barang**

## Alur Utama
```text
Inventarisasi
      ↓
Kelola Data Barang
      ↓
Perbarui Kondisi / Lokasi / Status
      ↓
Riwayat Barang
```
---

# 8. Alur Pemeliharaan
Pengelola
↓
Memilih Pemeliharaan
↓
Melihat daftar pemeliharaan
↓
Mengajukan pemeliharaan
↓
Memilih barang
↓
Mengisi informasi permasalahan
↓
Menentukan jenis dan prioritas pemeliharaan
↓
Mengisi estimasi biaya
↓
Mengirim pengajuan
↓
Status = Diajukan
↓
Proses pemeliharaan
↓
Memperbarui status
↓
Pemeliharaan selesai
↓
Status = Selesai
↓
Riwayat Pemeliharaan diperbarui
↓
Riwayat Barang diperbarui

## Alur Status
```text
Diajukan
    ↓
Dalam Pemeliharaan
    ↓
Selesai
```
---

# 9. Alur Pelaporan
Pengguna yang memiliki akses
↓
Memilih Pelaporan
↓
Memilih jenis laporan
↓
Menentukan filter
↓
Sistem menampilkan laporan

Jenis laporan:

- Laporan Inventaris
- Laporan Pengadaan
- Laporan Kebutuhan
- Laporan Pemeliharaan
- Laporan Kondisi Aset
Kemudian:

**Apakah laporan perlu dicetak atau diekspor?**

### Jika Ya
→ Cetak / Ekspor laporan

### Jika Tidak
→ Kembali ke halaman laporan

---

# 10. Alur Pimpinan / Pejabat Berwenang
Pimpinan / Pejabat Berwenang
↓
Dasbor Pimpinan
↓
Melihat ringkasan informasi

Informasi yang dapat dilihat:

- Ringkasan aset
- Kondisi sarana dan prasarana
- Kebutuhan pengadaan
- Pengajuan pengadaan
- Informasi pemeliharaan
- Laporan
- Notifikasi
Pimpinan dapat memilih:

### Pengadaan
→ Melihat pengajuan
→ Melihat detail pengadaan
→ Memeriksa pengajuan
→ Menyetujui atau menolak
→ Melihat hasil keputusan / riwayat

### Laporan
→ Memilih laporan
→ Melihat laporan
→ Melakukan filter
→ Mencetak / mengekspor laporan

Setelah aktivitas:

↓
Kembali ke Dasbor Pimpinan

---

# 11. Alur Keluar Sistem
Setelah menyelesaikan aktivitas:

↓
Kembali ke Dasbor
↓
**Ingin keluar?**

### Jika Tidak
→ Kembali memilih aktivitas

### Jika Ya
→ Keluar dari sistem
→ Selesai

Alur ini berlaku untuk:

- Administrator
- Pengelola Sarana & Prasarana
- Pimpinan / Pejabat Berwenang
---

# 12. Ringkasan Alur Utama
```text
Mulai
  ↓
Masuk
  ↓
Validasi Login
  ↓
Identifikasi Role
  ↓
┌────────────────┬──────────────────────┬──────────────────────┐
│ Administrator  │ Pengelola            │ Pimpinan             │
│                │                      │                      │
│ Dasbor         │ Dasbor               │ Dasbor               │
│ Pengguna       │ Perencanaan          │ Monitoring            │
│ Hak Akses      │ Pengadaan ───────────┼→ Persetujuan          │
│ Data Master    │ Inventarisasi        │ Pelaporan             │
│ Konfigurasi    │ Pemeliharaan         │                      │
│ Aktivitas      │ Pelaporan            │                      │
└────────────────┴──────────────────────┴──────────────────────┘
                         ↓
                      Logout
                         ↓
                      Selesai
```
---

# 13. Ringkasan Per Role
| Role | Alur Utama |
| ----- | ----- |
| **Administrator** | Login → Dasbor → Pengguna & Hak Akses → Data Master → Konfigurasi → Aktivitas Sistem → Logout |
| **Pengelola Sarana & Prasarana** | Login → Dasbor → Perencanaan → Pengadaan → Inventarisasi → Pemeliharaan → Pelaporan → Logout |
| **Pimpinan / Pejabat Berwenang** | Login → Dasbor → Monitoring → Pengajuan Pengadaan → Persetujuan → Pelaporan → Logout |
---

# 14. Proses Utama Antar Modul
## Pengadaan → Persetujuan
```text
Pengelola
    ↓
Pengajuan Pengadaan
    ↓
Menunggu Persetujuan
    ↓
Pimpinan
    ↓
Persetujuan
   ↙   ↘
Setuju  Tolak
   ↓      ↓
Diproses Ditolak
   ↓
Selesai
```
## Pengadaan → Inventarisasi
```text
Pengadaan Selesai
      ↓
Pencatatan Barang
      ↓
Inventarisasi
      ↓
Data Barang
      ↓
Kondisi / Lokasi / Status
      ↓
Riwayat Barang
```
## Inventarisasi → Pemeliharaan
```text
Data Barang
    ↓
Pengajuan Pemeliharaan
    ↓
Proses Pemeliharaan
    ↓
Selesai
    ↓
Riwayat Pemeliharaan
    ↓
Kondisi / Riwayat Barang
```
---

# 15. Validasi Flowchart
## Alur Umum
- [ ] Login dan validasi sudah sesuai.
- [ ] Percabangan role sudah sesuai.
- [ ] Setiap role memiliki dasbor masing-masing.
- [ ] Login gagal kembali ke halaman masuk.
- [ ] Setiap role memiliki proses logout.
## Administrator
- [ ] Mengelola pengguna.
- [ ] Mengatur peran dan hak akses.
- [ ] Mengelola data master.
- [ ] Mengelola konfigurasi sistem.
- [ ] Melihat aktivitas sistem.
## Pengelola Sarana & Prasarana
- [ ] Mengelola perencanaan kebutuhan.
- [ ] Mengelola pengadaan.
- [ ] Mengajukan pengadaan.
- [ ] Mengelola inventarisasi.
- [ ] Mengelola pemeliharaan.
- [ ] Mengelola pelaporan.
- [ ] Melihat notifikasi.
- [ ] Melihat hasil keputusan pengadaan.
## Pimpinan / Pejabat Berwenang
- [ ] Melihat dasbor.
- [ ] Melihat ringkasan aset.
- [ ] Melihat kondisi sarana dan prasarana.
- [ ] Melihat kebutuhan pengadaan.
- [ ] Melihat pengajuan pengadaan.
- [ ] Menyetujui pengadaan.
- [ ] Menolak pengadaan.
- [ ] Melihat laporan.
- [ ] Melihat notifikasi.
## Perencanaan Kebutuhan
- [ ] Mengelola kebutuhan.
- [ ] Menyimpan kebutuhan sebagai Draft.
- [ ] Mengajukan kebutuhan.
- [ ] Mengubah status kebutuhan.
## Pengadaan
- [ ] Membuat pengajuan.
- [ ] Menyimpan pengajuan sebagai Draft.
- [ ] Mengirim pengajuan.
- [ ] Menunggu persetujuan.
- [ ] Menyetujui pengadaan.
- [ ] Menolak pengadaan.
- [ ] Memberikan catatan / alasan penolakan.
- [ ] Memperbarui riwayat pengadaan.
- [ ] Menghubungkan pengadaan selesai dengan inventarisasi.
## Inventarisasi
- [ ] Mengelola data barang.
- [ ] Memperbarui kondisi barang.
- [ ] Memperbarui lokasi barang.
- [ ] Memperbarui status barang.
- [ ] Mencatat riwayat barang.
## Pemeliharaan
- [ ] Mengajukan pemeliharaan.
- [ ] Memilih barang yang dipelihara.
- [ ] Memproses pemeliharaan.
- [ ] Memperbarui status pemeliharaan.
- [ ] Menyelesaikan pemeliharaan.
- [ ] Mencatat riwayat pemeliharaan.
- [ ] Memperbarui kondisi / riwayat barang.
## Pelaporan
- [ ] Melihat laporan inventaris.
- [ ] Melihat laporan pengadaan.
- [ ] Melihat laporan kebutuhan.
- [ ] Melihat laporan pemeliharaan.
- [ ] Melihat laporan kondisi aset.
- [ ] Memfilter laporan.
- [ ] Mencetak / mengekspor laporan.
---

# 16. Posisi Flowchart dalam Perancangan SARPRA
```text
PRD
 ↓
Use Case Diagram
 ↓
**Flowchart**
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

