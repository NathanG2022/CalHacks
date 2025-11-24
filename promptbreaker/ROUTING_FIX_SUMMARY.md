# Routing Fix Summary

## ✅ Fixed Issues

1. **Removed duplicate web app** - The existing React/Express web app in the parent `CalHacks` directory should be used instead
2. **Fixed agent configuration**:
   - Model set to `gemini-1.5-pro` (works with Google AI API)
   - Endpoint type explicitly set to `google_ai`
   - Added cleanup step to remove old agents before creating new ones
3. **Environment variables**:
   - Only `GEMINI_API_KEY` is set (removed `GOOGLE_API_KEY` to prevent Vertex routing)
   - Model defaults to `gemini-1.5-pro`

## 🔧 Changes Made

### Files Modified:
- `docker-compose.yml` - Removed web-dashboard service, added cleanup step
- `target_letta/create_agent.py` - Added cleanup command, ensured `google_ai` endpoint type
- `requirements.txt` - Removed Flask (not needed)
- `target_letta/upload_docs.py` - Already configured for Google AI embeddings

### Key Configuration:
```yaml
environment:
  - GEMINI_API_KEY=${GEMINI_API_KEY}  # Only Gemini key, no GOOGLE_API_KEY
  - LETTA_LLM_PROVIDER=google_ai
  - LETTA_LLM_MODEL=gemini-1.5-pro
```

## 🌐 Web App Access

The existing web app is in the parent directory:
- **React Client**: http://localhost:5174
- **Express Server**: http://localhost:3002
- **Letta UI**: http://localhost:8283 (or 8284 in main docker-compose)

## 🚀 Next Steps

1. Run the main docker-compose from parent directory to start the full web app
2. The promptbreaker demo will run and populate the database
3. The existing web app can display the results via API endpoints

## ⚠️ Note

The promptbreaker docker-compose is standalone. To integrate with the main web app, you may need to:
- Add API endpoints in `server/server.js` to read from `promptbreaker/data/attacks.db`
- Add a React component to display the results
- Ensure both docker-compose files can share the data volume

