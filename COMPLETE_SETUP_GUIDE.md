# Complete Setup and Run Guide for Enhanced CalHacks AI System

This guide will help you set up and run the complete Enhanced CalHacks AI system with Docker, Letta, HuggingFace, and Supabase integration.

## 🚨 Issues Fixed

✅ **Missing Dependencies Resolved:**
- Added `openai` package to client
- Added `@huggingface/inference` and `axios` packages to server
- All dependency conflicts resolved

## 📋 Prerequisites

Before starting, ensure you have:

1. **Docker Desktop** installed and running
2. **Node.js 20.17+** (you have v20.17.0 ✅)
3. **Git** installed
4. **API Keys** for the following services:
   - OpenAI API Key
   - HuggingFace API Key
   - Supabase Project (URL + Anon Key)

## 🔑 Required API Keys

You'll need to get these API keys:

### 1. OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key
- Copy the key (starts with `sk-`)

### 2. HuggingFace API Key
- Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
- Create a new token
- Copy the token (starts with `hf_`)

### 3. Supabase Project
- Go to [Supabase](https://supabase.com)
- Create a new project
- Go to Settings → API
- Copy your Project URL and anon key

## 🚀 Step-by-Step Setup

### Step 1: Clone and Navigate to Project
```bash
cd Berkeley/hackathon/CalHacks
```

### Step 2: Create Environment File
Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:
```env
# CalHacks Environment Configuration

# OpenAI API Key (required for Letta and PromptBreaker)
OPENAI_API_KEY=sk-your-openai-api-key-here

# HuggingFace API Key (required for custom models)
HUGGINGFACE_API_KEY=hf_your-huggingface-api-key-here

# Supabase Configuration (for CalHacks web app)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Letta Configuration
LETTA_API_KEY=your-letta-api-key-here
LETTA_AGENT_ID=your-letta-agent-id-here

# Optional: Other LLM providers
# GROQ_API_KEY=your-groq-key
# ANTHROPIC_API_KEY=your-anthropic-key
# GEMINI_API_KEY=your-gemini-key
```

**⚠️ IMPORTANT:** Replace all placeholder values with your actual API keys!

### Step 3: Set Up Supabase Database

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `database/schema.sql`**
4. **Run the SQL script** to create all required tables

### Step 4: Install Dependencies (Already Done ✅)

The dependencies have been installed, but if you need to reinstall:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Go back to root
cd ..
```

### Step 5: Start the System

#### Option A: Using Docker (Recommended)
```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

#### Option B: Manual Start (For Development)
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Terminal 3: Start Letta (if not using Docker)
cd letta
docker-compose up -d
```

### Step 6: Verify Everything is Working

Run the test script:
```bash
./test-enhanced-system.sh
```

Or manually check:
- **CalHacks Web App**: http://localhost:5173
- **Enhanced AI Interface**: http://localhost:5173/enhanced-ai
- **API Health**: http://localhost:3001/api/health
- **Letta ADE**: http://localhost:8284

## 🎯 How to Use the Enhanced AI System

### 1. Access the Interface
- Go to http://localhost:5173/enhanced-ai
- You'll see the Enhanced AI interface

### 2. Process a Prompt
1. **Select a model** from the dropdown (default: Qwen/Qwen2.5-7B-Instruct)
2. **Enter your prompt** in the text area
3. **Click "Process Prompt"**
4. **Watch the system**:
   - Retrieve strategies from Letta RAG
   - Optimize your prompt
   - Generate response with HuggingFace
   - Detect canary tokens
   - Learn from the results

### 3. View Results
The system will show:
- ✅ **Success status** (canary token detected or not)
- 📝 **Generated response** from the HuggingFace model
- 🔧 **Optimized prompt** that was used
- 📊 **Strategies applied** and their confidence scores
- 📈 **Performance metrics** (response time, success rate, etc.)

### 4. Run Batch Tests
- Click **"Run Batch Test"** to test multiple prompts at once
- This helps you see how the system performs across different types of prompts

### 5. View Analytics
- The interface shows your personal analytics
- See which strategies work best for you
- Track your success rates over time

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" errors
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

#### 2. Docker services not starting
```bash
# Check Docker is running
docker --version

# Restart Docker Desktop if needed
# Then try again
docker-compose up --build -d
```

#### 3. API key errors
- Double-check your `.env` file has the correct API keys
- Make sure there are no extra spaces or quotes around the keys
- Verify the keys are valid and have proper permissions

#### 4. Database connection errors
- Ensure your Supabase project is active
- Check that you've run the database schema
- Verify your Supabase URL and anon key are correct

#### 5. Port conflicts
If ports are already in use:
```bash
# Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :8283

# Kill processes if needed, or change ports in docker-compose.yml
```

### Debug Commands

```bash
# Check service status
docker-compose ps

# View specific service logs
docker-compose logs calhacks_server
docker-compose logs calhacks_client
docker-compose logs letta_server

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/enhanced-ai/health

# Check if services are responding
curl http://localhost:5173
curl http://localhost:8283/health
```

## 📊 Understanding the Results

### Success Indicators
- ✅ **Canary Token Detected**: The system successfully generated a canary token
- 📈 **High Confidence**: The detection system is confident in the result
- ⚡ **Fast Response Time**: The system processed quickly
- 🎯 **Strategy Success**: The applied strategies worked well

### What the System Learns
- **Which strategies work** for different types of prompts
- **Your personal patterns** and preferences
- **Model performance** across different HuggingFace models
- **Temporal trends** in success rates

### Strategy Types Explained
- **Template Based**: Uses predefined patterns
- **Injection Based**: Directly injects instructions
- **Authority Based**: Uses authoritative language
- **Contextual**: Adds relevant context
- **Social Engineering**: Appeals to helpfulness
- **Encoding Based**: Uses encoded instructions

## 🚀 Next Steps

Once everything is running:

1. **Experiment with different prompts** to see how the system adapts
2. **Try different models** to see performance variations
3. **Check the analytics** to understand what's working
4. **Run batch tests** to stress-test the system
5. **Explore the Letta ADE** at http://localhost:8283 to see the RAG system

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: `docker-compose logs -f`
2. **Run the test script**: `./test-enhanced-system.sh`
3. **Verify API keys** are correct and valid
4. **Check the troubleshooting section** above
5. **Review the ENHANCED_AI_README.md** for detailed documentation

## 🎉 Success!

You now have a fully functional Enhanced AI system that:
- ✅ Combines user prompts with Letta RAG
- ✅ Uses HuggingFace models for generation
- ✅ Tracks and learns from successful strategies
- ✅ Provides real-time analytics and insights
- ✅ Runs in a containerized, scalable environment

**Happy Hacking!** 🚀
