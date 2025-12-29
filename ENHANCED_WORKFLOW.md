# Enhanced CalHacks Workflow: User Prompts + Letta RAG + HuggingFace + Strategy Tracking

## 🎯 Workflow Overview

```
User Input Prompt
       ↓
   Letta RAG Agent (Retrieves relevant strategies)
       ↓
   Strategy Optimizer (Applies successful patterns)
       ↓
   HuggingFace Model (Generates canary token)
       ↓
   Success Detection (Checks for canary)
       ↓
   Strategy Learning (Updates success patterns)
       ↓
   Results & Analytics (Stored in Supabase)
```

## 🔧 Components

### 1. **Strategy Tracker** (Supabase)
- Stores successful prompt patterns
- Tracks success rates by strategy type
- Maintains user-specific strategy preferences
- Provides analytics and insights

### 2. **Letta RAG Agent**
- Retrieves relevant strategies from knowledge base
- Contextualizes user prompts with historical data
- Provides strategy recommendations

### 3. **HuggingFace Integration**
- Supports custom models from HuggingFace Hub
- Handles different model types (text generation, classification)
- Manages API keys and rate limiting

### 4. **Prompt Optimizer**
- Applies successful strategies to user prompts
- Combines multiple strategies intelligently
- Learns from feedback and success patterns

### 5. **Canary Detection System**
- Detects canary tokens in model outputs
- Supports multiple canary formats
- Provides confidence scores

## 📊 Data Flow

1. **User submits prompt** → Frontend
2. **Retrieve strategies** → Letta RAG queries strategy database
3. **Optimize prompt** → Apply successful patterns
4. **Generate response** → HuggingFace model processes optimized prompt
5. **Detect canary** → Check output for success indicators
6. **Update strategies** → Learn from success/failure
7. **Return results** → User sees response + strategy info

## 🎨 User Experience

- **Input**: User types their prompt
- **Processing**: System shows "Applying strategies..." 
- **Output**: Generated response with canary token
- **Insights**: Shows which strategies were used and their success rates
- **Learning**: System gets smarter over time

## 🔄 Strategy Learning

- **Success Tracking**: Records which strategies work for which prompt types
- **Pattern Recognition**: Identifies common successful combinations
- **Adaptive Optimization**: Adjusts strategy selection based on user patterns
- **A/B Testing**: Tries different approaches and learns from results















