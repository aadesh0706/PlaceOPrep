const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/placeoprep';

async function testSubmissionFlow() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to placeoprep database');

    // Create a test user if none exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        gender: 'Prefer not to say'
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Using existing test user');
    }

    // Create a test submission
    const testSubmission = {
      userId: testUser._id,
      questionId: new mongoose.Types.ObjectId(), // Mock question ID
      code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      language: 'python',
      difficulty: 'easy',
      runtime: '52 ms',
      memory: '14.2 MB',
      status: 'accepted',
      testCasesPassed: 3,
      totalTestCases: 3
    };

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({ 
      userId: testUser._id,
      code: testSubmission.code 
    });

    if (!existingSubmission) {
      const submission = await Submission.create(testSubmission);
      console.log('✅ Created test submission:', submission._id);
    } else {
      console.log('✅ Test submission already exists');
    }

    // Verify collection was created
    const collections = await mongoose.connection.db.listCollections().toArray();
    const submissionCollection = collections.find(col => col.name === 'submissions');
    
    if (submissionCollection) {
      console.log('✅ Submissions collection created successfully in placeoprep database');
    }

    // Count submissions
    const submissionCount = await Submission.countDocuments();
    console.log(`📊 Total submissions in database: ${submissionCount}`);

    // Show submission stats by difficulty
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('📈 Submission statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.accepted}/${stat.count} accepted`);
    });

    console.log('\n🎯 Submission system is ready!');
    console.log('📁 Database: placeoprep');
    console.log('📋 Collection: submissions');
    console.log('🔗 API Endpoint: POST /api/submissions/submit');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start frontend application');
    console.log('2. Login with a user account');
    console.log('3. Navigate to coding problems');
    console.log('4. Solve a problem (all test cases must pass)');
    console.log('5. Click Submit - it will save to placeoprep.submissions');
    console.log('6. Problem will show "Submitted ✓" in green');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testSubmissionFlow();