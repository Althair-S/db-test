/* eslint-disable */
const { MongoClient } = require('mongodb');
const fs = require('fs');

// KONFIGURASI
const LOCAL_URI = 'mongodb://localhost:27017';
const LOCAL_DB = 'pr';

// Ganti dengan connection string MongoDB Atlas Anda
let ATLAS_URI = '';
// Read .env.local for ATLAS_URI
const envPath = require('path').join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    ATLAS_URI = match[1].trim();
  }
}

const ATLAS_DB = 'pr';

async function exportToJSON() {
  console.log('📦 Exporting data from local MongoDB...\n');
  
  const client = new MongoClient(LOCAL_URI);
  
  try {
    await client.connect();
    const db = client.db(LOCAL_DB);
    
    // Export users
    const users = await db.collection('users').find({}).toArray();
    fs.writeFileSync('users-export.json', JSON.stringify(users, null, 2));
    console.log(`✅ Exported ${users.length} users to users-export.json`);
    
    // Export purchase requests
    const prs = await db.collection('purchaserequests').find({}).toArray();
    fs.writeFileSync('purchaserequests-export.json', JSON.stringify(prs, null, 2));
    console.log(`✅ Exported ${prs.length} purchase requests to purchaserequests-export.json`);
    
    console.log('\n✅ Export completed!\n');
    console.log('📝 Next steps:');
    console.log('1. Update ATLAS_URI in this file with your MongoDB Atlas connection string');
    console.log('2. Run: node migrate-to-atlas.js import');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

async function importToAtlas() {
  console.log('📤 Importing data to MongoDB Atlas...\n');
  
  if (!ATLAS_URI || ATLAS_URI.includes('<username>') || ATLAS_URI.includes('<password>')) {
    console.error('❌ Error: MONGODB_URI not found in .env.local or is invalid!');
    console.log('\nPlease ensure .env.local has a valid MONGODB_URI');
    return;
  }
  
  const client = new MongoClient(ATLAS_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const db = client.db(ATLAS_DB);
    
    // Import users
    if (fs.existsSync('users-export.json')) {
      const users = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
      if (users.length > 0) {
        await db.collection('users').deleteMany({});
        await db.collection('users').insertMany(users);
        console.log(`✅ Imported ${users.length} users`);
      }
    }
    
    // Import purchase requests
    if (fs.existsSync('purchaserequests-export.json')) {
      const prs = JSON.parse(fs.readFileSync('purchaserequests-export.json', 'utf8'));
      if (prs.length > 0) {
        await db.collection('purchaserequests').deleteMany({});
        await db.collection('purchaserequests').insertMany(prs);
        console.log(`✅ Imported ${prs.length} purchase requests`);
      }
    }
    
    console.log('\n✅ Import completed!\n');
    console.log('📝 Next steps:');
    console.log('1. Update .env.local with your MongoDB Atlas URI');
    console.log('2. Restart your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Tip: Make sure your username and password are correct');
      console.log('If your password has special characters, they need to be URL encoded');
    }
  } finally {
    await client.close();
  }
}

// Main
const command = process.argv[2];

if (command === 'export') {
  exportToJSON();
} else if (command === 'import') {
  importToAtlas();
} else {
  console.log('📚 MongoDB Migration Tool\n');
  console.log('Usage:');
  console.log('  node migrate-to-atlas.js export   - Export data from local MongoDB');
  console.log('  node migrate-to-atlas.js import   - Import data to MongoDB Atlas');
  console.log('\nSteps:');
  console.log('1. Run export first');
  console.log('2. Update ATLAS_URI in this file');
  console.log('3. Run import');
}
