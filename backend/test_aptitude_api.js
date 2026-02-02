const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testAptitudeAPI() {
  try {
    console.log('🚀 Testing aptitude questions API...');
    
    // Test aptitude questions endpoint
    const response = await axios.get(`${BASE_URL}/questions?category=aptitude`);
    const questions = response.data.questions || [];
    
    console.log(`✅ Found ${questions.length} aptitude questions`);
    
    if (questions.length > 0) {
      console.log('\n📋 Sample questions:');
      questions.slice(0, 3).forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.title} (${q.category}) - ${q.difficulty}`);
        console.log(`      Company: ${q.company?.join(', ')}`);
        console.log(`      Question: ${q.description.substring(0, 60)}...`);
      });
    }
    
    // Test company-specific questions
    const companies = ['tcs', 'infosys', 'wipro'];
    for (const company of companies) {
      const companyResponse = await axios.get(`${BASE_URL}/questions?category=aptitude&company=${company}`);
      const companyQuestions = companyResponse.data.questions || [];
      console.log(`\n🏢 ${company.toUpperCase()}: ${companyQuestions.length} questions`);
    }
    
    console.log('\n✅ Aptitude API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing aptitude API:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAptitudeAPI();