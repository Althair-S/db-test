const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function testAddComment() {
  console.log('🧪 Testing Add Comment...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Get first PR
    const pr = await db.collection('purchaserequests').findOne({});
    
    if (!pr) {
      console.log('❌ No PR found!');
      return;
    }
    
    console.log(`📋 Testing with PR: ${pr.prNumber}`);
    console.log(`   ID: ${pr._id}`);
    console.log(`   Current comments: ${pr.comments?.length || 0}`);
    
    // Initialize comments if needed
    if (!pr.comments) {
      console.log('\n⚠️  Comments field is undefined, initializing...');
      pr.comments = [];
    }
    
    // Add test comment
    const testComment = {
      commentedBy: new ObjectId(pr.createdBy),
      commentedByName: 'Test Finance',
      commentedByRole: 'finance',
      comment: 'This is a test comment from script',
      createdAt: new Date(),
    };
    
    console.log('\n📝 Adding test comment...');
    
    pr.comments.push(testComment);
    
    // Update in database
    const result = await db.collection('purchaserequests').updateOne(
      { _id: pr._id },
      { 
        $set: { 
          comments: pr.comments,
          revisionRequested: true 
        } 
      }
    );
    
    console.log(`✅ Update result: ${result.modifiedCount} document(s) modified`);
    
    // Verify
    const updated = await db.collection('purchaserequests').findOne({ _id: pr._id });
    console.log(`\n✅ Verification:`);
    console.log(`   Comments count: ${updated.comments?.length || 0}`);
    
    if (updated.comments && updated.comments.length > 0) {
      console.log(`   Latest comment: "${updated.comments[updated.comments.length - 1].comment}"`);
      console.log('\n✅ Comment successfully added!');
    } else {
      console.log('\n❌ Comment was not saved!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

testAddComment();
