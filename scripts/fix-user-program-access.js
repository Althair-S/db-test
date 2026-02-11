/* eslint-disable */
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function addProgramAccessToUsers() {
  console.log('🔧 Adding programAccess field to existing users...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const users = db.collection('users');
    
    // Update all users that don't have programAccess field
    const result = await users.updateMany(
      { programAccess: { $exists: false } },
      { $set: { programAccess: [] } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with programAccess field`);
    
    // Also update users that have programAccess but it's null
    const result2 = await users.updateMany(
      { programAccess: null },
      { $set: { programAccess: [] } }
    );
    
    console.log(`✅ Fixed ${result2.modifiedCount} users with null programAccess`);
    
    // Show all users
    console.log('\n📋 Current users:');
    const allUsers = await users.find({}).toArray();
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Programs: ${user.programAccess?.length || 0}`);
    });
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

addProgramAccessToUsers();
