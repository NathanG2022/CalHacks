#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for CalHacks App...\n');

// Check if .env.local exists
const clientEnvPath = path.join(__dirname, 'client', '.env.local');
const clientEnvExamplePath = path.join(__dirname, 'client', 'env.example');

if (fs.existsSync(clientEnvPath)) {
  console.log('✅ client/.env.local already exists');
} else {
  console.log('📝 Creating client/.env.local from template...');
  
  if (fs.existsSync(clientEnvExamplePath)) {
    const envContent = fs.readFileSync(clientEnvExamplePath, 'utf8');
    fs.writeFileSync(clientEnvPath, envContent);
    console.log('✅ Created client/.env.local file');
  } else {
    // Create basic .env.local
    const basicEnv = `# Supabase Configuration
# Replace with your actual Supabase project credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:3001
`;
    fs.writeFileSync(clientEnvPath, basicEnv);
    console.log('✅ Created basic client/.env.local file');
  }
}

// Check if server .env exists
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', 'env.example');

if (fs.existsSync(serverEnvPath)) {
  console.log('✅ server/.env already exists');
} else {
  console.log('📝 Creating server/.env from template...');
  
  if (fs.existsSync(serverEnvExamplePath)) {
    const envContent = fs.readFileSync(serverEnvExamplePath, 'utf8');
    fs.writeFileSync(serverEnvPath, envContent);
    console.log('✅ Created server/.env file');
  } else {
    // Create basic .env
    const basicEnv = `PORT=3001
`;
    fs.writeFileSync(serverEnvPath, basicEnv);
    console.log('✅ Created basic server/.env file');
  }
}

console.log('\n📋 Next steps:');
console.log('1. Edit client/.env.local with your Supabase credentials');
console.log('2. Get your Supabase URL and anon key from https://supabase.com');
console.log('3. Restart the development server');
console.log('\n🚀 Run: npm run dev');


