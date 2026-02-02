const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/placeoprep';

async function testDirectSubmission() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Get test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        gender: 'Prefer not to say'
      });
    }

    console.log('✅ Found test user:', testUser.name);

    // Create submission directly
    const submissionData = {
      userId: testUser._id,
      questionId: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      code: `def twoSum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
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
      questionId: submissionData.questionId
    });

    if (existingSubmission) {
      console.log('✅ Submission already exists, updating...');
      await Submission.findByIdAndUpdate(existingSubmission._id, submissionData);
    } else {
      console.log('✅ Creating new submission...');
      await Submission.create(submissionData);
    }

    // Verify submissions
    const allSubmissions = await Submission.find({ userId: testUser._id });
    console.log(`📊 Total submissions for user: ${allSubmissions.length}`);

    allSubmissions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Question: ${sub.questionId}`);
      console.log(`      Language: ${sub.language}, Difficulty: ${sub.difficulty}`);
      console.log(`      Status: ${sub.status}, Created: ${sub.createdAt.toLocaleDateString()}`);
    });

    console.log('\n✅ Direct submission test successful!');
    console.log('📁 Database: placeoprep');
    console.log('📋 Collection: submissions');
    console.log('👤 User submissions are being saved correctly');

    console.log('\n🔍 To see submissions in MongoDB:');
    console.log('1. Open MongoDB Compass or mongo shell');
    console.log('2. Connect to: mongodb://localhost:27017');
    console.log('3. Navigate to: placeoprep > submissions');
    console.log('4. You should see the submission records');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDirectSubmission();