const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function fixUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('pr');
    const users = db.collection('users');
    
    // Delete all existing users
    await users.deleteMany({});
    console.log('✅ Cleared existing users');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await users.insertOne({
      email: 'admin@example.com',  // Already lowercase
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Admin user created successfully!');
    
    // Create finance user
    const financePassword = await bcrypt.hash('finance123', 10);
    await users.insertOne({
      email: 'finance@example.com',  // Already lowercase
      password: financePassword,
      name: 'Finance User',
      role: 'finance',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Finance user created successfully!');
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await users.insertOne({
      email: 'user@example.com',  // Already lowercase
      password: userPassword,
      name: 'Regular User',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Regular user created successfully!');
    
    console.log('\n📝 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@example.com / admin123');
    console.log('Finance: finance@example.com / finance123');
    console.log('User:    user@example.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test login for admin
    console.log('\n🔐 Testing admin login...');
    const adminUser = await users.findOne({ email: 'admin@example.com' });
    const isValid = await bcrypt.compare('admin123', adminUser.password);
    console.log(isValid ? '✅ Admin login test: SUCCESS' : '❌ Admin login test: FAILED');
    
    console.log('\n🚀 Buka http://localhost:3000 untuk login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixUsers();
