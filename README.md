# � Sikola Mombine - Internal System

Sistem manajemen internal untuk Yayasan Sikola Mombine, dirancang untuk mengelola proses operasional keuangan dan administrasi secara efisien dan transparan.

## 🌟 Fitur Utama

### 🔐 Otentikasi & Keamanan

- **Role-Based Access Control (RBAC)**: Akses dibedakan berdasarkan role:
  - **Admin**: Akses penuh ke manajemen user dan data master.
  - **Finance**: Review, approval, dan manajemen pembayaran.
  - **User**: Membuat dan melacak permintaan (PR/CR).
- **Secure Login**: Enkripsi password menggunakan bcrypt.
- **Session Management**: Menggunakan NextAuth.js untuk sesi yang aman.

### 📝 Purchase Requests (PR)

- **Pembuatan PR**: Form intuitif dengan multiple items dan kalkulasi otomatis.
- **Workflow Persetujuan**: Status tracking (Pending → Approved/Rejected).
- **Cetak PDF**: Template cetak resmi dengan tanda tangan digital.
- **Budgeting**: Tracking budget vs realisasi (Costing To).

### 💸 Cash Requests (CR)

- **Pengajuan Dana**: Form pengajuan dana tunai/cash advance.
- **Vendor Management**: Integrasi dengan data supplier, fitur auto-add vendor baru.
- **Itemized Details**: Rincian penggunaan dana dengan perhitungan pajak (PPN 11%).
- **Cetak PDF**: Template cetak standar untuk dokumentasi keuangan.

### 📊 Dashboard & Monitoring

- **Overview**: Ringkasan status PR dan CR terkini.
- **Filter & Search**: Pencarian mudah berdasarkan status, tanggal, atau nomor referensi.
- **Statistik**: Visualisasi data pengajuan.

### 🗂️ Master Data Management

- **Vendors**: Database supplier/vendor dengan detail kontak dan pembayaran.
- **Programs**: Manajemen program kerja dan proyek yayasan.
- **Users**: Manajemen akun pengguna dan hak akses (Admin only).

## �️ Teknologi

Sistem ini dibangun menggunakan teknologi web modern:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) dengan [Mongoose](https://mongoosejs.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Auth**: [NextAuth.js v5](https://authjs.dev/)
- **PDF Generation**: [React-To-Print](https://www.npmjs.com/package/react-to-print)

## 🚀 Panduan Instalasi & Penggunaan

### Prasyarat

- Node.js (v18+)
- MongoDB (Lokal atau Atlas)

### 1. Clone & Install

```bash
git clone <repository-url>
cd db-test
npm install
```

### 2. Konfigurasi Environment

Buat file `.env.local` di root folder dan sesuaikan variabel berikut:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/pr"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database & User Awal

Jalankan script seeding untuk membuat user default:

```bash
npm run seed
```

### 4. Jalankan Aplikasi

**Mode Development:**

```bash
npm run dev
```

Akses di `http://localhost:3000`

**Mode Production:**

```bash
npm run build
npm start
```

## 📂 Struktur Project

```
├── app/
│   ├── api/            # Route Handlers (Backend API)
│   ├── dashboard/      # Halaman utama aplikasi (Protected)
│   │   ├── cash-requests/
│   │   ├── purchase-requests/
│   │   ├── vendors/
│   │   ├── programs/
│   │   └── users/
│   ├── login/          # Halaman login
│   └── layout.tsx      # Root layout
├── lib/
│   ├── db.ts           # Koneksi Database
│   ├── models/         # Mongoose Models (Schema)
│   └── auth.ts         # Konfigurasi NextAuth
├── components/         # Reusable UI Components
├── public/             # Static assets
└── scripts/            # Utility scripts (seed, check-db)
```

## 🤝 Kontribusi & Workflow

1.  **User** membuat PR/CR -> Status `Pending`.
2.  **Finance** menerima notifikasi/melihat di dashboard.
3.  **Finance** melakukan review -> `Approve` atau `Reject`.
4.  **User** mencetak dokumen yang sudah disetujui untuk proses pencairan/pembelian.

---

Built with ❤️ for Eet Elvian Setiawan
