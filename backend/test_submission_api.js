const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:4000/api';
const MONGO_URI = 'mongodb://127.0.0.1:27017/placeoprep';

async function testSubmissionAPI() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Get or create test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        gender: 'Prefer not to say'
      });
    }

    // Create JWT token for authentication
    const token = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1h' }
    );

    console.log('✅ Created auth token for user:', testUser.name);

    // Test submission API
    const submissionData = {
      questionId: 'test-question-123',
      code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      language: 'python',
      testResults: {
        passed: true,
        testCases: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', expected: '[0,1]', passed: true },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]', expected: '[1,2]', passed: true }
        ],
        runtime: '52 ms'
      }
    };

    console.log('🚀 Testing submission API...');
    
    const response = await axios.post(`${BASE_URL}/submissions/submit`, submissionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Submission API Response:', response.data);

    // Verify submission was saved
    const Submission = require('./models/Submission');
    const submissions = await Submission.find({ userId: testUser._id });
    console.log(`📊 Total submissions for user: ${submissions.length}`);

    if (submissions.length > 0) {
      console.log('📋 Latest submission:');
      const latest = submissions[submissions.length - 1];
      console.log(`   Question ID: ${latest.questionId}`);
      console.log(`   Language: ${latest.language}`);
      console.log(`   Difficulty: ${latest.difficulty}`);
      console.log(`   Status: ${latest.status}`);
      console.log(`   Created: ${latest.createdAt}`);
    }

    console.log('\n✅ Submission API is working correctly!');
    console.log('🎯 The issue might be:');
    console.log('1. User not logged in on frontend');
    console.log('2. Authentication token not being sent');
    console.log('3. Question ID format mismatch');
    console.log('4. Test cases not passing on frontend');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing submission API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testSubmissionAPI();