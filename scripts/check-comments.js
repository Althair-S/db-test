const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function checkComments() {
  console.log('🔍 Checking PR Comments...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Get all PRs with comments
    const prs = await db.collection('purchaserequests').find({}).toArray();
    
    console.log(`📋 Found ${prs.length} Purchase Requests\n`);
    
    prs.forEach((pr, idx) => {
      console.log(`\n${idx + 1}. PR: ${pr.prNumber}`);
      console.log(`   Activity: ${pr.activityName || 'N/A'}`);
      console.log(`   Status: ${pr.status}`);
      console.log(`   Created by: ${pr.createdByName}`);
      
      if (pr.comments && pr.comments.length > 0) {
        console.log(`   ✅ Comments: ${pr.comments.length}`);
        pr.comments.forEach((comment, cidx) => {
          console.log(`      ${cidx + 1}. [${comment.commentedByRole}] ${comment.commentedByName}:`);
          console.log(`         "${comment.comment}"`);
          console.log(`         Time: ${new Date(comment.createdAt).toLocaleString()}`);
        });
      } else {
        console.log(`   ⚠️  No comments`);
      }
    });
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkComments();
