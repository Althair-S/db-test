const { MongoClient } = require('mongodb');

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
