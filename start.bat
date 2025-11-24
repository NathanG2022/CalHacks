@echo off
echo 🚀 Starting CalHacks App...

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm run install:all
)

REM Start the application
echo 🎯 Starting development servers...
npm run dev











