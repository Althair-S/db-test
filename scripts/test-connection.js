const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...');

  // 1. Read .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  let match = envContent.match(/DATABASE_URL=(.+)/);
  if (!match) {
    match = envContent.match(/MONGODB_URI=(.+)/);
  }
  
  if (!match) {
    console.error('❌ MONGODB_URI/DATABASE_URL not found in .env.local');
    return;
  }

  const uri = match[1].trim();

  // 2. Try to connect
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, 
    connectTimeoutMS: 5000
  });

  try {
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connection Sucessful!');
    
    // INSPECT CONNECTED SERVERS
    console.log('\n🔍 Connected Topology:');
    
    // Try to get servers from topology
    if (client.topology && client.topology.s) {
       // Check for description.servers which is a Map
       const servers = client.topology.description.servers;
       const hosts = [];
       for (const [host, info] of servers) {
           console.log(`   - ${host} (${info.type})`);
           hosts.push(host);
       }

       if (hosts.length > 0) {
           console.log('\n📝 Standard Connection String Hosts:');
           console.log(hosts.join(','));
           
           // Construct Standard URI
           const userPassMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
           const userPass = userPassMatch ? userPassMatch[1] : '';
           const dbMatch = uri.match(/\.net\/([^?]+)/);
           const db = dbMatch ? dbMatch[1] : 'test';
           
           // Extract replica set name (usually part of the host or derived)
           // For Atlas, it is usually atlas-<clusterid>-shard-0
           // But let's check if the client knows it
           const setName = client.topology.description.setName;
           console.log(`\n📦 Replica Set Name: ${setName}`);
           
           const standardUri = `mongodb://${userPass}@${hosts.join(',')}/${db}?ssl=true&authSource=admin&replicaSet=${setName}`;
           console.log('\n📋 Standard Connection String:');
           console.log(standardUri);
       }
    }

  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error(error);
  } finally {
    await client.close();
  }
}

testConnection();
