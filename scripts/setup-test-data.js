const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function setupTestData() {
  console.log('🔧 Setting up test programs and user access...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const programs = db.collection('programs');
    const users = db.collection('users');
    
    // Create test programs if they don't exist
    const existingPrograms = await programs.countDocuments();
    
    if (existingPrograms === 0) {
      console.log('📝 Creating test programs...');
      
      const testPrograms = [
        {
          name: 'Atlas Program',
          code: 'ATLAS',
          description: 'Main atlas program for general operations',
          isActive: true,
          prCounter: 0,
          prCounterYear: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Finance Program',
          code: 'FIN',
          description: 'Finance department program',
          isActive: true,
          prCounter: 0,
          prCounterYear: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'IT Program',
          code: 'IT',
          description: 'IT department program',
          isActive: true,
          prCounter: 0,
          prCounterYear: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = await programs.insertMany(testPrograms);
      console.log(`✅ Created ${result.insertedCount} programs`);
      
      // Get inserted program IDs
      const programIds = Object.values(result.insertedIds);
      
      // Give all users access to all programs for testing
      console.log('\n📝 Granting program access to users...');
      
      const updateResult = await users.updateMany(
        {},
        { $set: { programAccess: programIds } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} users with program access`);
      
    } else {
      console.log(`ℹ️  ${existingPrograms} programs already exist`);
      
      // Get all program IDs
      const allPrograms = await programs.find({}).toArray();
      const programIds = allPrograms.map(p => p._id);
      
      // Update users with program access
      console.log('\n📝 Updating user program access...');
      const updateResult = await users.updateMany(
        {},
        { $set: { programAccess: programIds } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} users with program access`);
    }
    
    // Show summary
    console.log('\n📊 Summary:');
    const programList = await programs.find({}).toArray();
    console.log(`\n📋 Programs (${programList.length}):`);
    programList.forEach(p => {
      console.log(`   - ${p.name} (${p.code}) - Active: ${p.isActive}`);
    });
    
    const userList = await users.find({}).toArray();
    console.log(`\n👥 Users (${userList.length}):`);
    userList.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) - Programs: ${u.programAccess?.length || 0}`);
    });
    
    console.log('\n✅ Setup completed! Users can now create PRs.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

setupTestData();
