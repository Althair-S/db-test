const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function testCreatePR() {
  console.log('🧪 Testing PR Creation...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Get a program
    const program = await db.collection('programs').findOne({ isActive: true });
    
    if (!program) {
      console.log('❌ No active program found!');
      return;
    }
    
    console.log(`📋 Using program: ${program.name} (${program.code})`);
    console.log(`   ID: ${program._id}`);
    console.log(`   Counter: ${program.prCounter || 0}`);
    console.log(`   Year: ${program.prCounterYear || 'not set'}`);
    
    // Get a user
    const user = await db.collection('users').findOne({ role: 'user' });
    
    if (!user) {
      console.log('❌ No user found!');
      return;
    }
    
    console.log(`\n👤 Using user: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    
    // Test PR number generation
    console.log('\n🔢 Testing PR Number Generation...');
    
    const currentYear = new Date().getFullYear();
    
    // Simulate the update
    const updatedProgram = await db.collection('programs').findOneAndUpdate(
      {
        _id: program._id,
        isActive: true,
      },
      [
        {
          $set: {
            prCounter: {
              $cond: {
                if: { $ne: ["$prCounterYear", currentYear] },
                then: 1,
                else: { $add: [{ $ifNull: ["$prCounter", 0] }, 1] },
              },
            },
            prCounterYear: currentYear,
          },
        },
      ],
      {
        returnDocument: 'after',
        upsert: false,
      }
    );
    
    if (!updatedProgram) {
      console.log('❌ Failed to update program counter!');
      return;
    }
    
    const prNumber = `${program.code}-${currentYear}-${String(updatedProgram.prCounter).padStart(4, '0')}`;
    console.log(`✅ Generated PR Number: ${prNumber}`);
    
    // Create PR
    console.log('\n📝 Creating Purchase Request...');
    
    const pr = {
      program: program._id,
      programName: program.name,
      programCode: program.code,
      department: 'Test Department',
      budgeted: true,
      costingTo: 'Test Costing',
      prNumber: prNumber,
      items: [
        {
          item: 'Test Item',
          quantity: 1,
          unit: 'pcs',
          price: 10000,
          totalPrice: 10000
        }
      ],
      status: 'pending',
      createdBy: user._id,
      createdByName: user.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('purchaserequests').insertOne(pr);
    
    console.log(`✅ PR Created!`);
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   PR Number: ${prNumber}`);
    
    console.log('\n✅ Test completed successfully!');
    console.log('   The API should work now.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:');
    console.error(error);
  } finally {
    await client.close();
  }
}

testCreatePR();
