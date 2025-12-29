const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const supabase = require("./supabase");
const { findAvailablePort } = require('./utils/portFinder');
const portConfig = require('../shared-config/portConfig');

// Import enhanced AI routes
const enhancedAIRoutes = require('./routes/enhancedAI');
const ragPromptsRoutes = require('./routes/ragPrompts');
const crescendoRoutes = require('./routes/crescendo');

const app = express();
const PREFERRED_PORT = parseInt(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'calhacks-dev-secret-change-in-production';
const SALT_ROUNDS = 10;

// Dynamic CORS - will accept any localhost port for development
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Allow configured client URL
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// In-memory storage (in a real app, you'd use a database)
let items = [
  { id: 1, name: 'Build CalHacks Project', completed: false },
  { id: 2, name: 'Implement Authentication', completed: false },
  { id: 3, name: 'Create Dashboard', completed: false },
  { id: 4, name: 'Deploy to Production', completed: false }
];

let nextId = 5;

// Simple in-memory user storage (in a real app, use a database)
let users = [];
let nextUserId = 1;

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CalHacks Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: portConfig.getServerPort()
  });
});

// Port configuration endpoint
app.get('/api/port-config', (req, res) => {
  const config = portConfig.getConfig();
  res.json({
    serverPort: config.serverPort,
    clientPort: config.clientPort,
    serverUrl: `http://localhost:${config.serverPort}`,
    timestamp: Date.now()
  });
});

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: nextUserId++,
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(user => user.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(user => user.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Get a specific item
app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

// Create a new item
app.post('/api/items', (req, res) => {
  const { name, completed = false } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  
  const newItem = {
    id: nextId++,
    name: name.trim(),
    completed: Boolean(completed)
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update an item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  const { name, completed } = req.body;
  
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    items[itemIndex].name = name.trim();
  }
  
  if (completed !== undefined) {
    items[itemIndex].completed = Boolean(completed);
  }
  
  res.json(items[itemIndex]);
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  const deletedItem = items.splice(itemIndex, 1)[0];
  res.json({ message: 'Item deleted successfully', item: deletedItem });
});

// Enhanced AI routes
app.use('/api/enhanced-ai', enhancedAIRoutes);

// RAG Prompts routes
app.use('/api/rag-prompts', ragPromptsRoutes);

// Crescendo Attack routes
app.use('/api/crescendo', crescendoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with dynamic port detection
async function startServer() {
  try {
    const PORT = await findAvailablePort(PREFERRED_PORT);

    // Save server port to shared config
    portConfig.setServerPort(PORT);

    app.listen(PORT, () => {
      console.log('\n🚀 CalHacks Server Started Successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server URL:    http://localhost:${PORT}`);
      console.log(`📊 Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`🔧 Port Config:   http://localhost:${PORT}/api/port-config`);
      console.log(`📝 Items API:     http://localhost:${PORT}/api/items`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Using port ${PORT} (preferred: ${PREFERRED_PORT})`);
      if (PORT !== PREFERRED_PORT) {
        console.log(`⚠️  Port ${PREFERRED_PORT} was in use, using ${PORT} instead`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Clean up port config on exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  portConfig.clear();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  portConfig.clear();
  process.exit(0);
});

startServer();
