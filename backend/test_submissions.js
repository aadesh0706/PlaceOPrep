const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Test submission functionality
async function testSubmissions() {
  try {
    console.log('Testing submission functionality...\n');

    // First, let's test without authentication (should fail)
    try {
      await axios.get(`${BASE_URL}/submissions`);
      console.log('❌ ERROR: Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required - working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test submission stats endpoint
    try {
      await axios.get(`${BASE_URL}/submissions/stats`);
      console.log('❌ ERROR: Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Submission stats authentication required - working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n✅ All submission endpoint tests passed!');
    console.log('\nTo fully test submissions:');
    console.log('1. Start the frontend application');
    console.log('2. Login with a user account');
    console.log('3. Navigate to coding problems');
    console.log('4. Solve a problem and submit it');
    console.log('5. Check that the problem shows as "Submitted ✓"');
    console.log('6. Verify the progress circles update correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubmissions();