import axios from 'axios';

// Dynamic API URL detection
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Function to detect the correct API port
const detectApiUrl = async () => {
  try {
    // Try common ports in order to find the server
    const portsToTry = [3000, 3001, 8000, 5000, 4000, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
    
    console.log('🔍 Scanning for server on available ports...');
    
    for (const port of portsToTry) {
      try {
        console.log(`🔍 Checking port ${port}...`);
        const response = await fetch(`http://localhost:${port}/api/port-config`, {
          method: 'GET',
          timeout: 2000 // 2 second timeout per port
        });
        
        if (response.ok) {
          const config = await response.json();
          if (config.port) {
            console.log(`📋 Found server on port ${config.port}`);
            return `http://localhost:${config.port}/api`;
          }
        }
      } catch (error) {
        // Continue to next port silently
        continue;
      }
    }
    
    // Try to find any server by testing health endpoint
    console.log('📋 No port config found, testing health endpoints...');
    for (const port of portsToTry) {
      try {
        const response = await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          timeout: 2000
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            console.log(`📋 Found working server on port ${port}`);
            return `http://localhost:${port}/api`;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log('📋 No server found, using default URL...');
    return API_BASE_URL;
  } catch (error) {
    console.warn('⚠️ Could not auto-detect API port, using default:', API_BASE_URL);
    return API_BASE_URL;
  }
};

// Initialize API URL detection
detectApiUrl().then(url => {
  API_BASE_URL = url;
  console.log(`🔗 API detected at: ${API_BASE_URL}`);
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add request interceptor to handle dynamic URL updates and authentication
api.interceptors.request.use(async (config) => {
  // Update base URL if needed
  if (config.baseURL !== API_BASE_URL) {
    config.baseURL = API_BASE_URL;
  }
  
  // Add authentication token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If it's a network error and we haven't retried yet
    if (error.code === 'ERR_NETWORK' && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to detect the correct API URL again
      try {
        const newUrl = await detectApiUrl();
        if (newUrl !== API_BASE_URL) {
          API_BASE_URL = newUrl;
          api.defaults.baseURL = API_BASE_URL;
          originalRequest.baseURL = API_BASE_URL;
          console.log(`🔄 Retrying with new API URL: ${API_BASE_URL}`);
          return api(originalRequest);
        }
      } catch (detectionError) {
        console.warn('⚠️ Failed to detect new API URL:', detectionError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Items API
  getItems: async () => {
    const response = await api.get('/api/items');
    return response.data;
  },

  getItem: async (id) => {
    const response = await api.get(`/api/items/${id}`);
    return response.data;
  },

  createItem: async (item) => {
    const response = await api.post('/api/items', item);
    return response.data;
  },

  updateItem: async (id, item) => {
    const response = await api.put(`/api/items/${id}`, item);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/api/items/${id}`);
    return response.data;
  },

  // Auth API
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export default apiService;

