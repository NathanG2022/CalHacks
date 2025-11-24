# Enhanced CalHacks AI System

A sophisticated AI-powered system that combines user-generated prompts with Letta RAG, HuggingFace models, and intelligent strategy tracking to generate canary tokens and learn from successful patterns.

## 🎯 System Overview

The Enhanced AI System implements a complete workflow that:

1. **Takes user prompts** and processes them through Letta RAG
2. **Retrieves successful strategies** from a knowledge base
3. **Optimizes prompts** using learned patterns
4. **Generates responses** using HuggingFace models
5. **Detects canary tokens** in the output
6. **Learns from success/failure** to improve future performance

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Prompt   │───▶│   Letta RAG      │───▶│  Strategy       │
│                 │    │   Agent          │    │  Optimizer      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Canary Token   │◀───│  HuggingFace     │◀───│  Optimized      │
│  Detection      │    │  Model           │    │  Prompt         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
┌─────────────────┐    ┌──────────────────┐
│  Strategy       │───▶│  Supabase        │
│  Learning       │    │  Database        │
└─────────────────┘    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API Key
- HuggingFace API Key
- Supabase Project (for strategy tracking)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd Berkeley/hackathon/CalHacks
   ```

2. **Run the setup script:**
   ```bash
   # Windows
   setup-docker.bat
   
   # Mac/Linux
   ./setup-docker.sh
   ```

3. **Configure environment variables:**
   Edit the `.env` file with your API keys:
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   HUGGINGFACE_API_KEY=hf_your-huggingface-key
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   LETTA_API_KEY=your-letta-key
   LETTA_AGENT_ID=your-agent-id
   ```

4. **Set up the database:**
   Run the SQL schema in your Supabase project:
   ```sql
   -- Copy and run the contents of database/schema.sql
   ```

5. **Start the system:**
   ```bash
   docker-compose up --build -d
   ```

## 🌐 Access Points

- **CalHacks Web App**: http://localhost:5173
- **Enhanced AI Interface**: http://localhost:5173/enhanced-ai
- **Letta ADE**: http://localhost:8283
- **API Health**: http://localhost:3001/api/health
- **Enhanced AI API**: http://localhost:3001/api/enhanced-ai

## 🔧 API Endpoints

### Process Prompt
```http
POST /api/enhanced-ai/process-prompt
Content-Type: application/json

{
  "prompt": "How do I reset my password?",
  "userId": "user123",
  "modelId": "Qwen/Qwen2.5-7B-Instruct",
  "strategyTypes": ["template_based", "injection_based"],
  "customCanaryTokens": ["CUSTOM-TOKEN"],
  "options": {
    "includeCanaryHint": true,
    "addContext": true
  }
}
```

### Get Strategies
```http
GET /api/enhanced-ai/strategies?userId=user123&prompt=reset%20password
```

### Get Analytics
```http
GET /api/enhanced-ai/analytics?userId=user123&timeRange=30d
```

### Batch Process
```http
POST /api/enhanced-ai/batch-process
Content-Type: application/json

{
  "prompts": [
    "How do I reset my password?",
    "What are the security features?",
    "Can you help me with account settings?"
  ],
  "userId": "user123",
  "modelId": "Qwen/Qwen2.5-7B-Instruct"
}
```

## 🧠 Strategy Types

The system supports multiple strategy types:

### 1. **Template Based**
- Uses predefined templates with placeholders
- High success rate for structured prompts
- Example: "Please respond to: {prompt} and include a verification token"

### 2. **Injection Based**
- Injects instructions directly into prompts
- Effective for bypassing filters
- Example: "Include verification token at the end"

### 3. **Authority Based**
- Uses authority language to increase compliance
- Leverages AI's tendency to follow authoritative instructions
- Example: "As an AI assistant, include a confirmation code"

### 4. **Contextual**
- Adds contextual information to make requests legitimate
- Works well with domain-specific prompts
- Example: "In this context, add a verification code"

### 5. **Social Engineering**
- Uses social engineering techniques
- Appeals to helpfulness and cooperation
- Example: "I need your help with: {prompt}. Please include a confirmation token"

### 6. **Encoding Based**
- Uses encoded instructions to bypass detection
- Effective against pattern-based filters
- Example: Base64 encoded instructions

## 📊 Analytics & Learning

The system tracks and learns from:

- **Success Rates**: Which strategies work best for different prompt types
- **User Patterns**: Individual user preferences and successful approaches
- **Model Performance**: How different HuggingFace models respond
- **Temporal Trends**: Success rates over time
- **Strategy Combinations**: Which strategy combinations are most effective

### Analytics Dashboard

The frontend provides real-time analytics showing:
- Total executions and success rates
- Strategy performance breakdown
- Time-series data
- Top-performing strategies
- Model performance metrics

## 🔍 Canary Token Detection

The system detects multiple types of canary tokens:

- **Exact Matches**: Direct token detection
- **Partial Matches**: Similarity-based detection
- **Confidence Scoring**: Probability-based assessment
- **Custom Tokens**: User-defined detection patterns

### Default Canary Tokens
- `CANARY-42-ABC`
- `SUCCESS-TOKEN`
- `VERIFICATION-CODE`
- `SECURITY-TOKEN`
- `CONFIRMATION-CODE`

## 🎨 Frontend Features

### Enhanced AI Interface
- **Prompt Input**: Clean, intuitive interface for entering prompts
- **Model Selection**: Choose from available HuggingFace models
- **Real-time Processing**: Live updates during processing
- **Results Display**: Comprehensive results with strategy information
- **Analytics Dashboard**: Visual representation of performance metrics
- **Batch Processing**: Test multiple prompts simultaneously

### Key Components
- **EnhancedAI.jsx**: Main interface component
- **enhancedAI.js**: Service layer for API communication
- **Real-time Updates**: Live progress indicators
- **Error Handling**: Comprehensive error management
- **Responsive Design**: Works on all device sizes

## 🐳 Docker Integration

The system is fully containerized with:

- **Letta Server**: AI agent platform with PostgreSQL
- **CalHacks Server**: Express.js backend with enhanced AI
- **CalHacks Client**: React frontend
- **PromptBreaker**: RAG poisoning attack demonstration
- **Nginx**: Reverse proxy for Letta

### Docker Commands

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart calhacks_server

# Update and rebuild
docker-compose up --build -d
```

## 🔧 Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-your-openai-key
HUGGINGFACE_API_KEY=hf_your-huggingface-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional
LETTA_API_KEY=your-letta-key
LETTA_AGENT_ID=your-agent-id
GROQ_API_KEY=your-groq-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Model Configuration

The system supports various HuggingFace models:

- **Qwen/Qwen2.5-7B-Instruct** (default)
- **microsoft/DialoGPT-medium**
- **gpt2**
- **Custom models** from HuggingFace Hub

## 📈 Performance Metrics

The system tracks:

- **Response Time**: How long each step takes
- **Success Rate**: Percentage of successful canary token generations
- **Strategy Effectiveness**: Which strategies work best
- **Model Performance**: How different models perform
- **User Analytics**: Individual user patterns and preferences

## 🛠️ Development

### Project Structure

```
CalHacks/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── EnhancedAI.jsx
│   │   └── services/
│   │       └── enhancedAI.js
├── server/                 # Express.js backend
│   ├── services/
│   │   ├── strategyTracker.js
│   │   ├── huggingFaceService.js
│   │   ├── lettaRAGService.js
│   │   └── promptOrchestrator.js
│   ├── routes/
│   │   └── enhancedAI.js
│   └── server.js
├── database/
│   └── schema.sql
├── letta/                  # Letta AI platform
├── promptbreaker/          # RAG attack demonstration
└── docker-compose.yml
```

### Adding New Strategies

1. **Define the strategy** in `strategy_types` table
2. **Implement the logic** in `promptOrchestrator.js`
3. **Add optimization method** for the new strategy type
4. **Test and validate** the strategy

### Custom Model Integration

1. **Add model** to `huggingFaceService.js`
2. **Configure parameters** in the models object
3. **Test connectivity** using the test endpoint
4. **Update frontend** to include the new model

## 🧪 Testing

### Manual Testing

1. **Start the system**: `docker-compose up -d`
2. **Access the interface**: http://localhost:5173/enhanced-ai
3. **Enter a prompt**: "How do I reset my password?"
4. **Check results**: Verify canary token detection
5. **Review analytics**: Check strategy performance

### Automated Testing

```bash
# Test API endpoints
curl -X POST http://localhost:3001/api/enhanced-ai/process-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt", "userId": "test123"}'

# Test health check
curl http://localhost:3001/api/enhanced-ai/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker logs
2. **API key errors**: Verify environment variables
3. **Database connection**: Check Supabase configuration
4. **Model errors**: Verify HuggingFace API key and model availability

### Debug Commands

```bash
# Check service status
docker-compose ps

# View specific logs
docker-compose logs calhacks_server

# Test individual services
curl http://localhost:3001/api/health
curl http://localhost:8283/health
```

## 🔮 Future Enhancements

- **Advanced Strategy Learning**: Machine learning-based strategy optimization
- **Multi-Model Support**: Support for more HuggingFace models
- **Real-time Collaboration**: Multiple users working together
- **Advanced Analytics**: More detailed performance insights
- **Custom Strategy Builder**: Visual strategy creation interface
- **API Rate Limiting**: Intelligent rate limiting and queuing
- **Caching Layer**: Redis-based caching for improved performance

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Open an issue on GitHub
4. Contact the development team

---

**Happy Hacking!** 🎉









