# Panduan Instalasi SiswaConnect untuk User

## 📋 Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Mode Instalasi](#mode-instalasi)
3. [Instalasi Mode Standalone](#instalasi-mode-standalone)
4. [Instalasi Mode Network](#instalasi-mode-network)
5. [Menggunakan Aplikasi](#menggunakan-aplikasi)
6. [Troubleshooting](#troubleshooting)

## 💻 Persyaratan Sistem

### Minimum
- **OS:** Windows 10 / Windows 11
- **RAM:** 4 GB
- **Storage:** 500 MB ruang kosong
- **Processor:** Intel Core i3 atau setara

### Rekomendasi
- **RAM:** 8 GB atau lebih
- **Storage:** 1 GB ruang kosong
- **Processor:** Intel Core i5 atau lebih tinggi
- **Koneksi Internet:** Untuk mode Network (opsional untuk Standalone)

## 🎯 Mode Instalasi

SiswaConnect menyediakan 2 mode instalasi:

### 📱 Mode Standalone (Mudah)

**Cocok untuk:**
- Sekolah kecil dengan 1 operator
- PC tunggal
- Tidak memerlukan jaringan

**Kelebihan:**
- ✅ Instalasi super mudah
- ✅ Tidak perlu setup database
- ✅ Langsung bisa digunakan
- ✅ Tidak butuh koneksi internet

**Kekurangan:**
- ❌ Hanya 1 PC yang bisa akses
- ❌ Data tersimpan lokal saja

### 🌐 Mode Network (Advanced)

**Cocok untuk:**
- Sekolah menengah/besar
- Multi-user (banyak operator)
- Akses dari banyak PC dalam jaringan

**Kelebihan:**
- ✅ Multi-user bersamaan
- ✅ Data terpusat
- ✅ Akses dari banyak PC

**Kekurangan:**
- ❌ Perlu setup database MySQL
- ❌ Perlu jaringan LAN
- ❌ Setup lebih kompleks

---

## 📥 Instalasi Mode Standalone

### Langkah 1: Download Installer

1. Download file `SiswaConnect-Setup.exe`
2. Klik kanan > **Run as Administrator**

![Download](../assets/docs/download.png)

### Langkah 2: Jalankan Installer

1. Pilih folder instalasi (atau gunakan default)
2. Klik **Install**
3. Tunggu proses instalasi selesai (± 2 menit)

![Install](../assets/docs/install.png)

### Langkah 3: Setup Wizard

Setelah instalasi, akan muncul Setup Wizard:

1. Pilih **"Mode Standalone (Mudah)"**
   
   ![Wizard Step 1](../assets/docs/wizard-step1.png)

2. Klik **"Lanjut →"**

3. Atur Port Server (gunakan default: 1991)
   
   ![Wizard Step 2](../assets/docs/wizard-step2-standalone.png)

4. Klik **"Selesai ✓"**

### Langkah 4: Aplikasi Siap Digunakan!

- Browser akan otomatis terbuka
- Halaman login SiswaConnect akan muncul
- **Username default:** `admin`
- **Password default:** `admin123`

⚠️ **PENTING:** Ganti password default setelah login pertama kali!

---

## 🌐 Instalasi Mode Network

### Persiapan

**Anda memerlukan:**
1. ✅ MySQL Server (atau XAMPP/Laragon)
2. ✅ Koneksi jaringan LAN
3. ✅ Informasi database:
   - Host/IP MySQL Server
   - Username MySQL
   - Password MySQL
   - Port MySQL (default: 3306)

### Langkah 1: Install MySQL (jika belum ada)

#### Opsi A: Menggunakan XAMPP (Lebih Mudah)

1. Download XAMPP dari https://www.apachefriends.org
2. Install XAMPP
3. Buka XAMPP Control Panel
4. Start **MySQL**

#### Opsi B: MySQL Standalone

1. Download MySQL dari https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server
3. Catat username dan password yang Anda buat

### Langkah 2: Install SiswaConnect

1. Download dan jalankan `SiswaConnect-Setup.exe`
2. Install seperti biasa

### Langkah 3: Setup Wizard - Network Mode

1. Pilih **"Mode Network (Multi-User)"**
   
   ![Wizard Network](../assets/docs/wizard-step1.png)

2. Klik **"Lanjut →"**

3. Masukkan konfigurasi MySQL:
   
   ![MySQL Config](../assets/docs/wizard-step2-network.png)
   
   - **Host MySQL:** `localhost` (jika MySQL di PC yang sama)
     - Atau IP server (contoh: `192.168.1.100`)
   - **Port MySQL:** `3306` (default)
   - **Username:** `root` (atau user MySQL Anda)
   - **Password:** Password MySQL Anda
   - **Nama Database:** `siswa_connect` (akan dibuat otomatis)
   - **Port Server:** `1991`

4. Klik **"Selesai ✓"**

### Langkah 4: Verifikasi

- Browser akan otomatis terbuka
- Login dengan:
  - **Username:** `admin`
  - **Password:** `admin123`

### Langkah 5: Akses dari PC Lain (Opsional)

Untuk akses dari PC lain dalam jaringan:

1. Cari IP address PC server:
   ```
   Buka Command Prompt
   Ketik: ipconfig
   Lihat "IPv4 Address"
   ```

2. Dari PC lain, buka browser dan ketik:
   ```
   http://[IP-SERVER]:1991
   ```
   
   Contoh: `http://192.168.1.100:1991`

---

## 🚀 Menggunakan Aplikasi

### Login Pertama Kali

1. Buka aplikasi SiswaConnect (shortcut di Desktop)
2. Browser akan otomatis terbuka
3. Login dengan username `admin` dan password `admin123`
4. **Segera ganti password!**

### Menu Utama

Setelah login, Anda akan melihat menu:

- 📊 **Dashboard** - Ringkasan data
- 👥 **Kelola User** - Manajemen pengguna
- 👨‍🏫 **Data Guru** - Master data guru
- 🏫 **Data Kelas** - Master data kelas
- 📝 **Laporan** - Laporan kelas kosong
- 🏥 **Izin Guru** - Pengajuan izin guru

### Menambah User Baru

1. Klik menu **"Kelola User"**
2. Klik **"+ Tambah User"**
3. Isi data:
   - Username
   - Password
   - Role (ADMIN/OPERATOR/TEACHER)
   - Nama lengkap
4. Klik **"Simpan"**

---

## 🔧 Troubleshooting

### Aplikasi tidak bisa dibuka

**Solusi:**
1. Klik kanan icon SiswaConnect
2. Pilih **"Run as Administrator"**
3. Jika masih gagal, restart PC

### Browser tidak otomatis terbuka

**Solusi:**
1. Buka browser manual
2. Ketik: `http://localhost:1991`
3. Jika gagal, cek Port di konfigurasi

### "Database connection failed" (Mode Network)

**Solusi:**
1. Pastikan MySQL service berjalan:
   - XAMPP: Buka Control Panel > Start MySQL
   - Windows Service: Cek MySQL80 service
2. Cek username/password MySQL
3. Pastikan database `siswa_connect` ada
4. Reset konfigurasi:
   - Buka aplikasi
   - Menu > Reset Configuration
   - Setup ulang

### Port 1991 sudah digunakan

**Solusi:**
1. Reset konfigurasi aplikasi
2. Pilih port lain (contoh: 1992, 1993)

### Tidak bisa akses dari PC lain (Mode Network)

**Solusi:**
1. Cek IP address server
2. Pastikan Firewall tidak memblokir port 1991
   - Windows Defender Firewall
   - Allow port 1991 (TCP)
3. Pastikan PC dalam jaringan yang sama
4. Ping dari PC client ke PC server

### Data hilang setelah restart (Mode Standalone)

**Solusi:**
- Data tersimpan di:
  - `C:\Users\[USERNAME]\AppData\Roaming\SiswaConnect\siswaconnect.db`
- Jangan hapus folder ini!
- Backup file `.db` secara berkala

---

## 📞 Bantuan Lebih Lanjut

Jika masih mengalami masalah:

1. **Baca dokumentasi lengkap:** `docs/HYBRID_MODE_GUIDE.md`
2. **Hubungi administrator sistem**
3. **Report issue:** GitHub Issues

---

## 🔄 Update Aplikasi

### Cara Update:

1. Download installer versi terbaru
2. Jalankan installer
3. Pilih **"Install over existing installation"**
4. Data Anda **AMAN** (tidak akan hilang)

### Backup Sebelum Update (Rekomendasi):

**Mode Standalone:**
```
Copy file: 
C:\Users\[USERNAME]\AppData\Roaming\SiswaConnect\siswaconnect.db
```

**Mode Network:**
```
Backup MySQL database:
mysqldump -u root -p siswa_connect > backup.sql
```

---

## ⚠️ Catatan Penting

1. **Jangan tutup aplikasi SiswaConnect** saat sedang digunakan
2. **Backup data secara berkala**
3. **Ganti password default** setelah instalasi
4. **Update aplikasi** secara berkala
5. **Catat username/password** dengan aman

---

## ✅ Checklist Instalasi

- [ ] Download installer
- [ ] Install aplikasi
- [ ] Pilih mode instalasi
- [ ] Konfigurasi database (jika Network)
- [ ] Login pertama kali
- [ ] Ganti password admin
- [ ] Tambah user lain (opsional)
- [ ] Test akses dari PC lain (jika Network)
- [ ] Backup konfigurasi

---

**Selamat menggunakan SiswaConnect!** 🎉
