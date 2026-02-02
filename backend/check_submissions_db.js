const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const Question = require('./models/Question');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/placeoprep';

async function checkSubmissionsCollection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to placeoprep database');

    // Check if submissions collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const submissionCollection = collections.find(col => col.name === 'submissions');
    
    if (submissionCollection) {
      console.log('✅ Submissions collection exists');
    } else {
      console.log('⚠️  Submissions collection does not exist yet (will be created on first submission)');
    }

    // Check submission model
    console.log('✅ Submission model loaded successfully');
    console.log('📋 Submission schema fields:');
    Object.keys(Submission.schema.paths).forEach(field => {
      if (field !== '_id' && field !== '__v') {
        console.log(`   - ${field}: ${Submission.schema.paths[field].instance || 'Mixed'}`);
      }
    });

    // Count existing submissions
    const submissionCount = await Submission.countDocuments();
    console.log(`📊 Current submissions count: ${submissionCount}`);

    // Check questions for testing
    const questionCount = await Question.countDocuments({ category: 'technical', type: 'coding' });
    console.log(`📝 Available coding questions: ${questionCount}`);

    // Check users for testing
    const userCount = await User.countDocuments();
    console.log(`👥 Available users: ${userCount}`);

    if (submissionCount > 0) {
      console.log('\n📋 Sample submissions:');
      const samples = await Submission.find()
        .populate('userId', 'name email')
        .populate('questionId', 'title difficulty')
        .limit(3);
      
      samples.forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.questionId?.title || 'Unknown'} (${sub.difficulty}) by ${sub.userId?.name || 'Unknown'}`);
        console.log(`      Status: ${sub.status}, Language: ${sub.language}, Date: ${sub.createdAt.toLocaleDateString()}`);
      });
    }

    console.log('\n🎯 To test submissions:');
    console.log('1. Start frontend and login');
    console.log('2. Go to coding problems');
    console.log('3. Solve a problem (all test cases must pass)');
    console.log('4. Click Submit button');
    console.log('5. Check that problem shows "Submitted ✓"');
    console.log('6. Run this script again to see the submission in database');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSubmissionsCollection();