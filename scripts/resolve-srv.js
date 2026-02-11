const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Read .env.local to get the host
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);

if (!match) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const uri = match[1].trim();

// Extract host from mongodb+srv://user:pass@HOST/db...
const hostMatch = uri.match(/@([^/]+)/);
if (!hostMatch) {
  console.error('❌ Could not extract host from URI');
  process.exit(1);
}

const host = hostMatch[1];
const srvRecord = `_mongodb._tcp.${host}`;

console.log(`🔍 Resolving SRV for: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
  if (err) {
    console.error('❌ DNS Resolution Failed:', err);
    return;
  }

  console.log('✅ Found shards:');
  const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');
  console.log(hosts);
  
  // Construct standard URI
  // We need to keep user/pass and db and options
  const userPassMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
  const userPass = userPassMatch ? userPassMatch[1] : '';
  
  const dbMatch = uri.match(/\.net\/([^?]+)/);
  const db = dbMatch ? dbMatch[1] : 'test';
  
  const standardUri = `mongodb://${userPass}@${hosts}/${db}?ssl=true&authSource=admin&replicaSet=atlas-${host.split('.')[0]}-shard-0`;
  
  console.log('\n📝 Proposed Standard URI (Copy this to .env.local):');
  console.log(standardUri);
});
