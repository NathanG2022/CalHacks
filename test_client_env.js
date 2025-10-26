// Test to check what API URL the client would use
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

console.log('🎯 Client API URL Test');
console.log('=' .repeat(40));
console.log('VITE_API_URL env var:', process.env.VITE_API_URL);
console.log('Resolved API_URL:', API_URL);
console.log('Expected API_URL: http://localhost:3002');
console.log('Match:', API_URL === 'http://localhost:3002' ? '✅ YES' : '❌ NO');

if (API_URL !== 'http://localhost:3002') {
  console.log('\n❌ ISSUE FOUND: Client is using wrong API URL!');
  console.log('   This explains why RAG prompts are not being processed.');
  console.log('   The client is calling the wrong server port.');
} else {
  console.log('\n✅ API URL is correct, issue must be elsewhere.');
}
