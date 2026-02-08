const { MongoClient } = require('mongodb');

// Gunakan URI dari .env.local
const ATLAS_URI = 'mongodb+srv://althair-s:oG64vdASw4Bw0CkB@cluster0.5nngnt1.mongodb.net/pr';

async function checkAtlasData() {
  console.log('🔍 Checking MongoDB Atlas data...\n');
  
  const client = new MongoClient(ATLAS_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const db = client.db('pr');
    
    // Check users
    const userCount = await db.collection('users').countDocuments();
    console.log(`👥 Users in Atlas: ${userCount}`);
    
    if (userCount > 0) {
      const users = await db.collection('users').find({}).toArray();
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
    
    // Check PRs
    const prCount = await db.collection('purchaserequests').countDocuments();
    console.log(`\n📋 Purchase Requests in Atlas: ${prCount}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  No users found in MongoDB Atlas!');
      console.log('📝 You need to import data. Run: node import-to-atlas.js');
    } else {
      console.log('\n✅ Data exists in Atlas. Login should work!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAtlasData();
