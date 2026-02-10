# 🔐 Default Admin Account

## Login Credentials

Untuk login pertama kali setelah deployment (tanpa perlu database):

```
Email: superadmin@system.local
Password: SuperAdmin123!@#
```

## ⚠️ PENTING - Keamanan

### 1. Ganti Password di Production

**WAJIB** ganti password default di file `auth.ts` sebelum deploy ke production:

```typescript
const DEFAULT_ADMIN = {
  email: "superadmin@system.local",
  password: "GANTI_PASSWORD_INI", // Gunakan password yang kuat!
  name: "Super Admin",
  role: "admin" as const,
  id: "default-admin-id",
};
```

### 2. Atau Gunakan Environment Variable

Lebih aman lagi, simpan di `.env.local`:

```env
DEFAULT_ADMIN_EMAIL=superadmin@system.local
DEFAULT_ADMIN_PASSWORD=your-super-secure-password-here
```

Kemudian update `auth.ts`:

```typescript
const DEFAULT_ADMIN = {
  email: process.env.DEFAULT_ADMIN_EMAIL || "superadmin@system.local",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "SuperAdmin123!@#",
  name: "Super Admin",
  role: "admin" as const,
  id: "default-admin-id",
};
```

## 📝 Cara Menggunakan

### Setelah Deployment Pertama Kali:

1. **Login dengan default admin**
   - Email: `superadmin@system.local`
   - Password: `SuperAdmin123!@#` (atau yang sudah Anda ganti)

2. **Buat user admin baru dari database**
   - Masuk ke "Manage Users"
   - Klik "Create User"
   - Buat admin baru dengan email & password Anda
   - Role: Admin

3. **Logout dan login dengan admin baru**
   - Pastikan admin baru berfungsi

4. **(Opsional) Disable default admin**
   - Setelah punya admin dari database, Anda bisa comment/hapus kode default admin di `auth.ts`

## 🎯 Keuntungan

✅ **Tidak perlu database** untuk login pertama kali
✅ **Mudah deployment** - langsung bisa login setelah deploy
✅ **Aman** - bisa di-disable setelah setup selesai
✅ **Fleksibel** - bisa digunakan sebagai recovery account

## 🔒 Best Practices

1. **Ganti password** sebelum deploy ke production
2. **Gunakan password yang kuat** (min 16 karakter, kombinasi huruf/angka/simbol)
3. **Simpan di environment variable** untuk keamanan lebih baik
4. **Disable setelah setup** jika tidak diperlukan lagi
5. **Jangan share** credentials ini ke siapapun

## 📊 Login Priority

Sistem akan cek login dengan urutan:

1. **Default Admin** (hardcoded) - dicek pertama
2. **Database Users** - dicek jika bukan default admin

Jadi default admin akan selalu bisa login meskipun database error.

---

**Status**: Default admin sudah aktif dan siap digunakan! ✅
