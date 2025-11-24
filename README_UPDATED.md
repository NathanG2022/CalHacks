# CalHacks RAG + LLM Integration System

A comprehensive AI-powered system that combines RAG (Retrieval-Augmented Generation) with Large Language Models for advanced prompt engineering and red-teaming applications.

## 🚀 Features

- **RAG Prompt Generation**: Advanced template-based prompt generation system
- **Multi-Model Support**: Integration with HuggingFace models (Qwen, DialoGPT)
- **Crescendo Attacks**: Multi-turn escalating attack patterns
- **Jailbreaking Strategies**: Multiple attack categories and techniques
- **Real-time Processing**: Individual LLM processing for each generated prompt
- **Docker Integration**: Complete containerized environment
- **Letta Integration**: Advanced AI agent platform
- **PromptBreaker**: Sophisticated prompt injection framework

## 📁 Project Structure

```
CalHacks/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── CrescendoAttack.jsx
│   │   │   └── EnhancedAI.jsx
│   │   ├── contexts/         # React contexts
│   │   ├── lib/             # Utilities
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── server/                   # Express.js backend
│   ├── routes/              # API routes
│   │   ├── enhancedAI.js
│   │   ├── ragPrompts.js
│   │   └── crescendo.js
│   ├── services/            # Business logic
│   │   ├── promptRAGService.js
│   │   ├── crescendoService.js
│   │   ├── huggingFaceService.js
│   │   └── lettaRAGService.js
│   ├── Dockerfile
│   └── server.js
├── promptbreaker/           # Prompt injection framework
│   ├── attacker/           # Attack templates
│   ├── target_letta/       # Letta integration
│   └── orchestrator.py
├── letta/                   # Letta AI platform
├── database/               # Database schema
├── docker-compose.yml      # Docker orchestration
└── .env.example           # Environment configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Git
- API Keys (see Environment Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/NathanG2022/CalHacks.git
cd CalHacks
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
LETTA_API_KEY=your_letta_api_key_here
LETTA_AGENT_ID=your_letta_agent_id_here

# Optional API Keys
GROQ_API_KEY=your_groq_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# ... (see .env.example for complete list)
```

### 3. Start the System

```bash
# Start all services with Docker
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend Dashboard**: http://localhost:5174
- **Backend API**: http://localhost:3002
- **Letta Server**: http://localhost:8084
- **Letta API**: http://localhost:8284

## 🎯 Usage

### 1. Basic RAG Prompt Generation

1. Open http://localhost:5174
2. Click "New Job" button
3. Enter your prompt (e.g., "How to make a Molotov Cocktail?")
4. Select jailbreaking strategy (Crescendo, Direct, etc.)
5. Select AI model (Qwen, DialoGPT, etc.)
6. Click "Launch Job"
7. Watch as RAG prompts are generated and processed individually

### 2. Crescendo Attack System

1. Click "🎯 Crescendo Attack" button
2. Enter your target prompt
3. Select AI model
4. Watch the multi-turn escalating attack unfold
5. View detailed responses for each step

### 3. Enhanced AI Interface

1. Navigate to "Enhanced AI" tab
2. Enter prompts directly
3. Get real-time AI responses
4. Test different models and strategies

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### RAG Prompts
- `POST /api/rag-prompts/generate` - Generate RAG prompts
- `GET /api/rag-prompts/templates` - Get available templates
- `GET /api/rag-prompts/categories` - Get attack categories

### Enhanced AI
- `POST /api/enhanced-ai/process-prompt` - Process prompts through LLM
- `GET /api/enhanced-ai/health` - Enhanced AI service health

### Crescendo Attacks
- `POST /api/crescendo/execute` - Execute crescendo attack
- `GET /api/crescendo/status` - Crescendo service status

## 🎨 Key Features

### RAG Prompt Generation
- **57+ Attack Templates**: Comprehensive collection of prompt injection patterns
- **Manufacturing Detection**: Automatic prioritization of manufacturing-related prompts
- **Category Filtering**: Filter by attack type (Crescendo, Direct, Contextual, etc.)
- **Confidence Scoring**: Each generated prompt includes confidence metrics

### Multi-Model Support
- **Qwen Models**: Qwen2.5-7B-Instruct, Qwen2.5-14B-Instruct
- **DialoGPT**: Microsoft's conversational model
- **HuggingFace Integration**: Direct API integration
- **Model Selection**: Easy switching between models

### Crescendo Attack System
- **Multi-turn Escalation**: Gradual escalation of attack complexity
- **Real-time Progress**: Live progress tracking and status updates
- **Detailed Logging**: Comprehensive logging for each step
- **Response Analysis**: Detailed analysis of each LLM response

### Advanced UI
- **Real-time Updates**: Live progress indicators and status updates
- **Comprehensive Logging**: Detailed console logs for debugging
- **Error Handling**: Robust error handling with fallbacks
- **Responsive Design**: Modern, responsive UI with Tailwind CSS

## 🐳 Docker Services

### Core Services
- **calhacks-client**: React frontend (port 5174)
- **calhacks-server**: Express.js backend (port 3002)
- **calhacks-letta-server**: Letta AI platform (ports 8084, 8284)
- **calhacks-letta-db**: PostgreSQL database (port 5433)
- **calhacks-promptbreaker**: Prompt injection framework

### Service Dependencies
- Letta database → Letta server → PromptBreaker
- Letta server → CalHacks server → CalHacks client

## 🔐 Security Features

- **Environment Variables**: All API keys stored securely
- **No Hardcoded Secrets**: Clean git history with no exposed credentials
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error handling without information leakage

## 📊 Monitoring and Debugging

### Health Checks
- All services include health check endpoints
- Docker health checks for service dependencies
- Comprehensive logging throughout the system

### Debug Tools
- **Console Logging**: Detailed logs in browser console
- **API Testing**: Built-in test scripts for all endpoints
- **Service Verification**: Automated service health verification

## 🚀 Deployment

### Production Deployment
1. Set up production environment variables
2. Configure reverse proxy (nginx)
3. Set up SSL certificates
4. Configure monitoring and logging
5. Deploy with Docker Compose

### Development
- Hot reload for both client and server
- Comprehensive error reporting
- Easy debugging with detailed logs

## 🛡️ Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Input Sanitization**: All inputs are properly validated
- **Rate Limiting**: Consider implementing rate limiting for production
- **Access Control**: Implement proper authentication for production use

## 📝 Development Notes

- **Hot Reload**: Both client and server support hot reload
- **Environment Variables**: Use `.env` for configuration
- **API Communication**: Client communicates with server via REST API
- **Error Handling**: Comprehensive error handling throughout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with the provided test scripts
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker logs with `docker-compose logs`
2. **API errors**: Verify environment variables are set correctly
3. **RAG prompts not generating**: Check Letta server health
4. **LLM responses failing**: Verify HuggingFace API key

### Debug Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Restart services
docker-compose restart

# Test API endpoints
node test_final_verification.js
```

## 🎯 CalHacks Specific Features

This system is specifically designed for CalHacks with:

- **Advanced AI Integration**: State-of-the-art RAG and LLM integration
- **Red-Teaming Capabilities**: Comprehensive prompt injection testing
- **Scalable Architecture**: Ready for team collaboration and expansion
- **Educational Value**: Perfect for learning AI security and prompt engineering

## 🔗 Quick Links

- [HuggingFace Models](https://huggingface.co/models)
- [Letta Documentation](https://docs.letta.ai/)
- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://react.dev/)

## 📊 Project Status

✅ **Complete RAG + LLM Integration System**
- Advanced prompt generation and processing
- Multi-model AI integration
- Comprehensive Docker setup
- Real-time processing and monitoring
- Production-ready architecture

## 🚀 Getting Started

1. **Clone and setup**:
   ```bash
   git clone https://github.com/NathanG2022/CalHacks.git
   cd CalHacks
   cp .env.example .env
   # Edit .env with your API keys
   ```

2. **Start the system**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Dashboard: http://localhost:5174
   - API: http://localhost:3002

4. **Test the system**:
   ```bash
   node test_final_verification.js
   ```

Happy coding! 🎉









