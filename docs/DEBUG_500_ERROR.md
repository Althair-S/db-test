# 🔍 Cara Debug Error 500 Internal Server Error

## Apa itu Error 500?

**500 Internal Server Error** adalah error generic dari server yang artinya:

- ❌ Server mengalami masalah yang tidak terduga
- ❌ Bukan masalah di client/browser
- ❌ Detail error disembunyikan dari browser untuk keamanan
- ✅ Harus dicek di **server logs** untuk tahu penyebab sebenarnya

## Penyebab Umum

### 1. **Backend Code Crash**

```javascript
// Contoh: Akses property dari undefined
const user = null;
console.log(user.name); // ❌ Error: Cannot read property 'name' of null
```

### 2. **Database Connection Failure**

```javascript
// Contoh: MongoDB tidak running
await dbConnect(); // ❌ Error: connect ECONNREFUSED
```

### 3. **Missing Required Fields**

```javascript
// Contoh: Field yang required tidak ada
await User.create({
  email: "test@test.com",
  // ❌ Missing: password, name
});
```

### 4. **Type Mismatch**

```javascript
// Contoh: Expect ObjectId tapi dapat string
const programId = "invalid-id";
await Program.findById(programId); // ❌ Error: Cast to ObjectId failed
```

## Cara Debug di Aplikasi Anda

### Step 1: Cek Browser DevTools

1. **Buka DevTools** (F12)
2. **Klik tab Network**
3. **Reproduce error** (coba create PR lagi)
4. **Klik request yang error** (warna merah)
5. **Lihat tab Response** - kadang ada detail error

### Step 2: Cek Terminal/Server Logs

**Ini yang PALING PENTING!** Error detail ada di sini.

Di terminal tempat `npm run dev` berjalan, Anda akan lihat:

```
[auth][error] CallbackRouteError: ...
[auth][cause]: Error: querySrv ECONNREFUSED ...
```

Atau untuk API error:

```
Error creating purchase request: ValidationError: ...
  at Model.save (...)
```

### Step 3: Cek Console Log

Saya sudah menambahkan `console.error()` di API routes:

```typescript
// Di route.ts
catch (error) {
  console.error("Error creating purchase request:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

Jadi error detail akan muncul di terminal.

## Cara Melihat Error di Aplikasi Ini

### Untuk Create PR Error:

1. **Buka terminal** tempat `npm run dev` berjalan
2. **Coba create PR** dari browser
3. **Lihat terminal** - akan muncul error seperti:

```
Error creating purchase request: ValidationError: User validation failed: programAccess: Path `programAccess` is required.
    at ValidationError.inspect (node_modules/mongoose/lib/error/validation.js:50:26)
    ...
```

### Contoh Error yang Sudah Diperbaiki:

**Error 1: Missing programAccess field**

```
Error: Cannot read property 'length' of undefined
  at getUserProgramAccess (lib/programAccess.ts:65)
```

✅ **Fix**: Menambahkan field `programAccess` ke User model

**Error 2: No programs in database**

```
Error: Program not found
  at generatePRNumber (lib/prNumberGenerator.ts:43)
```

✅ **Fix**: Membuat test programs dengan script `setup-test-data.js`

## Tools untuk Debug

### 1. **Console.log Debugging**

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📝 Received body:", body); // Debug input

    const result = await PurchaseRequest.create(body);
    console.log("✅ Created PR:", result); // Debug output

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error:", error); // Debug error
    console.error("Stack trace:", error.stack); // Full stack trace
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### 2. **Try-Catch Blocks**

Semua API routes sudah wrapped dengan try-catch:

```typescript
try {
  // Your code here
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json({ error: "..." }, { status: 500 });
}
```

### 3. **Validation Checks**

```typescript
// Validate input
if (!programId || !items || items.length === 0) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }, // 400 = Bad Request (bukan 500)
  );
}
```

## Checklist Debug Error 500

- [ ] **Cek terminal** - lihat error message lengkap
- [ ] **Cek Network tab** - lihat response dari server
- [ ] **Cek database** - pastikan MongoDB running
- [ ] **Cek data** - pastikan ada programs dan user punya access
- [ ] **Cek validation** - pastikan semua required fields terisi
- [ ] **Cek types** - pastikan ObjectId valid

## Untuk Error Saat Ini

Jika masih error saat create PR:

1. **Buka terminal** tempat `npm run dev`
2. **Copy paste error message** yang muncul
3. **Kirim ke saya** untuk analisa lebih lanjut

Atau jalankan script debug:

```bash
node setup-test-data.js
```

Ini akan:

- ✅ Cek apakah ada programs
- ✅ Cek apakah users punya program access
- ✅ Fix jika ada yang missing

---

**TL;DR**: Error 500 = server error. Cek terminal untuk detail error, bukan browser console!
