const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require("./supabase");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
let users = [
  { id: 1, name: 'CalHacks User', email: 'demo@calhacks.com', password: 'password123', createdAt: new Date().toISOString() }
];

let nextUserId = 2;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CalHacks Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: nextUserId++,
    name,
    email,
    password, // In a real app, hash this password
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // In a real app, you'd generate a proper JWT token
  const token = `token_${newUser.id}_${Date.now()}`;
  
  res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
    token
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // In a real app, you'd generate a proper JWT token
  const token = `token_${user.id}_${Date.now()}`;
  
  res.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  // In a real app, you'd verify the JWT token here
  const userId = parseInt(token.split('_')[1]);
  const user = users.find(user => user.id === userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CalHacks Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Items API: http://localhost:${PORT}/api/items`);
});
