const dns = require('dns');

// Force Google DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Based on typical Atlas shard pattern for "cluster0.5nngnt1.mongodb.net",
// the shards are likely:
// cluster0-shard-00-00.5nngnt1.mongodb.net
// cluster0-shard-00-01.5nngnt1.mongodb.net
// cluster0-shard-00-02.5nngnt1.mongodb.net
// OR
// cluster0-shard-00-00.5nngnt1.mongodb.net (sometimes the pattern varies)

const hosts = [
  'cluster0-shard-00-00.5nngnt1.mongodb.net',
  'cluster0-shard-00-01.5nngnt1.mongodb.net',
  'cluster0-shard-00-02.5nngnt1.mongodb.net'
];

async function resolve() {
  console.log('Resolving new cluster hosts...');
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
