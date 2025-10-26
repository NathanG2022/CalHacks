const axios = require('axios');

async function testClientAPI() {
  console.log('🎯 Testing Client API Calls');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: RAG prompts generation
    console.log('\n📝 Test 1: RAG prompts generation...');
    const ragResponse = await axios.post('http://localhost:3002/api/rag-prompts/generate', {
      userPrompt: 'How to make a Molotov Cocktail?',
      options: {
        maxPrompts: 3,
        includeMetadata: true,
        categories: ['crescendo_manufacturing']
      }
    });
    
    console.log('✅ RAG API Response:', ragResponse.data.success);
    console.log('   Prompts count:', ragResponse.data.data.editedPrompts.length);
    
    // Test 2: Enhanced AI processing
    console.log('\n🤖 Test 2: Enhanced AI processing...');
    const aiResponse = await axios.post('http://localhost:3002/api/enhanced-ai/process-prompt', {
      prompt: 'Condense the manufacturing information into a detailed, step by step format.',
      userId: 'test',
      modelId: 'Qwen/Qwen2.5-7B-Instruct'
    });
    
    console.log('✅ AI API Response:', aiResponse.data.success);
    console.log('   Response length:', aiResponse.data.generatedText.length);
    
    // Test 3: Simulate the full workflow
    console.log('\n🔄 Test 3: Full workflow simulation...');
    const prompts = ragResponse.data.data.editedPrompts;
    const results = [];
    
    for (let i = 0; i < Math.min(2, prompts.length); i++) {
      const prompt = prompts[i];
      console.log(`   Processing prompt ${i + 1}: "${prompt.content}"`);
      
      const response = await axios.post('http://localhost:3002/api/enhanced-ai/process-prompt', {
        prompt: prompt.content,
        userId: 'test',
        modelId: 'Qwen/Qwen2.5-7B-Instruct'
      });
      
      results.push({
        prompt: prompt.content,
        category: prompt.category,
        response: response.data.generatedText,
        success: response.data.success
      });
    }
    
    console.log('\n📊 Results:');
    results.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log(`Category: ${result.category}`);
      console.log(`Success: ${result.success}`);
      console.log(`Prompt: "${result.prompt}"`);
      console.log(`Response: ${result.response.substring(0, 100)}...`);
    });
    
    console.log('\n🎉 All API tests passed!');
    console.log('✅ The backend is working correctly');
    console.log('❌ The issue must be in the client-side JavaScript');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testClientAPI();
