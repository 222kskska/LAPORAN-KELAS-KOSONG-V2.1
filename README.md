# SiswaConnect 🎓

**SiswaConnect** adalah platform web modern untuk memantau Kegiatan Belajar Mengajar (KBM). Aplikasi ini memungkinkan siswa melaporkan ketidakhadiran guru atau kelas kosong secara real-time, yang kemudian dapat dipantau dan dikelola oleh admin atau guru piket.

Dibuat oleh: **ArifWbo**

## ✨ Fitur Utama

*   📱 **Akses Siswa**: Form pelaporan intuitif dengan pencarian nama guru, deteksi kode kelas, dan upload bukti foto.
*   🖥️ **Dashboard Admin**: Visualisasi statistik laporan harian dan bulanan secara interaktif.
*   ✅ **Verifikasi Laporan**: Admin dapat memverifikasi (terima) atau menolak laporan yang masuk.
*   📂 **Manajemen Data Master**:
    *   **Guru**: Tambah, Edit, Hapus, dan **Import Massal** dari Excel/Text.
    *   **Kelas**: Tambah, Edit, Hapus, Lihat Riwayat, dan **Import Massal**.
    *   **Pengguna**: Kelola akun Admin dan Operator sekolah.
*   📊 **Export Laporan**: Unduh rekapitulasi kehadiran ke format Excel (.xlsx) untuk arsip sekolah.
*   🔔 **Real-time**: Simulasi sinkronisasi data antar-tab browser menggunakan Broadcast Channel & LocalStorage.

## 🛠️ Teknologi

Project ini dibangun menggunakan stack modern:
*   [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/) (Build tool super cepat)
*   [Tailwind CSS](https://tailwindcss.com/) (Styling UI)
*   [Lucide React](https://lucide.dev/) (Ikon modern)
*   [Recharts](https://recharts.org/) (Grafik statistik)
*   [SheetJS (xlsx)](https://sheetjs.com/) (Pengolahan file Excel)

## 🚀 Cara Instalasi & Menjalankan

Pastikan **Node.js** (versi 18+) sudah terinstall di komputer Anda.

1.  **Buka Terminal** di dalam folder project ini.

2.  **Install Dependencies** (Library):
    ```bash
    npm install
    ```

3.  **Jalankan Server Development**:
    ```bash
    npm run dev
    ```

4.  Buka browser dan akses alamat lokal yang muncul (biasanya `http://localhost:5173`).

## 🔑 Akun Demo (Login Admin)

Gunakan akun berikut untuk masuk ke dashboard admin:

| Role | Username | Password | Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password` | Full Akses (Kecuali kelola admin lain) |
| **Super Admin** | `superadmin` | `Samarinda88!` | Full Akses + Kelola semua user |
| **Operator** | `operator` | `password` | Akses Dashboard & Verifikasi saja |

## 📂 Struktur Folder Utama

```
siswa-connect/
├── public/
├── src/
│   ├── components/      # Komponen UI (Form, Dashboard, Tables, dll)
│   ├── services/        # Logika Bisnis & Mock Database (LocalStorage)
│   ├── App.tsx          # Routing & Layout Utama
│   ├── types.ts         # Definisi Tipe Data TypeScript
│   └── main.tsx         # Entry Point Aplikasi
├── index.html           # HTML Root (Config Tailwind ada di sini)
├── package.json         # Daftar Library
└── vite.config.ts       # Konfigurasi Server
```

## 👤 Kredit

Dikembangkan dengan ❤️ oleh **ArifWbo**
*   [Instagram @arifwbo](https://www.instagram.com/arifwbo/)
