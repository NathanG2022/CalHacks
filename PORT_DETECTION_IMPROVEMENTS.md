# CalHacks Port Detection Improvements

## 🎯 **Problem Solved**
The CalHacks application now has robust port detection and conflict resolution, ensuring the client and server always connect properly regardless of port conflicts.

## 🔧 **Improvements Made**

### **1. Dynamic Port Detection System**
- **Server**: Automatically finds available ports (3001, 3000, 8000, 5000, 4000, 3002-3010)
- **Client**: Scans multiple ports to find the running server
- **Synchronization**: Server saves its port configuration for client to discover

### **2. Enhanced Error Handling**
- **Port Conflicts**: Automatic retry with different ports
- **Network Errors**: Client retries with port detection
- **Stale Configurations**: Automatic cleanup of old port configs

### **3. New Files Added**
- `shared-config/portConfig.js` - Shared port configuration system
- `server/utils/portFinder.js` - Dynamic port detection utility
- `start-dynamic.js` - Synchronized startup script

### **4. Updated Files**
- `server/server.js` - Enhanced with dynamic port detection
- `client/src/services/api.js` - Smart port detection and retry logic
- `package.json` - Added `dev:dynamic` script

## 🚀 **Usage**

### **Recommended: Use Dynamic Startup**
```bash
npm run dev:dynamic
```

### **Manual Startup (also works)**
```bash
npm run dev
```

## 📊 **Console Output**

### **Server Output:**
```
🔍 Scanning for available port...
✅ Port 3001 is available
📝 Port config saved: 3001
🚀 CalHacks Server running on http://localhost:3001
📊 Health check: http://localhost:3001/api/health
🔗 API Base URL: http://localhost:3001/api
```

### **Client Output:**
```
🔍 Scanning for server on available ports...
🔍 Checking port 3000...
🔍 Checking port 3001...
📋 Found server on port 3001
🔗 API detected at: http://localhost:3001/api
```

## 🔄 **How It Works**

1. **Server starts** → Finds available port (e.g., 3001)
2. **Server saves** → Port 3001 to shared config
3. **Client starts** → Scans ports to find server
4. **Client connects** → Uses http://localhost:3001/api
5. **Perfect sync** → Both use the same port!

## ⚙️ **Configuration Files**

### **Shared Configuration** (`shared-config/port-config.json`)
```json
{
  "port": 3001,
  "timestamp": 1761433937181,
  "clientPort": null
}
```

## 🐛 **Troubleshooting**

### **If server can't find port:**
- Server will try ports 3001, 3000, 8000, 5000, 4000, 3002-3010
- Check console for "Port X is in use" messages
- Server will automatically find next available port

### **If client can't connect:**
- Client scans all common ports automatically
- Check console for "Found server on port X" messages
- Client will retry with different ports on network errors

### **If you see port conflicts:**
- Use `npm run dev:dynamic` for synchronized startup
- Or start server first, then client separately
- The system handles conflicts automatically

## 🎉 **Benefits**

- ✅ **No more port conflicts** - Automatic port detection
- ✅ **Client always connects** - Smart port scanning
- ✅ **Handles multiple instances** - Each server finds its own port
- ✅ **Automatic cleanup** - Removes stale configurations
- ✅ **Better debugging** - Clear console messages
- ✅ **Robust error handling** - Retry logic and fallbacks

## 📝 **API Endpoints**

### **New Endpoints:**
- `GET /api/port-config` - Returns server port configuration
- `GET /api/health` - Enhanced health check with version info

### **Existing Endpoints (unchanged):**
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

The CalHacks application now has the same robust port detection system as the main hackathon project!
