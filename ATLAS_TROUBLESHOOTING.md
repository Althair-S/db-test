# 🔧 Troubleshooting MongoDB Atlas Connection

## Masalah yang Terjadi

Error: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.5nngnt1.mongodb.net`

Ini adalah masalah DNS/network connection ke MongoDB Atlas.

## Solusi Sementara: Gunakan MongoDB Lokal

**Status saat ini**: ✅ Aplikasi sudah kembali menggunakan MongoDB lokal dan berfungsi normal.

**Login credentials:**

- Admin: admin@example.com / admin123
- Finance: finance@example.com / finance123
- User: user@example.com / user123

## Cara Memperbaiki Koneksi ke MongoDB Atlas

### Opsi 1: Cek Network/Firewall

1. **Pastikan internet stabil**
2. **Cek firewall/antivirus** - mungkin memblokir koneksi MongoDB
3. **Coba dari network lain** - kadang ISP memblokir port MongoDB

### Opsi 2: Gunakan Connection String dengan SRV

Coba format connection string yang berbeda di `.env.local`:

```env
# Format 1: SRV (yang sekarang)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pr

# Format 2: Direct connection (tanpa SRV)
MONGODB_URI=mongodb://cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/pr?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

Untuk mendapatkan format 2:

1. Buka MongoDB Atlas
2. Klik "Connect"
3. Pilih "Connect your application"
4. Pilih "Driver: Node.js" dan toggle "Include full driver code example"
5. Copy connection string yang lebih panjang

### Opsi 3: Whitelist IP Address

1. Buka MongoDB Atlas
2. Klik "Network Access"
3. Pastikan IP address Anda sudah ditambahkan
4. Atau gunakan `0.0.0.0/0` untuk allow semua (hanya untuk development)

### Opsi 4: Cek DNS

Coba test DNS resolution:

```bash
nslookup cluster0.5nngnt1.mongodb.net
```

Jika gagal, mungkin masalah DNS provider Anda.

## Rekomendasi

**Untuk Development**: Gunakan MongoDB lokal (sudah berfungsi)
**Untuk Production**: Selesaikan masalah Atlas connection atau gunakan MongoDB hosting lain

## Alternatif MongoDB Hosting

Jika Atlas terus bermasalah:

1. **MongoDB Cloud Manager** - Official MongoDB hosting
2. **DigitalOcean Managed MongoDB** - Mudah setup
3. **AWS DocumentDB** - Compatible dengan MongoDB
4. **Self-hosted** - Deploy MongoDB di VPS sendiri

---

**Status saat ini**: Aplikasi berjalan normal dengan MongoDB lokal ✅
