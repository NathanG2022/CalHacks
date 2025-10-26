import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // RAG Prompts API
  generateRAGPrompts: async (userPrompt, options = {}) => {
    const response = await api.post('/api/rag-prompts/generate', {
      userPrompt,
      options
    });
    return response.data;
  },

  getRAGTemplates: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/api/rag-prompts/templates', { params });
    return response.data;
  },

  getRAGCategories: async () => {
    const response = await api.get('/api/rag-prompts/categories');
    return response.data;
  },

  getRAGHealth: async () => {
    const response = await api.get('/api/rag-prompts/health');
    return response.data;
  },

  // Crescendo Attack API
  executeCrescendoAttack: async (userPrompt, modelId, options = {}) => {
    const response = await api.post('/api/crescendo/execute', {
      userPrompt,
      modelId,
      options
    });
    return response.data;
  },

  getCrescendoStatus: async () => {
    const response = await api.get('/api/crescendo/status');
    return response.data;
  },
};

export default apiService;
