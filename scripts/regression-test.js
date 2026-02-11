const dns = require('dns');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Force Google DNS
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('✅ DNS servers set to 8.8.8.8, 1.1.1.1');
} catch (e) {
    console.error('❌ Failed to set DNS servers:', e.message);
}

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
    console.log('🔄 Connecting to:', uri.replace(/:([^:@]+)@/, ':****@')); // Mask password

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('🎉 Connected successfully with Google DNS!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.cause) console.error('   Cause:', error.cause);
    }
}

testConnection();
