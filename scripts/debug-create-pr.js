const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pr';

async function debugCreatePR() {
  console.log('🔍 Debugging Create PR Setup...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ MongoDB Connection: OK\n');
    
    const db = client.db(DB_NAME);
    
    // Check Programs
    console.log('📋 Checking Programs...');
    const programs = await db.collection('programs').find({}).toArray();
    
    if (programs.length === 0) {
      console.log('❌ No programs found!');
      console.log('   Run: node setup-test-data.js');
    } else {
      console.log(`✅ Found ${programs.length} programs:`);
      programs.forEach(p => {
        console.log(`   - ${p.name} (${p.code})`);
        console.log(`     ID: ${p._id}`);
        console.log(`     Active: ${p.isActive}`);
        console.log(`     PR Counter: ${p.prCounter} (Year: ${p.prCounterYear})`);
      });
    }
    
    // Check Users
    console.log('\n👥 Checking Users...');
    const users = await db.collection('users').find({}).toArray();
    
    users.forEach(u => {
      console.log(`\n   ${u.email} (${u.role})`);
      console.log(`   ID: ${u._id}`);
      
      if (!u.programAccess) {
        console.log('   ❌ Missing programAccess field!');
        console.log('      Run: node fix-user-program-access.js');
      } else if (u.programAccess.length === 0) {
        console.log('   ⚠️  No program access granted');
        console.log('      Run: node setup-test-data.js');
      } else {
        console.log(`   ✅ Has access to ${u.programAccess.length} programs`);
        u.programAccess.forEach(pid => {
          const prog = programs.find(p => p._id.toString() === pid.toString());
          if (prog) {
            console.log(`      - ${prog.name} (${prog.code})`);
          } else {
            console.log(`      - Unknown program: ${pid}`);
          }
        });
      }
    });
    
    // Check Purchase Requests
    console.log('\n📦 Checking Purchase Requests...');
    const prs = await db.collection('purchaserequests').find({}).toArray();
    console.log(`   Total PRs: ${prs.length}`);
    
    if (prs.length > 0) {
      console.log('   Recent PRs:');
      prs.slice(-3).forEach(pr => {
        console.log(`   - ${pr.prNumber} (${pr.status})`);
        console.log(`     Program: ${pr.programName || 'N/A'}`);
        console.log(`     Created by: ${pr.createdByName}`);
      });
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Programs: ${programs.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Purchase Requests: ${prs.length}`);
    
    // Check if ready
    console.log('\n🎯 Ready to Create PR?');
    
    const issues = [];
    
    if (programs.length === 0) {
      issues.push('❌ No programs available');
    }
    
    const usersWithAccess = users.filter(u => u.programAccess && u.programAccess.length > 0);
    if (usersWithAccess.length === 0) {
      issues.push('❌ No users have program access');
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(i => console.log(`   ${i}`));
      console.log('\n💡 Fix: Run node setup-test-data.js');
    } else {
      console.log('   ✅ All checks passed!');
      console.log('   ✅ Users can create PRs');
      console.log('\n📝 Test with:');
      console.log('   - Login as: user@example.com / user123');
      console.log('   - Go to: Create Purchase Request');
      console.log('   - Select a program from dropdown');
      console.log('   - Fill in the form and submit');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.close();
  }
}

debugCreatePR();
