
 // =====================================================
 // SARPRA — Sistem Pengelolaan Sarana dan Prasarana
 // Database Schema
 // =====================================================

 // SISTEM & PENGGUNA
Table role {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table user {
  id bigint [pk, increment]
  role_id bigint [not null]
  name varchar(100) [not null]
  email varchar(150) [unique, not null]
  password varchar(255) [not null]
  is_active boolean [default: true]
  last_login_at timestamp
  created_at timestamp
  updated_at timestamp
}

// MASTER DATA
Table kategori_barang {
  id bigint [pk, increment]
  name varchar(100) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table satuan {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table lokasi {
  id bigint [pk, increment]
  name varchar(100) [not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table kondisi_barang {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table status_barang {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table jenis_pemeliharaan {
  id bigint [pk, increment]
  name varchar(100) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table jenis_pengadaan {
  id bigint [pk, increment]
  name varchar(100) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table prioritas {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table periode {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

// PERENCANAAN KEBUTUHAN
Table perencanaan {
  id bigint [pk, increment]
  user_id bigint [not null]
  kategori_barang_id bigint [not null]
  satuan_id bigint [not null]
  prioritas_id bigint [not null]
  periode_id bigint [not null]
  nama_kebutuhan varchar(150) [not null]
  jumlah int [not null]
  alasan text
  status varchar(50) [not null, note: 'Nilai yang diizinkan: Draft, Diajukan. Tidak memerlukan persetujuan Pimpinan.']
  created_at timestamp
  updated_at timestamp

  checks {
    `status IN ('Draft', 'Diajukan')` [name: 'chk_perencanaan_status']
  }
}

Table riwayat_perencanaan {
  id bigint [pk, increment]
  perencanaan_id bigint [not null]
  user_id bigint [not null]
  status varchar(50) [not null]
  catatan text
  created_at timestamp
}

// PENGADAAN
Table pengadaan {
  id bigint [pk, increment]
  perencanaan_id bigint
  jenis_pengadaan_id bigint [not null]
  user_id bigint [not null]
  nomor_pengadaan varchar(100) [unique]
  tanggal_pengajuan date [not null]
  alasan text
  status varchar(50) [not null]
  created_at timestamp
  updated_at timestamp
}

Table detail_pengadaan {
  id bigint [pk, increment]
  pengadaan_id bigint [not null]
  kategori_barang_id bigint [not null]
  satuan_id bigint [not null]
  nama_barang varchar(150) [not null]
  spesifikasi text
  jumlah int [not null]
  estimasi_harga decimal(15,2)
  subtotal decimal(15,2)
  created_at timestamp
  updated_at timestamp
}

Table dokumen_pengadaan {
  id bigint [pk, increment]
  pengadaan_id bigint [not null]
  user_id bigint [not null]
  nama_dokumen varchar(150) [not null]
  file_path varchar(255) [not null]
  file_type varchar(50)
  file_size bigint
  created_at timestamp
}

Table persetujuan_pengadaan {
  id bigint [pk, increment]
  pengadaan_id bigint [not null]
  pimpinan_id bigint [not null]
  status varchar(50) [not null]
  catatan text
  tanggal_persetujuan timestamp
  created_at timestamp
  updated_at timestamp
}

Table riwayat_pengadaan {
  id bigint [pk, increment]
  pengadaan_id bigint [not null]
  user_id bigint [not null]
  status varchar(50) [not null]
  catatan text
  created_at timestamp
}

// INVENTARISASI BARANG
Table barang {
  id bigint [pk, increment]
  kategori_barang_id bigint [not null]
  satuan_id bigint [not null]
  lokasi_id bigint [not null]
  kondisi_barang_id bigint [not null]
  status_barang_id bigint [not null]
  pengadaan_id bigint
  perencanaan_id bigint
  kode_barang varchar(100) [unique, not null]
  nama_barang varchar(150) [not null]
  merk varchar(100)
  spesifikasi text
  jumlah int [not null]
  tahun_perolehan year
  sumber_perolehan varchar(100)
  harga_perolehan decimal(15,2)
  foto varchar(255)
  dokumen varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table riwayat_barang {
  id bigint [pk, increment]
  barang_id bigint [not null]
  user_id bigint [not null]
  kondisi_barang_id bigint
  status_barang_id bigint
  lokasi_id bigint
  catatan text
  created_at timestamp
}

// PEMELIHARAAN
Table pemeliharaan {
  id bigint [pk, increment]
  barang_id bigint [not null]
  jenis_pemeliharaan_id bigint [not null]
  prioritas_id bigint [not null]
  user_id bigint [not null]
  nomor_pemeliharaan varchar(100) [unique]
  tanggal_pengajuan date [not null]
  masalah text [not null]
  estimasi_biaya decimal(15,2)
  status varchar(50) [not null]
  created_at timestamp
  updated_at timestamp
}

Table dokumen_pemeliharaan {
  id bigint [pk, increment]
  pemeliharaan_id bigint [not null]
  user_id bigint [not null]
  nama_dokumen varchar(150) [not null]
  file_path varchar(255) [not null]
  file_type varchar(50)
  file_size bigint
  created_at timestamp
}

Table riwayat_pemeliharaan {
  id bigint [pk, increment]
  pemeliharaan_id bigint [not null]
  user_id bigint [not null]
  tanggal date [not null]
  jenis_tindakan varchar(150)
  masalah text
  tindakan text
  biaya decimal(15,2)
  pelaksana varchar(150)
  status varchar(50) [not null]
  catatan text
  dokumen_sebelum varchar(255)
  dokumen_sesudah varchar(255)
  created_at timestamp
}

// NOTIFIKASI
Table notifikasi {
  id bigint [pk, increment]
  user_id bigint [not null]
  title varchar(150) [not null]
  message text [not null]
  type varchar(50)
  reference_type varchar(100)
  reference_id bigint
  is_read boolean [default: false]
  read_at timestamp
  created_at timestamp
}

// RIWAYAT AKTIVITAS
Table riwayat_aktivitas {
  id bigint [pk, increment]
  user_id bigint
  activity varchar(150) [not null]
  description text
  module varchar(100)
  reference_type varchar(100)
  reference_id bigint
  ip_address varchar(45)
  user_agent text
  created_at timestamp
}

// RELATIONSHIPS
// Sistem & User
Ref: user.role_id > role.id

// Perencanaan
// Status hanya Draft dan Diajukan; tidak ada relasi persetujuan Pimpinan.
Ref: perencanaan.user_id > user.id
Ref: perencanaan.kategori_barang_id > kategori_barang.id
Ref: perencanaan.satuan_id > satuan.id
Ref: perencanaan.prioritas_id > prioritas.id
Ref: perencanaan.periode_id > periode.id
Ref: riwayat_perencanaan.perencanaan_id > perencanaan.id
Ref: riwayat_perencanaan.user_id > user.id

// Pengadaan
Ref: pengadaan.perencanaan_id > perencanaan.id
Ref: pengadaan.jenis_pengadaan_id > jenis_pengadaan.id
Ref: pengadaan.user_id > user.id
Ref: detail_pengadaan.pengadaan_id > pengadaan.id
Ref: detail_pengadaan.kategori_barang_id > kategori_barang.id
Ref: detail_pengadaan.satuan_id > satuan.id
Ref: dokumen_pengadaan.pengadaan_id > pengadaan.id
Ref: dokumen_pengadaan.user_id > user.id
Ref: persetujuan_pengadaan.pengadaan_id > pengadaan.id
Ref: persetujuan_pengadaan.pimpinan_id > user.id
Ref: riwayat_pengadaan.pengadaan_id > pengadaan.id
Ref: riwayat_pengadaan.user_id > user.id

// Inventarisasi
Ref: barang.kategori_barang_id > kategori_barang.id
Ref: barang.satuan_id > satuan.id
Ref: barang.lokasi_id > lokasi.id
Ref: barang.kondisi_barang_id > kondisi_barang.id
Ref: barang.status_barang_id > status_barang.id
Ref: barang.pengadaan_id > pengadaan.id
Ref: barang.perencanaan_id > perencanaan.id
Ref: riwayat_barang.barang_id > barang.id
Ref: riwayat_barang.user_id > user.id
Ref: riwayat_barang.kondisi_barang_id > kondisi_barang.id
Ref: riwayat_barang.status_barang_id > status_barang.id
Ref: riwayat_barang.lokasi_id > lokasi.id

// Pemeliharaan
Ref: pemeliharaan.barang_id > barang.id
Ref: pemeliharaan.jenis_pemeliharaan_id > jenis_pemeliharaan.id
Ref: pemeliharaan.prioritas_id > prioritas.id
Ref: pemeliharaan.user_id > user.id
Ref: dokumen_pemeliharaan.pemeliharaan_id > pemeliharaan.id
Ref: dokumen_pemeliharaan.user_id > user.id
Ref: riwayat_pemeliharaan.pemeliharaan_id > pemeliharaan.id
Ref: riwayat_pemeliharaan.user_id > user.id

// Notifikasi
Ref: notifikasi.user_id > user.id

// Aktivitas
Ref: riwayat_aktivitas.user_id > user.id
