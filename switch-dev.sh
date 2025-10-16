#!/bin/bash

echo "🔄 Switching to Development Environment..."
echo "=========================================="

# Check if env.development exists
if [ ! -f "env.development" ]; then
    echo "❌ Error: env.development file not found!"
    echo "Please create the development environment file first."
    exit 1
fi

# Copy development environment file
echo "📋 Copying development environment configuration..."
cp env.development .env

# Set NODE_ENV
export NODE_ENV=development

# Verify environment
echo "🔍 Verifying environment..."
echo "NODE_ENV: $NODE_ENV"
echo "MONGODB_URI: $(grep MONGODB_URI .env | cut -d'=' -f2 | head -c 50)..."

# Check if MongoDB is running (optional)
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.runCommand('ping')" --quiet
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB connection failed - please check your MongoDB service"
    fi
fi

# Kill any existing Node.js processes on port 5000
echo "🔄 Stopping existing server processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Start the development server
echo "🚀 Starting Development Server..."
echo "📍 Environment: Development"
echo "🌐 Port: 5000"
echo "🔗 Health Check: http://localhost:5000/health"
echo "📊 Database Status: http://localhost:5000/database/status"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="

# Start the server
npm start
