# 📁 Project Structure

## Root Directory

```
db-test/
├── app/              # Next.js app directory (routes & pages)
├── components/       # React components
├── lib/             # Utility libraries
├── models/          # Mongoose models
├── types/           # TypeScript type definitions
├── public/          # Static assets
├── scripts/         # Database & utility scripts
├── docs/            # Documentation files
├── .env.local       # Environment variables
├── auth.ts          # NextAuth configuration
├── auth.config.ts   # NextAuth config
└── README.md        # Main documentation
```

## 📂 Folder Details

### `/app` - Next.js Application

- **`/api`** - API routes
  - `/auth` - NextAuth endpoints
  - `/purchase-requests` - PR CRUD operations
  - `/users` - User management
  - `/programs` - Program management
- **`/dashboard`** - Protected dashboard pages
  - `/purchase-requests` - PR pages
  - `/users` - User management pages
  - `/programs` - Program management pages
- **`/login`** - Login page

### `/components` - React Components

- `Navbar.tsx` - Navigation bar (deprecated)
- `Sidebar.tsx` - Sidebar navigation (current)

### `/lib` - Utility Libraries

- `mongodb.ts` - MongoDB connection
- `prNumberGenerator.ts` - PR number generator
- `programAccess.ts` - Program access validation

### `/models` - Database Models

- `User.ts` - User model
- `PurchaseRequest.ts` - Purchase Request model
- `Program.ts` - Program model

### `/scripts` - Database & Utility Scripts

**Setup Scripts:**

- `create-users.js` - Create initial users
- `setup-test-data.js` - Setup programs & user access
- `fix-user-program-access.js` - Fix user program access

**Migration Scripts:**

- `migrate-add-programs.ts` - Add programs to database
- `migrate-to-atlas.js` - Migrate to MongoDB Atlas
- `import-to-atlas.js` - Import data to Atlas

**Debug Scripts:**

- `debug-create-pr.js` - Debug PR creation setup
- `test-login.js` - Test login functionality
- `check-atlas.js` - Check Atlas connection

**Export Files:**

- `users-export.json` - Exported users
- `purchaserequests-export.json` - Exported PRs

### `/docs` - Documentation

- `README.md` - Main documentation (root)
- `STATUS.md` - Current status
- `DEBUG_500_ERROR.md` - Error debugging guide
- `DEFAULT_ADMIN.md` - Default admin account info
- `ATLAS_MIGRATION.md` - MongoDB Atlas migration guide
- `ATLAS_TROUBLESHOOTING.md` - Atlas troubleshooting
- `MIGRATION_GUIDE.md` - General migration guide
- `CREATE_ADMIN.md` - Create admin instructions

## 🚀 Quick Start

### 1. Setup Database

```bash
# Create initial users
node scripts/create-users.js

# Setup programs and access
node scripts/setup-test-data.js
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Login

- Admin: `admin@example.com` / `admin123`
- Finance: `finance@example.com` / `finance123`
- User: `user@example.com` / `user123`
- Super Admin: `superadmin@system.local` / `SuperAdmin123!@#`

## 🔧 Useful Scripts

### Debug

```bash
# Check PR creation setup
node scripts/debug-create-pr.js

# Test login
node scripts/test-login.js
```

### Database

```bash
# Fix user program access
node scripts/fix-user-program-access.js

# Setup test data
node scripts/setup-test-data.js
```

### Migration

```bash
# Export from local
node scripts/migrate-to-atlas.js export

# Import to Atlas
node scripts/migrate-to-atlas.js import
```

## 📖 Documentation

See `/docs` folder for detailed documentation:

- Error debugging: `docs/DEBUG_500_ERROR.md`
- Atlas migration: `docs/ATLAS_MIGRATION.md`
- Default admin: `docs/DEFAULT_ADMIN.md`

---

**Last Updated**: 2026-02-10
