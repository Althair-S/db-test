const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function testLogin() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('pr');
    const users = db.collection('users');
    
    // Test admin login
    const testEmail = 'admin@example.com';
    const testPassword = 'admin123';
    
    console.log('🔍 Testing login for:', testEmail);
    console.log('📝 Password to test:', testPassword);
    console.log('');
    
    const user = await users.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found in database!');
      return;
    }
    
    console.log('✅ User found in database');
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Email:', user.email);
    console.log('   Password hash:', user.password.substring(0, 20) + '...');
    console.log('');
    
    // Test bcrypt compare
    console.log('🔐 Testing bcrypt.compare...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password MATCH! Login should work!');
    } else {
      console.log('❌ Password MISMATCH! Login will fail!');
      console.log('');
      console.log('🔧 Creating new hash for testing...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('   New hash:', newHash);
      console.log('');
      console.log('   Testing new hash...');
      const newMatch = await bcrypt.compare(testPassword, newHash);
      console.log('   New hash test:', newMatch ? '✅ WORKS' : '❌ FAILED');
    }
    
  } finally {
    await client.close();
  }
}

testLogin().catch(console.error);
