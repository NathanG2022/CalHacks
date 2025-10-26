#!/bin/bash

echo "🚀 Starting CalHacks App..."

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Start the application
echo "🎯 Starting development servers..."
npm run dev


