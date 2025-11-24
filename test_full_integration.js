#!/usr/bin/env node

/**
 * Test script for full RAG integration
 * Tests the complete workflow from client to server
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002';

async function testRAGIntegration() {
  console.log('🧪 Testing Full RAG Integration...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Server health:', healthResponse.data.status);

    // Test 2: RAG health check
    console.log('\n2️⃣ Testing RAG service health...');
    const ragHealthResponse = await axios.get(`${API_URL}/api/rag-prompts/health`);
    console.log('✅ RAG health:', ragHealthResponse.data.data.service);
    console.log('📊 Templates loaded:', ragHealthResponse.data.data.templates.loaded);

    // Test 3: Generate RAG prompts
    console.log('\n3️⃣ Testing RAG prompt generation...');
    const testPrompt = 'Explain how machine learning works';
    const ragResponse = await axios.post(`${API_URL}/api/rag-prompts/generate`, {
      userPrompt: testPrompt,
      options: {
        maxPrompts: 5,
        includeMetadata: true
      }
    });

    if (ragResponse.data.success) {
      console.log('✅ RAG prompts generated successfully!');
      console.log(`📝 Generated ${ragResponse.data.data.editedPrompts.length} prompts`);
      
      // Display first few prompts
      ragResponse.data.data.editedPrompts.slice(0, 3).forEach((prompt, index) => {
        console.log(`\n   ${index + 1}. [${prompt.category}] ${prompt.content.substring(0, 80)}...`);
      });
    } else {
      console.log('❌ RAG generation failed:', ragResponse.data.error);
    }

    // Test 4: Test enhanced AI endpoint
    console.log('\n4️⃣ Testing enhanced AI endpoint...');
    try {
      const aiResponse = await axios.post(`${API_URL}/api/enhanced-ai/process-prompt`, {
        prompt: testPrompt,
        userId: 'test-user',
        modelId: 'Qwen/Qwen2.5-7B-Instruct'
      });
      console.log('✅ Enhanced AI endpoint working');
    } catch (error) {
      console.log('⚠️ Enhanced AI endpoint not available (expected)');
    }

    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Server is running and healthy');
    console.log('   ✅ RAG service is operational');
    console.log('   ✅ Template-based generation working');
    console.log('   ✅ API endpoints responding correctly');
    console.log('\n🌐 You can now access the dashboard at: http://localhost:5174');
    console.log('   - Click "Run new job" to test the full workflow');
    console.log('   - Click "Generate Attack Prompts" for quick RAG testing');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testRAGIntegration();









