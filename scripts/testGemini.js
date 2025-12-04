// scripts/testGemini.js
const { getLoanAdvice, testGeminiService, getMockLoanAdvice } = require('../services/GeminiService');

async function runTests() {
  console.log('🚀 Starting GeminiService Tests...\n');
  
  console.log('1. Testing Mock Responses:');
  console.log('='.repeat(50));
  
  const testCases = [
    'Hello',
    'What is my loan eligibility?',
    'How to calculate EMI?',
    'Interest rate for personal loan',
    'Documents needed for home loan',
    'test'
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTest: "${testCase}"`);
    try {
      const response = await getLoanAdvice(testCase);
      console.log(`Response: ${response.substring(0, 100)}...`);
      console.log(`✅ Success`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n2. Testing Service Status:');
  console.log('='.repeat(50));
  
  try {
    const status = await testGeminiService();
    console.log(`Status: ${status.status}`);
    console.log(`Mock Working: ${status.mockWorking}`);
    console.log(`Real Gemini Available: ${status.realGeminiAvailable}`);
    console.log(`Test Response: ${status.testResponse}`);
  } catch (error) {
    console.log(`❌ Status test failed: ${error.message}`);
  }
  
  console.log('\n3. Manual Test Commands:');
  console.log('='.repeat(50));
  console.log('Run these commands in your app:');
  console.log('• "test" - Check if service is working');
  console.log('• "hello" - Greeting test');
  console.log('• "emi calculation" - EMI test');
  console.log('• "loan eligibility" - Eligibility test');
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if script is called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };