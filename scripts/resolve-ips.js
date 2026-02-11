const dns = require('dns');

// Force Google DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const hosts = [
  'db-test-shard-00-00.hlx3rbi.mongodb.net',
  'db-test-shard-00-01.hlx3rbi.mongodb.net',
  'db-test-shard-00-02.hlx3rbi.mongodb.net'
];

async function resolve() {
  console.log('Resolving hosts...');
  for (const host of hosts) {
    try {
      const addresses = await dns.promises.resolve4(host);
      console.log(`${host} -> ${addresses.join(', ')}`);
    } catch (err) {
      console.error(`Failed to resolve ${host}:`, err.message);
    }
  }
}

resolve();
