# Cara Membuat User Pertama (Admin)

Karena seed script mengalami masalah, berikut cara membuat user admin pertama secara manual:

## Opsi 1: Menggunakan MongoDB Compass

1. Buka MongoDB Compass
2. Connect ke `mongodb://localhost:27017`
3. Pilih database `pr`
4. Buat collection baru bernama `users` (jika belum ada)
5. Insert document berikut:

```json
{
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "name": "Admin User",
  "role": "admin",
  "createdAt": { "$date": "2026-02-08T02:00:00.000Z" },
  "updatedAt": { "$date": "2026-02-08T02:00:00.000Z" }
}
```

**PENTING**: Password di atas adalah placeholder. Anda perlu generate hash bcrypt yang benar.

## Opsi 2: Menggunakan Node.js Script Sederhana

Buat file `create-admin.js`:

```javascript
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

async function createAdmin() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("pr");
    const users = db.collection("users");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await users.insertOne({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } finally {
    await client.close();
  }
}

createAdmin();
```

Jalankan dengan: `node create-admin.js`

## Opsi 3: Setelah Login sebagai Admin

Setelah berhasil login sebagai admin, Anda bisa membuat user lain (finance dan user) melalui halaman "Manage Users" di dashboard.

## Login Credentials

Setelah membuat admin user:

- **Email**: admin@example.com
- **Password**: admin123 (atau password yang Anda set)

Kemudian buat user lain dengan role:

- **Finance**: untuk approve/reject PR
- **User**: untuk membuat PR
