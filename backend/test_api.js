const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing quantitative questions...');
    const response = await axios.get('http://localhost:4000/api/questions?category=quantitative&limit=3');
    console.log(`Found ${response.data.questions.length} quantitative questions`);

    console.log('Testing logical questions...');
    const response2 = await axios.get('http://localhost:4000/api/questions?category=logical&limit=3');
    console.log(`Found ${response2.data.questions.length} logical questions`);

    console.log('Testing verbal questions...');
    const response3 = await axios.get('http://localhost:4000/api/questions?category=verbal&limit=3');
    console.log(`Found ${response3.data.questions.length} verbal questions`);

    console.log('Testing spatial questions...');
    const response4 = await axios.get('http://localhost:4000/api/questions?category=spatial&limit=3');
    console.log(`Found ${response4.data.questions.length} spatial questions`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();