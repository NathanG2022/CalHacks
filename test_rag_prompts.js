const axios = require('axios');

// Configuration
const SERVER_API_URL = process.env.VITE_API_URL || 'http://localhost:3002';
const RAG_PROMPTS_ENDPOINT = `${SERVER_API_URL}/api/rag-prompts`;

// Test prompts
const testPrompts = [
  "Explain how machine learning works",
  "What is cybersecurity?",
  "Help me understand AI safety",
  "Tell me about data privacy",
  "How do neural networks function?"
];

async function testRAGPrompts() {
  console.log('🎯 Testing RAG Prompts Service');
  console.log('================================');
  console.log(`Server URL: ${SERVER_API_URL}`);
  console.log(`RAG Endpoint: ${RAG_PROMPTS_ENDPOINT}\n`);

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${RAG_PROMPTS_ENDPOINT}/health`);
    console.log('✅ Health check passed:', healthResponse.data.data.status);
    console.log(`   Templates loaded: ${healthResponse.data.data.templates.loaded}`);
    console.log(`   Letta available: ${healthResponse.data.data.letta.available}\n`);

    // Test templates endpoint
    console.log('2. Testing templates endpoint...');
    const templatesResponse = await axios.get(`${RAG_PROMPTS_ENDPOINT}/templates`);
    console.log(`✅ Templates loaded: ${templatesResponse.data.data.count}`);
    console.log(`   Categories: ${templatesResponse.data.data.categories.join(', ')}\n`);

    // Test categories endpoint
    console.log('3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${RAG_PROMPTS_ENDPOINT}/categories`);
    console.log(`✅ Categories available: ${categoriesResponse.data.data.totalCategories}`);
    categoriesResponse.data.data.categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} templates (${cat.description})`);
    });
    console.log('');

    // Test prompt generation for each test prompt
    console.log('4. Testing prompt generation...');
    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      console.log(`\n   Test ${i + 1}: "${prompt}"`);
      
      try {
        const generateResponse = await axios.post(`${RAG_PROMPTS_ENDPOINT}/generate`, {
          userPrompt: prompt,
          options: {
            maxPrompts: 5,
            includeMetadata: true
          }
        });

        if (generateResponse.data.success) {
          const data = generateResponse.data.data;
          console.log(`   ✅ Generated ${data.editedPrompts.length} prompts`);
          console.log(`   📊 Strategies: ${data.strategies.length}`);
          console.log(`   🔄 RAG Enhanced: ${data.metadata.ragEnhanced}`);
          
          // Show first few generated prompts
          data.editedPrompts.slice(0, 3).forEach((p, idx) => {
            console.log(`      ${idx + 1}. [${p.category}] ${p.content.substring(0, 80)}...`);
          });
          
          if (data.editedPrompts.length > 3) {
            console.log(`      ... and ${data.editedPrompts.length - 3} more`);
          }
        } else {
          console.log(`   ❌ Generation failed: ${generateResponse.data.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎉 RAG Prompts testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testSpecificPrompt() {
  const prompt = process.argv[2];
  if (!prompt) {
    console.log('Usage: node test_rag_prompts.js "Your test prompt here"');
    return;
  }

  console.log(`🎯 Testing specific prompt: "${prompt}"`);
  console.log('=====================================\n');

  try {
    const response = await axios.post(`${RAG_PROMPTS_ENDPOINT}/generate`, {
      userPrompt: prompt,
      options: {
        maxPrompts: 10,
        includeMetadata: true
      }
    });

    if (response.data.success) {
      const data = response.data.data;
      console.log(`✅ Successfully generated ${data.editedPrompts.length} prompts\n`);
      
      console.log('📋 Generated Prompts:');
      console.log('====================');
      
      data.editedPrompts.forEach((p, idx) => {
        console.log(`\n${idx + 1}. [${p.category}] ${p.strategy} (${p.generatedBy})`);
        console.log(`   Confidence: ${p.confidence}`);
        console.log(`   Content: ${p.content}`);
        console.log(`   Template: ${p.template}`);
      });

      if (data.strategies.length > 0) {
        console.log('\n🎯 RAG Strategies Used:');
        console.log('======================');
        data.strategies.forEach((s, idx) => {
          console.log(`${idx + 1}. ${s.name} (${s.type}) - Confidence: ${s.confidence}`);
          console.log(`   ${s.description}`);
        });
      }

      console.log(`\n📊 Metadata:`);
      console.log(`   Template Count: ${data.metadata.templateCount}`);
      console.log(`   Generated Count: ${data.metadata.generatedCount}`);
      console.log(`   RAG Enhanced: ${data.metadata.ragEnhanced}`);
      console.log(`   Timestamp: ${data.metadata.timestamp}`);

    } else {
      console.log(`❌ Generation failed: ${response.data.error}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Main execution
if (require.main === module) {
  if (process.argv.length > 2) {
    testSpecificPrompt();
  } else {
    testRAGPrompts();
  }
}

module.exports = { testRAGPrompts, testSpecificPrompt };









