# PRD --- SARPRA
## Sistem Pengelolaan Sarana dan Prasarana
## 1. Informasi Project
**Nama Project:**\
SARPRA --- Sistem Pengelolaan Sarana dan Prasarana
**Deskripsi:**\
SARPRA adalah aplikasi berbasis web untuk mengelola sarana dan prasarana
secara terintegrasi, mulai dari perencanaan kebutuhan, pengadaan,
inventarisasi barang, pemeliharaan, hingga pelaporan.
**Tujuan:**
- Mempermudah pengelolaan data sarana dan prasarana. -
Memusatkan data inventaris dalam satu sistem.
- Membantu proses
perencanaan kebutuhan sarana dan prasarana.
- Mempermudah proses
pengajuan dan persetujuan pengadaan.
- Mendokumentasikan riwayat barang
dan pemeliharaan.
- Menyediakan informasi kondisi aset secara
terstruktur.
- Membantu pimpinan memantau aset dan pengadaan. -
Menghasilkan laporan yang terorganisir.
**Platform:**\
Web-based application
**Teknologi:**
- Backend: Laravel
- Frontend: Livewire + Blade Templating
- CSS: Tailwind CSS
- JavaScript: Vanilla JS / Alpine.js
- Database: MySQL
- Version Control: Git & GitHub
------------------------------------------------------------------------
# 2. Target User
## 2.1 Administrator
Bertanggung jawab terhadap pengelolaan pengguna dan data master.
**Hak/Fungsi:**
- Login dan logout.
- Mengelola akun pengguna. -
Menambah pengguna.
- Mengubah data pengguna.
- Menonaktifkan pengguna. -
Mengatur role pengguna.
- Mengelola data master tertentu.
- Melihat aktivitas sistem.
## 2.2 Pengelola Sarana & Prasarana
Bertanggung jawab terhadap pengelolaan data dan proses sarana-prasarana.
**Hak/Fungsi:**
- Login dan logout.
- Melihat dashboard.
- Mengelola
perencanaan kebutuhan.
- Mengajukan dan mengelola pengadaan.
- Mengelola
data inventaris.
- Mengajukan dan mengelola pemeliharaan.
- Mencetak atau mengekspor data dari modul operasional sesuai kebutuhan.
- Melihat notifikasi.
- Melihat riwayat aktivitas.
## 2.3 Pimpinan / Pejabat Berwenang
Bertanggung jawab terhadap persetujuan pengadaan dan monitoring
sarana-prasarana.
**Hak/Fungsi:**
- Login dan logout.
- Melihat dashboard ringkasan. -
Melihat jumlah dan kondisi aset.
- Melihat kebutuhan pengadaan. -
Melihat pengajuan pengadaan.
- Menyetujui pengadaan.
- Menolak
pengadaan.
- Melihat informasi pemeliharaan.
- Melihat laporan. -
Melakukan monitoring data sarana-prasarana.
- Melihat notifikasi.
------------------------------------------------------------------------
# 3. Scope / Ruang Lingkup Sistem
SARPRA mencakup:
1.  Modul Pengguna
2.  Halaman Dashboard
3.  Modul Perencanaan Kebutuhan
4.  Modul Pengadaan
5.  Modul Inventarisasi
6.  Modul Pemeliharaan
7.  Modul Pelaporan
8.  Data Master
9.  Notifikasi
10. Riwayat Aktivitas
------------------------------------------------------------------------
# 4. Fitur
## 4.1 Fitur Utama (Core Feature)
### A. Halaman Dashboard
Dashboard menampilkan informasi ringkas sesuai role pengguna.
**Informasi yang dapat ditampilkan:**
- Total aset/barang.
- Jumlah
barang berdasarkan kondisi.
- Barang baik.
- Barang rusak ringan. -
Barang rusak berat.
- Jumlah pengajuan pengadaan.
- Pengadaan menunggu
persetujuan.
- Pengadaan disetujui.
- Pengadaan ditolak.
- Pengajuan
pemeliharaan.
- Pemeliharaan sedang berlangsung.
- Ringkasan kebutuhan
sarana-prasarana.
Dashboard Pimpinan difokuskan pada monitoring dan pengambilan keputusan.

------------------------------------------------------------------------
## 4.2 Modul Perencanaan Kebutuhan
Digunakan untuk mencatat dan mengelola kebutuhan sarana-prasarana sebagai dokumentasi dan bahan pertimbangan dalam proses pengadaan. Pengajuan perencanaan tidak memerlukan persetujuan formal dari Pimpinan.
**Fitur:**
- Daftar kebutuhan.
- Tambah kebutuhan.
- Detail kebutuhan. -
Edit kebutuhan.
- Hapus kebutuhan.
- Menentukan jumlah kebutuhan. -
Menentukan prioritas kebutuhan.
- Menentukan alasan/keterangan
kebutuhan.
- Menentukan periode/tahun kebutuhan.
- Status kebutuhan. -
Riwayat kebutuhan.
**Status utama:**
- Draft
- Diajukan
**Aturan status:**
- `Draft`: kebutuhan tersimpan dan masih dapat dikelola oleh Pengelola.
- `Diajukan`: kebutuhan telah diajukan untuk dokumentasi dan tindak lanjut, serta dapat dipertimbangkan sebagai dasar pengadaan. Status ini bukan tanda persetujuan formal dari Pimpinan.
**Kolom/field per fitur:**
- Daftar kebutuhan: kode perencanaan, nama kebutuhan, kategori barang, jumlah, satuan, prioritas, periode/tahun, status, tanggal dibuat, pengaju.
- Tambah kebutuhan: nama kebutuhan, kategori barang, jumlah, satuan, prioritas, periode/tahun, alasan/keterangan.
- Detail kebutuhan: seluruh data perencanaan, nama pengaju, tanggal dibuat, tanggal diajukan, status, riwayat kebutuhan.
- Edit kebutuhan: nama kebutuhan, kategori barang, jumlah, satuan, prioritas, periode/tahun, alasan/keterangan; status mengikuti aturan bisnis.
- Hapus kebutuhan: ID/kode perencanaan dan konfirmasi penghapusan.
- Riwayat kebutuhan: waktu perubahan, pengguna, aktivitas, status sebelumnya, status terbaru, catatan.

------------------------------------------------------------------------
## 4.3 Modul Pengadaan
Digunakan untuk mengelola proses pengadaan sarana-prasarana.
### Pengajuan Pengadaan
-   Membuat pengajuan pengadaan.
-   Memilih barang/kebutuhan.
-   Menentukan jumlah.
-   Menambahkan spesifikasi.
-   Menambahkan estimasi biaya.
-   Menambahkan alasan pengadaan.
-   Mengunggah dokumen pendukung jika diperlukan.
-   Menyimpan draft pengajuan.
-   Mengirim pengajuan.
### Persetujuan
Pimpinan dapat:
- Melihat detail pengajuan.
- Menyetujui pengajuan. -
Menolak pengajuan.
- Memberikan catatan keputusan.
### Status Pengadaan
-   Draft
-   Diajukan
-   Menunggu Persetujuan
-   Disetujui
-   Ditolak
-   Diproses
-   Selesai
### Riwayat Pengadaan
-   Riwayat pengajuan.
-   Riwayat persetujuan.
-   Riwayat perubahan status.
-   Catatan pengajuan.
**Kolom/field per fitur:**
- Daftar pengadaan: nomor pengadaan, tanggal pengajuan, pengaju, jenis pengadaan, jumlah item, estimasi total biaya, status.
- Tambah/pengajuan pengadaan: perencanaan terkait (opsional), jenis pengadaan, tanggal pengajuan, alasan, catatan, detail barang, dokumen pendukung.
- Detail pengadaan: nomor pengadaan, pengaju, tanggal pengajuan, alasan, status, detail barang, estimasi biaya, dokumen pendukung, riwayat.
- Detail barang pengadaan: nama barang, spesifikasi, jumlah, satuan, estimasi harga satuan, subtotal.
- Persetujuan pengadaan: keputusan, catatan/alasan keputusan, nama pimpinan, waktu keputusan.
- Riwayat pengadaan: waktu, pengguna, aktivitas, status sebelumnya, status terbaru, catatan.

------------------------------------------------------------------------
## 4.4 Modul Inventarisasi
Digunakan untuk mengelola seluruh data aset/barang.
### Daftar Barang
-   Melihat daftar barang.
-   Pencarian barang.
-   Filter barang.
-   Sorting data.
-   Pagination.
### Tambah Barang
**Data yang dapat dicatat:**
- Kode barang.
- Nama barang.
- Kategori. -
Merk.
- Spesifikasi.
- Jumlah.
- Satuan.
- Tahun perolehan.
- Sumber
perolehan.
- Harga perolehan.
- Lokasi.
- Kondisi.
- Status barang. -
Foto barang.
- Dokumen pendukung.
### Detail Barang
-   Informasi lengkap barang.
-   Kondisi barang.
-   Lokasi barang.
-   Informasi perolehan.
-   Riwayat perubahan.
-   Riwayat pemeliharaan.
-   Riwayat pengadaan.
### Pengelolaan Barang
-   Edit barang.
-   Hapus barang sesuai kewenangan.
-   Perubahan kondisi.
-   Perubahan lokasi.
-   Perubahan status.
### Riwayat Barang
Mencatat:
- Perubahan data.
- Perubahan lokasi.
- Perubahan kondisi. -
Pemeliharaan.
- Pengadaan.
- Aktivitas terkait barang.
**Kolom/field per fitur:**
- Daftar barang: kode barang, nama barang, kategori, lokasi, jumlah, satuan, kondisi, status.
- Tambah barang: kode barang, nama barang, kategori, merek, spesifikasi, jumlah, satuan, tahun perolehan, sumber perolehan, harga perolehan, lokasi, kondisi, status barang, foto barang, dokumen pendukung.
- Detail barang: seluruh informasi barang, foto, informasi perolehan, lokasi, kondisi, status, riwayat perubahan, riwayat pemeliharaan, riwayat pengadaan.
- Edit barang: nama barang, kategori, merek, spesifikasi, jumlah, satuan, tahun perolehan, sumber perolehan, harga perolehan, lokasi, kondisi, status, foto, dokumen pendukung.
- Hapus barang: ID/kode barang dan konfirmasi; penghapusan mengikuti kewenangan dan aturan riwayat.
- Riwayat barang: waktu aktivitas, pengguna, jenis aktivitas, data/field yang berubah, nilai sebelum, nilai sesudah, catatan.
- Pencarian/filter/sorting: kata kunci, kategori, lokasi, kondisi, status, tahun perolehan, kolom pengurutan, arah pengurutan.

------------------------------------------------------------------------
## 4.5 Modul Pemeliharaan
Digunakan untuk mengelola pemeliharaan sarana-prasarana.
### Pengajuan Pemeliharaan
-   Memilih barang.
-   Menjelaskan kerusakan/permasalahan.
-   Menentukan jenis pemeliharaan.
-   Menentukan prioritas.
-   Menambahkan estimasi biaya.
-   Mengunggah dokumentasi kerusakan.
-   Mengirim pengajuan.
### Status Pemeliharaan
-   Diajukan
-   Dalam Pemeliharaan
-   Selesai
-   Ditolak jika diperlukan sesuai proses bisnis
### Riwayat Pemeliharaan
-   Tanggal pemeliharaan.
-   Jenis pemeliharaan.
-   Kerusakan.
-   Tindakan/perbaikan.
-   Biaya.
-   Pelaksana.
-   Status.
-   Catatan.
-   Dokumentasi sebelum/sesudah.
**Kolom/field per fitur:**
- Daftar pemeliharaan: nomor pemeliharaan, kode/nama barang, jenis pemeliharaan, tanggal pengajuan, prioritas, pengaju, status.
- Pengajuan pemeliharaan: barang terkait, jenis pemeliharaan, deskripsi kerusakan/permasalahan, prioritas, estimasi biaya, dokumentasi kerusakan.
- Detail pemeliharaan: nomor pemeliharaan, data barang, pengaju, tanggal pengajuan, masalah, jenis, prioritas, estimasi biaya, status, dokumen, catatan.
- Pembaruan status: status, petugas/pelaksana, tanggal mulai, tanggal selesai, tindakan/perbaikan, biaya aktual, catatan.
- Riwayat pemeliharaan: tanggal, barang, jenis pemeliharaan, kerusakan, tindakan/perbaikan, biaya, pelaksana, status, catatan, dokumentasi sebelum/sesudah.

------------------------------------------------------------------------
## 4.6 Modul Pelaporan
Digunakan untuk menghasilkan informasi dan laporan sarana-prasarana.
**Jenis laporan:**
- Laporan daftar inventaris.
- Laporan jumlah aset. -
Laporan berdasarkan kategori.
- Laporan berdasarkan lokasi.
- Laporan
berdasarkan kondisi.
- Laporan pengadaan.
- Laporan kebutuhan.
- Laporan
pemeliharaan.
- Laporan riwayat barang.
**Fitur:**
- Filter periode.
- Filter kategori.
- Filter lokasi. -
Filter kondisi.
- Cetak laporan.
- Export PDF.
- Export Excel/CSV jika
diperlukan.
**Kolom/field per fitur:**
- Laporan inventaris: kode barang, nama barang, kategori, jumlah, satuan, lokasi, kondisi, status, tahun perolehan.
- Laporan jumlah aset: kategori, lokasi atau kondisi (sesuai filter), jumlah barang/unit.
- Laporan pengadaan: nomor pengadaan, tanggal pengajuan, pengaju, jenis pengadaan, estimasi biaya, status, keputusan pimpinan.
- Laporan kebutuhan: kode perencanaan, nama kebutuhan, kategori, jumlah, satuan, prioritas, periode, status, pengaju.
- Laporan pemeliharaan: nomor pemeliharaan, barang, jenis, tanggal pengajuan, biaya, pelaksana, status.
- Laporan riwayat barang: kode barang, nama barang, tanggal aktivitas, jenis aktivitas, pengguna, catatan.
- Filter laporan: periode tanggal/tahun, kategori, lokasi, kondisi, status, jenis laporan.
- Cetak/export: jenis laporan, filter yang diterapkan, format file, waktu ekspor, pengguna.

------------------------------------------------------------------------
# 5. Modul Pengguna
**Fitur:**
- Daftar pengguna.
- Tambah pengguna.
- Edit pengguna. -
Detail pengguna.
- Aktif/nonaktif pengguna.
- Reset password. -
Pengaturan role.
- Pengaturan hak akses.
**Role:**
- Administrator
- Pengelola Sarana & Prasarana
- Pimpinan /
Pejabat Berwenang
**Kolom/field per fitur:**
- Daftar pengguna: nama, email, role, status akun, tanggal dibuat.
- Tambah pengguna: nama, email, password awal, role, status akun.
- Detail pengguna: nama, email, role, status akun, tanggal dibuat, terakhir diperbarui.
- Edit pengguna: nama, email, role, status akun.
- Aktif/nonaktif pengguna: pengguna, status akun, waktu perubahan, pelaku perubahan.
- Reset password: pengguna, password baru, konfirmasi password; password disimpan dalam bentuk hash dan tidak ditampilkan kembali.
- Pengaturan role/hak akses: nama role, daftar izin/fitur yang diperbolehkan.

------------------------------------------------------------------------
# 6. Data Master
Data master yang dapat dikelola:
-   Kategori barang.
-   Satuan barang.
-   Lokasi.
-   Kondisi barang.
-   Status barang.
-   Jenis pemeliharaan.
-   Jenis pengadaan.
-   Tahun/periode.
-   Prioritas kebutuhan.
Data master dapat disesuaikan berdasarkan kebutuhan organisasi.
**Kolom/field per fitur data master:**
- Kategori barang: nama kategori, kode kategori (jika digunakan), deskripsi, status aktif.
- Satuan barang: nama satuan, singkatan, status aktif.
- Lokasi: nama lokasi, kode lokasi (jika digunakan), keterangan, status aktif.
- Kondisi barang: nama kondisi, deskripsi, status aktif.
- Status barang: nama status, deskripsi, status aktif.
- Jenis pemeliharaan: nama jenis, deskripsi, status aktif.
- Jenis pengadaan: nama jenis, deskripsi, status aktif.
- Tahun/periode: nama atau tahun periode, tanggal mulai (jika diperlukan), tanggal selesai (jika diperlukan), status aktif.
- Prioritas kebutuhan: nama prioritas, deskripsi, urutan tingkat prioritas, status aktif.
- Fitur daftar/tambah/edit: ID, nama, keterangan/deskripsi, status aktif; kolom khusus disesuaikan dengan jenis data master.

------------------------------------------------------------------------
# 7.1 Data Structure Overview
## Sistem & Pengguna
```text
Sistem & Pengguna
├── role
└── user
```
Data utama:
- Role pengguna.
- Data akun pengguna.
- Status pengguna.
- Informasi autentikasi.
## Master Data
```text
Master Data
├── kategori_barang
├── satuan
├── lokasi
├── kondisi_barang
├── status_barang
├── jenis_pemeliharaan
├── jenis_pengadaan
├── prioritas
└── periode
```
## Perencanaan
```text
Perencanaan
├── perencanaan
└── riwayat_perencanaan
```
Data utama:
- Nama perencanaan.
- Kategori barang.
- Jumlah.
- Satuan.
- Prioritas.
- Periode.
- Alasan/keterangan.
- Status.
- Riwayat perencanaan.
## Pengadaan
```text
Pengadaan
├── pengadaan
├── detail_pengadaan
├── dokumen_pengadaan
├── persetujuan_pengadaan
└── riwayat_pengadaan
```
Data utama:
- Nomor pengadaan.
- Perencanaan yang menjadi dasar pengadaan.
- Jenis pengadaan.
- Tanggal pengajuan.
- Alasan.
- Status.
- Detail barang.
- Spesifikasi.
- Jumlah.
- Estimasi harga.
- Dokumen pendukung.
- Persetujuan Pimpinan.
- Riwayat pengadaan.
## Inventarisasi
```text
Inventarisasi
├── barang
└── riwayat_barang
```
Data utama:
- Kode barang.
- Nama barang.
- Kategori.
- Merk.
- Spesifikasi.
- Jumlah.
- Satuan.
- Tahun perolehan.
- Sumber perolehan.
- Harga perolehan.
- Lokasi.
- Kondisi.
- Status.
- Foto/dokumen.
- Riwayat barang.
## Pemeliharaan
```text
Pemeliharaan
├── pemeliharaan
├── dokumen_pemeliharaan
└── riwayat_pemeliharaan
```
Data utama:
- Barang yang dipelihara.
- Jenis pemeliharaan.
- Prioritas.
- Tanggal pengajuan.
- Masalah/kerusakan.
- Estimasi biaya.
- Status.
- Dokumen pendukung.
- Tindakan/perbaikan.
- Biaya.
- Pelaksana.
- Riwayat pemeliharaan.
- Dokumentasi sebelum/sesudah.
## Sistem Pendukung
```text
Sistem Pendukung
├── notifikasi
└── riwayat_aktivitas
```
Data utama:
- Notifikasi pengguna.
- Aktivitas pengguna dan sistem.
- Referensi aktivitas terhadap data/modul.
## Hubungan Data Utama
Proses bisnis utama memiliki hubungan sebagai berikut:
```text
Perencanaan
     ↓
Pengadaan
     ↓
Inventarisasi
     ↓
Pemeliharaan
```
Pelaporan menggunakan data dari berbagai domain:
```text
Perencanaan ──────┐
Pengadaan ────────┤
Inventarisasi ────┼──→ Pelaporan
Pemeliharaan ─────┘
```
# 7. Fitur Pendukung
## Authentication
-   Login.
-   Logout.
-   Password.
-   Session management.
-   Authorization berdasarkan role.
## Search & Filter
-   Pencarian data.
-   Filter berdasarkan kategori.
-   Filter berdasarkan status.
-   Filter berdasarkan periode.
-   Filter berdasarkan lokasi.
## Notifikasi
-   Notifikasi pengajuan.
-   Notifikasi persetujuan.
-   Notifikasi penolakan.
-   Notifikasi perubahan status.
-   Notifikasi pemeliharaan.
## Riwayat Aktivitas
Sistem mencatat aktivitas penting pengguna, seperti:
- Login.
- Menambah
data.
- Mengubah data.
- Menghapus data.
- Mengajukan pengadaan. -
Menyetujui pengadaan.
- Menolak pengadaan.
- Mengubah status.
## Dokumen Pendukung
-   Upload dokumen pendukung.
-   Upload foto barang.
-   Upload dokumen pengadaan.
-   Upload dokumentasi pemeliharaan.
**Kolom/data per fitur:**
- Login: email/username dan password yang dimasukkan pengguna.
- Logout: sesi pengguna yang sedang aktif.
- Session management: ID sesi, pengguna, waktu dibuat, waktu kedaluwarsa.
- Authorization: pengguna, role, izin/fitur yang boleh diakses.

**Kolom/data per fitur:**
- Daftar notifikasi: judul, pesan, jenis notifikasi, penerima, waktu dibuat, status dibaca.
- Notifikasi pengajuan/persetujuan/penolakan/perubahan status: referensi data terkait, penerima, pesan, waktu dibuat, status dibaca.

**Kolom/data per fitur:**
- Daftar riwayat aktivitas: pengguna, jenis aktivitas, modul, ID data terkait, waktu aktivitas, deskripsi.
- Detail perubahan jika tersedia: nama field, nilai sebelum, nilai sesudah.

------------------------------------------------------------------------
# 8. Business Rules / Aturan Bisnis
## Pengadaan
1.  Pengelola dapat membuat pengajuan pengadaan.
2.  Pengajuan dapat disimpan sebagai draft.
3.  Pengelola mengirim pengajuan kepada Pimpinan.
4.  Pengajuan yang dikirim berstatus Menunggu Persetujuan.
5.  Pimpinan dapat menyetujui atau menolak pengajuan.
6.  Pengajuan yang ditolak dapat disertai catatan/alasan.
7.  Pengajuan yang disetujui dapat dilanjutkan ke proses pengadaan.
8.  Perubahan status pengadaan dicatat dalam riwayat.
## Inventarisasi
1.  Setiap barang memiliki kode barang yang unik.
2.  Barang memiliki kategori.
3.  Barang memiliki kondisi dan status.
4.  Data barang dapat diperbarui sesuai kewenangan.
5.  Perubahan penting terhadap barang dicatat dalam riwayat.
## Pemeliharaan
1.  Pengajuan pemeliharaan harus terkait dengan barang yang terdaftar.
2.  Setiap pemeliharaan memiliki status.
3.  Status pemeliharaan diperbarui selama proses berlangsung.
4.  Pemeliharaan yang selesai dicatat dalam riwayat pemeliharaan.
5.  Kondisi barang dapat diperbarui setelah pemeliharaan selesai.
## Hak Akses
1.  Administrator mengelola pengguna dan data master.
2.  Pengelola mengelola proses sarana-prasarana.
3.  Pimpinan memiliki kewenangan persetujuan pengadaan dan monitoring.
4.  Pengguna hanya dapat mengakses fitur sesuai role.
------------------------------------------------------------------------
# 9. Workflow Utama
Workflow utama menggambarkan proses bisnis yang menjadi dasar perancangan UI/UX dan implementasi fitur SARPRA.
## 9.0 Screen List UI Berdasarkan Role
### 1. Administrator
1. Login
2. Dashboard Admin
3. Manajemen Pengguna
4. Data Master
5. Riwayat Aktivitas
### 2. Pengelola Sarana & Prasarana
1. Dashboard Pengelola
2. Perencanaan Kebutuhan
3. Pengadaan
4. Inventarisasi
5. Pemeliharaan
### 3. Pimpinan / Pejabat Berwenang
1. Dashboard Pimpinan
2. Pengadaan & Persetujuan
3. Pelaporan
Catatan:
- Screen yang digunakan bersama oleh beberapa role tidak perlu dibuat
  sebagai desain terpisah jika struktur dan komponennya sama.
- Daftar ini berfokus pada halaman utama untuk desain MVP, bukan seluruh
  variasi form, detail, atau operasi CRUD.
## 9.1 Alur Umum Sistem
```text
Mulai
  ↓
Pengguna membuka aplikasi
  ↓
Masuk ke sistem
  ↓
Validasi kredensial
  ↓
Login berhasil?
  ├── Tidak → Tampilkan pesan gagal → Kembali ke halaman masuk
  └── Ya
       ↓
Identifikasi role
       ↓
Tampilkan dashboard sesuai role
       ↓
Pengguna menjalankan aktivitas sesuai hak akses
       ↓
Logout
       ↓
Selesai
```
## 9.2 Workflow Perencanaan Kebutuhan
```text
Pengelola
  ↓
Membuka Perencanaan Kebutuhan
  ↓
Melihat daftar kebutuhan
  ↓
Menambah / memilih kebutuhan
  ↓
Mengisi data kebutuhan
  ↓
Simpan
  ↓
Status = Draft
  ↓
Ajukan kebutuhan?
  ├── Tidak → Tetap Draft
  └── Ya → Status = Diajukan
             ↓
       Dicatat untuk dokumentasi
       dan tindak lanjut pengadaan
```
Pengajuan perencanaan tidak melewati proses persetujuan atau penolakan formal dari Pimpinan. Persetujuan formal dilakukan pada modul Pengadaan.
Data utama:
- Kebutuhan.
- Jumlah.
- Prioritas.
- Alasan/keterangan.
- Periode/tahun.
- Status.
## 9.3 Workflow Pengadaan
```text
Pengelola
  ↓
Membuat Pengajuan Pengadaan
  ↓
Mengisi data pengadaan
  ↓
Simpan sebagai Draft?
  ├── Ya → Status = Draft
  └── Tidak
       ↓
    Kirim Pengajuan
       ↓
    Status = Menunggu Persetujuan
       ↓
    Pimpinan memeriksa
       ↓
    Keputusan
      ↙   ↘
  Setujui  Tolak
     ↓       ↓
Disetujui  Ditolak
     ↓
Pengadaan Diproses
     ↓
Pengadaan Selesai
     ↓
Data barang dapat dicatat ke Inventarisasi
```
## 9.4 Workflow Inventarisasi
```text
Pengelola
  ↓
Membuka Inventarisasi
  ↓
Melihat daftar barang
  ↓
Tambah / pilih barang
  ↓
Kelola data barang
  ↓
Simpan / Perbarui
  ↓
Data barang tersimpan
  ↓
Kondisi / lokasi / status dapat diperbarui
  ↓
Perubahan penting dicatat dalam Riwayat Barang
```
Data utama:
- Identitas barang.
- Kategori.
- Spesifikasi.
- Jumlah dan satuan.
- Tahun dan sumber perolehan.
- Harga perolehan.
- Lokasi.
- Kondisi.
- Status.
- Foto / dokumen pendukung.
## 9.5 Workflow Pemeliharaan
```text
Pengelola
  ↓
Membuka Pemeliharaan
  ↓
Memilih barang
  ↓
Mengajukan Pemeliharaan
  ↓
Mengisi informasi pemeliharaan
  ↓
Kirim Pengajuan
  ↓
Status = Diajukan
  ↓
Pemeliharaan Diproses
  ↓
Status = Dalam Pemeliharaan
  ↓
Pemeliharaan Selesai
  ↓
Status = Selesai
  ↓
Riwayat Pemeliharaan diperbarui
  ↓
Informasi kondisi / riwayat barang diperbarui
```
## 9.6 Workflow Pelaporan
Screen Pelaporan tersendiri digunakan oleh Pimpinan untuk melihat rekapitulasi data lintas modul sebagai bahan monitoring dan pengambilan keputusan. Pengelola menggunakan fitur cetak/export langsung dari halaman modul operasional terkait.
```text
Pimpinan
  ↓
Membuka Pelaporan
  ↓
Memilih jenis laporan
  ↓
Menentukan filter
  ↓
Sistem menampilkan rekapitulasi
  ↓
Cetak / Export?
  ├── Tidak → Kembali ke halaman laporan
  └── Ya → Cetak / Export laporan
```
Untuk Pengelola:
```text
Pengelola
  ↓
Membuka halaman modul operasional
  ↓
Mengatur pencarian/filter data jika diperlukan
  ↓
Memilih fitur cetak/export
  ↓
Sistem menghasilkan data sesuai modul dan filter
```
Jenis laporan/rekapitulasi untuk Pimpinan:
- Inventaris.
- Pengadaan.
- Kebutuhan.
- Pemeliharaan.
- Kondisi aset.
- Riwayat barang.
## 9.7 Workflow Administrator
```text
Administrator
  ↓
Dashboard Administrator
  ↓
Memilih aktivitas
  ↓
Mengelola pengguna
  ├── Data pengguna
  └── Role & hak akses
  ↓
Mengelola data master
  ↓
Melihat aktivitas sistem
  ↓
Kembali ke dashboard
```
## 9.8 Workflow Pimpinan
```text
Pimpinan
  ↓
Dashboard Pimpinan
  ↓
Melihat ringkasan
  ├── Aset
  ├── Kondisi aset
  ├── Kebutuhan
  ├── Pengadaan
  └── Pemeliharaan
  ↓
Memilih aktivitas
  ├── Pengadaan → Periksa → Setujui / Tolak
  └── Pelaporan → Pilih laporan → Lihat / Export
```
## 9.9 Hubungan Antar Proses Utama
```text
Perencanaan Kebutuhan
        ↓
Pengadaan
        ↓
Persetujuan Pimpinan
        ↓
Pengadaan Selesai
        ↓
Inventarisasi
        ↓
Pemeliharaan
        ↓
Kondisi & Riwayat Barang
        ↓
Pelaporan
```
Workflow tersebut menjadi acuan untuk menentukan halaman, navigasi, komponen, form, status, dan interaksi utama pada tahap UI/UX serta menjadi acuan implementasi proses pada tahap Development.
---
# 10. Fitur Teknis
## Backend
-   Laravel.
-   MVC Architecture.
-   Eloquent ORM.
-   Middleware.
-   Validation.
-   Authentication.
-   Authorization.
## Frontend
-   Blade Templating.
-   Tailwind CSS.
-   Vanilla JavaScript.
-   Alpine.js sesuai kebutuhan.
-   Responsive design.
## Database
-   MySQL.
-   Relational database.
-   Foreign key.
-   Indexing.
-   Database migration.
-   Database seeding.
## Security
-   Authentication.
-   Authorization / role-based access control.
-   CSRF protection.
-   Validation.
-   Password hashing.
-   Session security.
-   File upload validation.
-   Proteksi akses berdasarkan role.
------------------------------------------------------------------------
# 11. Non-Functional Requirements
## Performance
-   Halaman dapat dimuat dengan waktu yang wajar.
-   Query database dioptimalkan.
-   Pagination digunakan untuk data dalam jumlah besar.
## Security
-   Data pengguna terlindungi.
-   Password disimpan menggunakan hashing.
-   Hak akses diterapkan pada setiap modul.
-   Validasi input diterapkan pada form.
## Usability
-   Interface sederhana dan mudah dipahami.
-   Responsive pada desktop, tablet, dan mobile.
-   Navigasi konsisten.
-   Feedback diberikan setelah aksi pengguna.
# 12. Acceptance Criteria
## Pengajuan Pengadaan
-   [ ] Pengelola dapat membuat pengajuan.
-   [ ] Sistem melakukan validasi form.
-   [ ] Pengajuan dapat disimpan sebagai draft.
-   [ ] Pengajuan dapat dikirim.
-   [ ] Status berubah menjadi "Menunggu Persetujuan".
-   [ ] Pimpinan dapat melihat pengajuan.
-   [ ] Pimpinan dapat menyetujui.
-   [ ] Pimpinan dapat menolak dengan alasan.
-   [ ] Perubahan status tercatat dalam riwayat.
## Inventaris
-   [ ] Pengelola dapat menambah barang.
-   [ ] Kode barang harus unik.
-   [ ] Barang dapat dicari.
-   [ ] Barang dapat difilter.
-   [ ] Detail barang dapat dilihat.
-   [ ] Data barang dapat diperbarui.
-   [ ] Riwayat perubahan dapat dilihat.
------------------------------------------------------------------------
# 13. Prioritas Fitur
## Must Have --- MVP
-   Login & authentication.
-   Role & authorization.
-   Dashboard.
-   Modul Inventarisasi.
-   Modul Pengadaan.
-   Persetujuan pengadaan.
-   Modul Pemeliharaan.
-   Modul Pengguna.
-   Laporan dasar.
## Should Have
-   Modul Perencanaan Kebutuhan.
-   Notifikasi.
-   Riwayat aktivitas.
-   Export PDF/Excel.
-   Upload dokumentasi.
## Could Have
-   Dashboard statistik lanjutan.
-   Grafik analitik.
-   Notifikasi email.
-   Integrasi sistem eksternal.
-   API internal jika diperlukan.
------------------------------------------------------------------------
# 14. Color Palette
Karakter visual SARPRA: profesional, terpercaya, bersih, dan
administratif.
-   **Primary:** #1E3A5F
-   **Secondary:** #2F6B8A
-   **Background:** #FFFFFF
-   **Text Primary:** #1E293B
-   **Success:** #16A34A
-   **Warning:** #D97706
-   **Danger:** #DC2626
-   **Border:** #E2E8F0
## 60-30-10 Rule
-   **60%** → Background putih.
-   **30%** → Primary/Secondary untuk sidebar, navbar, section, dan
    elemen pendukung.
-   **10%** → Accent/status seperti tombol aksi, success, warning, dan
    danger.
