#!/usr/bin/env node

// Dynamic startup script for CalHacks project with synchronized ports
const { spawn } = require('child_process');
const path = require('path');
const sharedPortConfig = require('./shared-config/portConfig');

console.log('🚀 Starting CalHacks Project with Synchronized Ports...\n');

// Clean up any old port configuration
sharedPortConfig.cleanup();

// Start server first
console.log('📡 Starting server...');
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe'
});

// Wait a moment for server to start and configure port
setTimeout(() => {
  console.log('💻 Starting client...');
  const clientProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'pipe'
  });
  
  // Handle client output
  clientProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:')) {
      console.log(`✅ Client: ${output.trim()}`);
    } else if (output.includes('API detected at')) {
      console.log(`🔗 Client: ${output.trim()}`);
    } else {
      console.log(`💻 Client: ${output.trim()}`);
    }
  });

  clientProcess.stderr.on('data', (data) => {
    console.error(`❌ Client Error: ${data.toString()}`);
  });

  clientProcess.on('exit', (code) => {
    console.log(`💻 Client exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });
}, 2000); // Wait 2 seconds for server to start

// Handle server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running on')) {
    console.log(`✅ Server: ${output.trim()}`);
  } else if (output.includes('API Base URL')) {
    console.log(`🔗 Server: ${output.trim()}`);
  } else {
    console.log(`📡 Server: ${output.trim()}`);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(`❌ Server Error: ${data.toString()}`);
});

// Handle process exits
serverProcess.on('exit', (code) => {
  console.log(`📡 Server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  serverProcess.kill();
  process.exit(0);
});

console.log('🎉 Both server and client are starting with dynamic port detection!');
console.log('📊 Watch the console for port information...\n');
