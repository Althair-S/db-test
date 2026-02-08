# 🚀 Cara Migrasi ke MongoDB Atlas (Online)

## ✅ Step 1: Export Data (SUDAH SELESAI!)

Data Anda sudah berhasil di-export ke:

- `users-export.json` - Berisi semua user
- `purchaserequests-export.json` - Berisi semua PR

## 📝 Step 2: Setup MongoDB Atlas

### 2.1 Buat Account & Cluster

1. **Buka** https://www.mongodb.com/cloud/atlas
2. **Sign up** atau login
3. **Klik** "Build a Database"
4. **Pilih** FREE tier (M0 Sandbox)
5. **Pilih** Provider: AWS atau Google Cloud
6. **Pilih** Region: Singapore (ap-southeast-1) - terdekat dengan Indonesia
7. **Klik** "Create"

### 2.2 Setup Database User

1. **Klik** "Database Access" di sidebar
2. **Klik** "Add New Database User"
3. **Pilih** "Password" authentication
4. **Isi**:
   - Username: `pruser` (atau nama lain)
   - Password: Buat password yang kuat (CATAT INI!)
5. **Pilih** "Built-in Role": "Read and write to any database"
6. **Klik** "Add User"

### 2.3 Setup Network Access

1. **Klik** "Network Access" di sidebar
2. **Klik** "Add IP Address"
3. **Pilih** "Allow Access from Anywhere" (0.0.0.0/0)
   - Untuk production, gunakan IP spesifik
4. **Klik** "Confirm"

### 2.4 Dapatkan Connection String

1. **Klik** "Database" di sidebar
2. **Klik** "Connect" pada cluster Anda
3. **Pilih** "Drivers"
4. **Pilih** Driver: Node.js, Version: 5.5 or later
5. **Copy** connection string, contoh:
   ```
   mongodb+srv://pruser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 🔧 Step 3: Update Script & Import

### 3.1 Edit `migrate-to-atlas.js`

Buka file `migrate-to-atlas.js` dan update baris ini:

```javascript
// Ganti dengan connection string Anda
const ATLAS_URI =
  "mongodb+srv://pruser:PASSWORD_ANDA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority";
```

**PENTING**:

- Ganti `PASSWORD_ANDA` dengan password yang Anda buat tadi
- Ganti `cluster0.xxxxx` dengan cluster name Anda
- Jika password ada karakter special (@, #, %, dll), encode dulu:
  - Contoh: `p@ssw0rd` → `p%40ssw0rd`
  - @ → %40, # → %23, % → %25

### 3.2 Jalankan Import

```bash
node migrate-to-atlas.js import
```

## 🔄 Step 4: Update Aplikasi

### 4.1 Update `.env.local`

Buka file `.env.local` dan update:

```env
MONGODB_URI=mongodb+srv://pruser:PASSWORD_ANDA@cluster0.xxxxx.mongodb.net/pr?retryWrites=true&w=majority
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NEXTAUTH_URL=http://localhost:3000
```

**Perhatikan**: Tambahkan `/pr` sebelum `?retryWrites` untuk specify database name!

### 4.2 Restart Aplikasi

```bash
npm run dev
```

### 4.3 Test Login

Buka http://localhost:3000 dan login dengan:

- Admin: admin@example.com / admin123
- Finance: finance@example.com / finance123
- User: user@example.com / user123

## ✅ Verifikasi

Setelah login berhasil, cek di MongoDB Atlas:

1. Klik "Database" → "Browse Collections"
2. Anda akan melihat database `pr` dengan collections:
   - `users`
   - `purchaserequests`

## 🆘 Troubleshooting

### Error: "Authentication failed"

- Pastikan username dan password benar
- Cek apakah password sudah di-encode jika ada karakter special

### Error: "Connection timeout"

- Pastikan Network Access sudah di-setup (0.0.0.0/0)
- Tunggu beberapa menit, kadang butuh waktu untuk propagate

### Error: "MongoServerError: bad auth"

- Username atau password salah
- Pastikan user sudah dibuat di Database Access

### Aplikasi tidak bisa connect

- Pastikan `.env.local` sudah di-update
- Restart aplikasi dengan `npm run dev`
- Cek console untuk error message

## 📊 Keuntungan MongoDB Atlas

✅ **Gratis** untuk tier M0 (512MB storage)
✅ **Backup otomatis**
✅ **Monitoring & alerts**
✅ **Scalable** - bisa upgrade kapan saja
✅ **Secure** - built-in security features
✅ **Global** - bisa diakses dari mana saja

---

**Selamat! Database Anda sekarang online! 🎉**
