# Fixes Applied to PromptBreaker

## Summary of Issues Fixed

### 1. ✅ Letta API Endpoint Updates
**Problem:** All API endpoints were using `/api/` prefix, but Letta now uses `/v1/` prefix.

**Fixed:**
- Updated all endpoints from `/api/` to `/v1/`
- Sources: `/v1/sources/`
- Agents: `/v1/agents/`
- Messages: `/v1/agents/{agent_id}/messages`
- Source attachment: `/v1/agents/{agent_id}/sources/attach/{source_id}`

**Files Modified:**
- `target_letta/upload_docs.py`
- `target_letta/create_agent.py`
- `target_letta/run_query.py`

### 2. ✅ Embedding Configuration
**Problem:** Missing required fields in `embedding_config` causing 422 errors.

**Fixed:**
- Added `embedding_endpoint_type: "openai"`
- Added `embedding_dim: 1536`
- Updated in both source creation and agent creation

**Files Modified:**
- `target_letta/upload_docs.py`
- `target_letta/create_agent.py`

### 3. ✅ Source Attachment Method
**Problem:** Using POST method, but Letta requires PATCH.

**Fixed:**
- Changed from `requests.post()` to `requests.patch()`

**Files Modified:**
- `target_letta/create_agent.py`

### 4. ✅ Message Format
**Problem:** Message content format was incorrect.

**Fixed:**
- Updated to use content array format: `[{"type": "text", "text": message}]`
- Added proper parsing for response content (handles both string and array formats)

**Files Modified:**
- `target_letta/run_query.py`

### 5. ✅ Template Placeholder
**Problem:** Templates use `{related_topic}` placeholder but composer didn't fill it.

**Fixed:**
- Added `related_topic` variable generation
- Added error handling for unsupported placeholders

**Files Modified:**
- `attacker/composer.py`

### 6. ✅ API Key Validation & Error Handling
**Problem:** No validation for API keys, unclear error messages when API key is invalid.

**Fixed:**
- Created `check_env.py` script to validate environment configuration
- Added API key validation in orchestrator
- Improved error messages to guide users
- Added early exit if API key is invalid
- Better error detection in query runner

**Files Created:**
- `check_env.py`

**Files Modified:**
- `orchestrator.py`
- `target_letta/run_query.py`
- `docker-compose.yml` (added env check)

### 7. ✅ Docker Compose Optimization
**Problem:** Obsolete version field, inefficient wait logic.

**Fixed:**
- Removed obsolete `version: '3.8'` field
- Improved health checks
- Better wait logic for Letta readiness
- Added `PYTHONUNBUFFERED=1` for better logging
- Added environment check before running demo

**Files Modified:**
- `docker-compose.yml`

### 8. ✅ Documentation Updates
**Problem:** Tutorial didn't emphasize need for real API key.

**Fixed:**
- Updated `DOCKER_TUTORIAL.md` with clear API key instructions
- Added troubleshooting section for API key errors
- Added validation step instructions

**Files Modified:**
- `DOCKER_TUTORIAL.md`

## Current Status

### ✅ Working:
- Source creation and upload
- Agent creation
- Source attachment to agents
- Environment validation
- Error detection and reporting

### ⚠️ Requires User Action:
- **API Key:** User must update `.env` file with a valid OpenAI API key
  - Current placeholder: `sk-your-actual-key-here` ❌
  - Needs real key from: https://platform.openai.com/api-keys

## How to Fix Remaining Issue

The 500 errors are caused by an invalid API key. To fix:

1. **Get a real OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Sign in or create account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-proj-` or `sk-`)

2. **Update `.env` file:**
   ```bash
   # Edit .env file
   nano .env  # or use your preferred editor
   
   # Replace the placeholder with your real key:
   OPENAI_API_KEY=sk-proj-your-actual-real-key-here
   ```

3. **Validate configuration:**
   ```bash
   python check_env.py
   ```

4. **Restart containers:**
   ```bash
   docker compose down
   docker compose up --build
   ```

## Testing

After updating the API key, the demo should run successfully:
- Phase 1: Baseline attacks (no poison)
- Phase 2: Poisoned attacks (vulnerable agent)
- Phase 3: Poisoned attacks (hardened agent)
- Phase 4: Mitigation (poison removed)

All results will be saved to `data/attacks.db` and `data/logs/`.

