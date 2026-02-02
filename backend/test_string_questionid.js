const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/placeoprep';

async function testStringQuestionId() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Get test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    // Create submission with string questionId (like from JSON)
    const submissionData = {
      userId: testUser._id,
      questionId: 'two-sum', // String ID like from JSON
      code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      language: 'python',
      difficulty: 'easy',
      runtime: '45 ms',
      memory: '13.8 MB',
      status: 'accepted',
      testCasesPassed: 3,
      totalTestCases: 3
    };

    console.log('✅ Creating submission with string questionId...');
    const submission = await Submission.create(submissionData);
    console.log('✅ Submission created:', submission._id);

    // Verify all submissions
    const allSubmissions = await Submission.find({ userId: testUser._id });
    console.log(`📊 Total submissions: ${allSubmissions.length}`);

    allSubmissions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Question ID: ${sub.questionId} (${typeof sub.questionId})`);
      console.log(`      Language: ${sub.language}, Status: ${sub.status}`);
    });

    console.log('\n✅ String questionId test successful!');
    console.log('🎯 Now the frontend should be able to submit with string question IDs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testStringQuestionId();