const dns = require('dns');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Override dns.lookup to use custom DNS
const originalLookup = dns.lookup;
dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    
    //console.log(`Intercepted lookup for: ${hostname}`);
    
    // Only intercept our MongoDB hosts
    if (hostname.includes('mongodb.net')) {
         dns.resolve4(hostname, (err, addresses) => {
             if (err || !addresses.length) {
                 // Fallback to original
                 return originalLookup(hostname, options, callback);
             }
             // Return first address
             const family = 4;
             callback(null, addresses[0], family);
         });
    } else {
        return originalLookup(hostname, options, callback);
    }
};

async function testConnection() {
    // Read .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    let match = envContent.match(/DATABASE_URL=(.+)/);
    if (!match) {
        match = envContent.match(/MONGODB_URI=(.+)/);
    }
    
    if (!match) {
        console.error('❌ connection string not found in .env.local');
        return;
    }
    
    const uri = match[1].trim();
    console.log('🔄 Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('🎉 Connected successfully with DNS Override!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
