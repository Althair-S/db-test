# Panduan Migrasi Database ke MongoDB Atlas

## Langkah 1: Export Data dari MongoDB Lokal

### Menggunakan mongodump (Recommended)

```bash
# Export seluruh database 'pr'
mongodump --db=pr --out=./backup

# Atau export collection tertentu
mongodump --db=pr --collection=users --out=./backup
mongodump --db=pr --collection=purchaserequests --out=./backup
```

### Menggunakan mongoexport (Alternative - JSON format)

```bash
# Export users collection
mongoexport --db=pr --collection=users --out=users.json --jsonArray

# Export purchaserequests collection
mongoexport --db=pr --collection=purchaserequests --out=purchaserequests.json --jsonArray
```

## Langkah 2: Setup MongoDB Atlas

1. **Buat Account di MongoDB Atlas**
   - Kunjungi: https://www.mongodb.com/cloud/atlas
   - Sign up atau login

2. **Buat Cluster**
   - Pilih "Build a Database"
   - Pilih FREE tier (M0)
   - Pilih region terdekat (Singapore/Jakarta)
   - Klik "Create"

3. **Setup Database Access**
   - Buat database user dengan username & password
   - Catat username dan password ini!

4. **Setup Network Access**
   - Klik "Network Access"
   - Klik "Add IP Address"
   - Pilih "Allow Access from Anywhere" (0.0.0.0/0) untuk development
   - Atau tambahkan IP spesifik untuk production

5. **Dapatkan Connection String**
   - Klik "Connect" pada cluster
   - Pilih "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`

## Langkah 3: Import Data ke MongoDB Atlas

### Menggunakan mongorestore (Recommended)

```bash
# Restore dari backup folder
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pr" ./backup/pr

# Atau restore collection tertentu
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pr" --collection=users ./backup/pr/users.bson
```

### Menggunakan mongoimport (Alternative)

```bash
# Import users
mongoimport --uri="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pr" --collection=users --file=users.json --jsonArray

# Import purchaserequests
mongoimport --uri="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pr" --collection=purchaserequests --file=purchaserequests.json --jsonArray
```

## Langkah 4: Update .env.local

Update file `.env.local` dengan connection string MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pr?retryWrites=true&w=majority
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NEXTAUTH_URL=http://localhost:3000
```

**PENTING**:

- Ganti `<username>` dengan database username Anda
- Ganti `<password>` dengan database password Anda
- Ganti `cluster0.xxxxx` dengan cluster name Anda
- Pastikan password di-encode jika ada karakter special (gunakan encodeURIComponent)

## Langkah 5: Test Koneksi

Restart aplikasi dan test koneksi:

```bash
npm run dev
```

## Troubleshooting

### Error: "Authentication failed"

- Pastikan username dan password benar
- Pastikan password di-encode jika ada karakter special

### Error: "Connection timeout"

- Pastikan IP address sudah ditambahkan di Network Access
- Coba gunakan "Allow Access from Anywhere" untuk testing

### Error: "Database not found"

- Database akan otomatis dibuat saat pertama kali insert data
- Pastikan nama database di connection string benar

## Script Helper untuk Export/Import

Saya akan buatkan script otomatis untuk memudahkan proses ini.
