/* eslint-disable */
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function getStandardString() {
  // Read .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (!match) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const uri = match[1].trim();
  console.log('🔄 Attempting to connect to extract Standard Connection String...');

  const maxRetries = 5;
  
  for (let i = 1; i <= maxRetries; i++) {
    console.log(`\n⏳ Attempt ${i}/${maxRetries}...`);
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    try {
      await client.connect();
      console.log('✅ Connected!');
      
      if (client.topology && client.topology.s) {
        const servers = client.topology.description.servers;
        const hosts = [];
        for (const [host] of servers) {
             hosts.push(host);
        }

        if (hosts.length > 0) {
            const userPassMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
            const userPass = userPassMatch ? userPassMatch[1] : '';
            const dbMatch = uri.match(/\.net\/([^?]+)/);
            const db = dbMatch ? dbMatch[1] : 'test';
            const setName = client.topology.description.setName; // atlas-xxxx-shard-0

            const standardUri = `mongodb://${userPass}@${hosts.join(',')}/${db}?ssl=true&authSource=admin&replicaSet=${setName}`;
            
            console.log('\n🎉 SUCCESS! Here is your Standard Connection String:');
            console.log('---------------------------------------------------');
            console.log(standardUri);
            console.log('---------------------------------------------------');
            console.log('👉 Please replace MONGODB_URI in your .env.local with this string.');
            
            await client.close();
            process.exit(0);
        }
      }
      
      await client.close();
    } catch (error) {
      console.error(`❌ Attempt ${i} failed: ${error.message}`);
    }
  }

  console.error('\n❌ Could not connect after check attempts. DNS/Network is too unstable.');
  process.exit(1);
}

getStandardString();
