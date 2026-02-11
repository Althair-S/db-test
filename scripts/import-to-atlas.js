const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let ATLAS_URI = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    ATLAS_URI = match[1].trim();
  }
}

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function importUsers() {
  console.log('📤 Importing users to MongoDB Atlas...\n');
  
  const client = new MongoClient(ATLAS_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const db = client.db('pr');
    const users = db.collection('users');
    
    // Clear existing users
    await users.deleteMany({});
    console.log('🗑️  Cleared existing users\n');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await users.insertOne({
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created admin user');
    
    // Create finance user
    const financePassword = await bcrypt.hash('finance123', 10);
    await users.insertOne({
      email: 'finance@example.com',
      password: financePassword,
      name: 'Finance User',
      role: 'finance',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created finance user');
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await users.insertOne({
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created regular user');
    
    console.log('\n📝 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@example.com / admin123');
    console.log('Finance: finance@example.com / finance123');
    console.log('User:    user@example.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test login
    console.log('\n🔐 Testing admin login...');
    const adminUser = await users.findOne({ email: 'admin@example.com' });
    const isValid = await bcrypt.compare('admin123', adminUser.password);
    console.log(isValid ? '✅ Admin login test: SUCCESS' : '❌ Admin login test: FAILED');
    
    console.log('\n✅ Import completed!');
    console.log('🚀 Buka http://localhost:3000 untuk login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

importUsers();
