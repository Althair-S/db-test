const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);
const uri = match[1].trim();
const hostMatch = uri.match(/@([^/]+)/);
const host = hostMatch[1];
const srvRecord = `_mongodb._tcp.${host}`;

console.log(`Setting DNS servers to 8.8.8.8 and 1.1.1.1`);
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('Error setting servers:', e.message);
}

console.log(`🔍 Resolving SRV for: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
  if (err) {
    console.error('❌ Resolution Failed:', err.code);
    return;
  }

  console.log('✅ Found shards:');
  const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');
  console.log(hosts);
  
  const userPassMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
  const userPass = userPassMatch ? userPassMatch[1] : '';
  const dbMatch = uri.match(/\.net\/([^?]+)/);
  const db = dbMatch ? dbMatch[1] : 'test';
  
  const standardUri = `mongodb://${userPass}@${hosts}/${db}?ssl=true&authSource=admin&replicaSet=atlas-${host.split('.')[0]}-shard-0`;
  
  console.log('\n📝 Standard Connection String:');
  console.log(standardUri);
});
