# 🎉 Purchase Request Management System

## 🔐 Login Credentials

User Login

| Role        | Email               | Password   |
| ----------- | ------------------- | ---------- |
| **Admin**   | admin@example.com   | admin123   |
| **Finance** | finance@example.com | finance123 |
| **User**    | user@example.com    | user123    |

## 🚀 Cara Menggunakan

### 1. Buka Browser

Buka **http://localhost:3000** di browser Anda

### 2. Login

Gunakan salah satu credentials di atas untuk login

### 3. Test Workflow

#### Sebagai USER (user@example.com)

1. Klik "Buat PR Baru" atau navigasi ke "My Purchase Requests"
2. Isi form dengan:
   - **Section 1**: Department, PR Number, Budgeted, Costing To
   - **Section 2**: Tambah items (nama, quantity, unit, price)
   - Total akan otomatis terhitung dalam Rupiah
3. Klik "Simpan Purchase Request"
4. Lihat PR Anda di list (status: Pending)
5. Anda bisa **Edit** atau **Delete** PR yang masih pending

#### Sebagai FINANCE (finance@example.com)

1. Navigasi ke "Review Requests"
2. Lihat semua PR dari semua user
3. Klik "View" pada PR yang pending
4. Klik **"Approve"** untuk menyetujui, atau
5. Klik **"Reject"** dan beri alasan penolakan
6. PR yang sudah approved/rejected tidak bisa diedit oleh user

#### Sebagai ADMIN (admin@example.com)

1. Navigasi ke "Manage Users"
2. Lihat semua user dengan statistik
3. Klik "Create User" untuk membuat user baru
4. Pilih role: admin, finance, atau user
5. Edit atau hapus user yang ada
6. Lihat semua PR di "All Requests"

## 📋 Fitur

### ✅ Authentication

- Login dengan email & password
- Password terenkripsi dengan bcrypt
- Session management dengan NextAuth
- Auto redirect ke dashboard setelah login

### ✅ Role-Based Access Control

- **Admin**: Kelola user, lihat semua PR
- **Finance**: Review & approve/reject PR
- **User**: Buat, edit, delete PR sendiri

### ✅ Purchase Request Management

- Form 2 section sesuai requirement
- Multiple items dengan auto-calculation
- Format Rupiah otomatis
- Status workflow: Pending → Approved/Rejected
- Edit/delete hanya untuk PR pending
- Filter by status (All, Pending, Approved, Rejected)

### ✅ User Management (Admin)

- CRUD operations lengkap
- Role assignment
- Statistics dashboard

### ✅ UI/UX

- Responsive design (mobile-friendly)
- Modern gradient cards
- Loading states
- Error handling
- Statistics cards

## 🗄️ Database

MongoDB berjalan di: `localhost:27017`
Database name: `pr`

Collections:

- `users` - 3 users sudah dibuat
- `purchaserequests` - akan terisi saat user membuat PR

## 🔧 Commands

```bash
# Development server (sudah berjalan)
npm run dev

# Build production
npm run build

# Start production
npm start

# Create users (sudah dijalankan)
node create-users.js
```

- Pastikan MongoDB tetap berjalan
- Jangan stop `npm run dev`
- Password default untuk testing, ganti di production
- Data tersimpan di MongoDB lokal

## 🆘 Troubleshooting

**Login gagal?**

- Pastikan MongoDB berjalan
- Check credentials: admin@example.com / admin123

**PR tidak muncul?**

- Refresh halaman
- Check role user (user hanya lihat PR sendiri)

**Error saat create PR?**

- Pastikan PR Number unique
- Isi semua field yang required (\*)

---

**Selamat mencoba! Aplikasi siap digunakan! 🚀**
