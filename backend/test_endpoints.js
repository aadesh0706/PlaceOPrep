const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testSubmissionEndpoint() {
  try {
    console.log('🚀 Testing submission endpoint without auth...');
    
    // This should fail with 401 (which means endpoint exists)
    const response = await axios.post(`${BASE_URL}/submissions/submit`, {
      questionId: 'test',
      code: 'test',
      language: 'python',
      testResults: { passed: true }
    });

    console.log('Response:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Endpoint exists and requires authentication (expected)');
      console.log('Response:', error.response.data);
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found - route not registered');
    } else {
      console.log('❌ Unexpected error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
  }

  // Test if server is running
  try {
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Server not responding');
  }

  // Test other endpoints
  try {
    const questionsResponse = await axios.get(`${BASE_URL}/questions?category=technical&type=coding`);
    console.log('✅ Questions endpoint working, found', questionsResponse.data.questions?.length || 0, 'questions');
  } catch (error) {
    console.log('❌ Questions endpoint error:', error.message);
  }
}

testSubmissionEndpoint();