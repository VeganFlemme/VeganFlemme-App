#!/bin/bash

# VeganFlemme Engine - Deployment Verification Script
# This script verifies that the engine can be built and started in a deployment-like environment

set -e

echo "🌱 VeganFlemme Engine - Deployment Verification"
echo "=============================================="

# Check Node.js version
echo "📦 Checking Node.js version..."
node --version
echo "❌ Node.js is not installed or not in PATH"
exit 1

# Check npm version
echo "📦 Checking npm version..."
npm --version
echo "❌ npm is not installed or not in PATH"
exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
echo "❌ Failed to install dependencies"
exit 1

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🔨 Building TypeScript project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript build failed"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Build directory 'dist' was not created"
    exit 1
fi

# Check if main files exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ Main entry file 'dist/index.js' was not created"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Test if the server can start (quick start/stop test)
echo "🚀 Testing server startup..."
npm start &
SERVER_PID=$!
(sleep 5 && kill $SERVER_PID 2>/dev/null) &
TIMER_PID=$!
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
else
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ All deployment verification checks passed!"
echo "🎉 The VeganFlemme Engine is ready for deployment!"