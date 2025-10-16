#!/bin/bash

echo "🔄 Switching to Production Environment..."
echo "=========================================="

# Check if env.production exists
if [ ! -f "env.production" ]; then
    echo "❌ Error: env.production file not found!"
    echo "Please create the production environment file first."
    exit 1
fi

# Copy production environment file
echo "📋 Copying production environment configuration..."
cp env.production .env

# Set NODE_ENV
export NODE_ENV=production

# Verify environment
echo "🔍 Verifying environment..."
echo "NODE_ENV: $NODE_ENV"
echo "MONGODB_URI: $(grep MONGODB_URI .env | cut -d'=' -f2 | head -c 50)..."

# Production safety checks
echo "🔒 Running production safety checks..."

# Check if JWT_SECRET is set and secure
JWT_SECRET=$(grep JWT_SECRET .env | cut -d'=' -f2)
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "⚠️  Warning: JWT_SECRET should be at least 32 characters long"
fi

# Check if MongoDB URI is production-ready
if [[ $MONGODB_URI == *"localhost"* ]]; then
    echo "⚠️  Warning: Using localhost MongoDB in production is not recommended"
fi

# Check if PhonePe is configured for production
PHONEPE_CLIENT_ID=$(grep PHONEPE_CLIENT_ID .env | cut -d'=' -f2)
if [[ $PHONEPE_CLIENT_ID == *"TEST"* ]]; then
    echo "⚠️  Warning: Using test PhonePe credentials in production"
fi

# Kill any existing Node.js processes on port 5000
echo "🔄 Stopping existing server processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the production server
echo "🚀 Starting Production Server..."
echo "📍 Environment: Production"
echo "🌐 Port: 5000"
echo "🔗 Health Check: http://localhost:5000/health"
echo "📊 Database Status: http://localhost:5000/database/status"
echo "📝 Logs: logs/production.log"
echo ""
echo "⚠️  Production mode - Enhanced security enabled"
echo "Press Ctrl+C to stop the server"
echo "=========================================="

# Start the server with production logging
npm start > logs/production-$(date +%Y%m%d).log 2>&1 &
SERVER_PID=$!

echo "✅ Production server started with PID: $SERVER_PID"
echo "📝 To view logs: tail -f logs/production-$(date +%Y%m%d).log"
echo "🛑 To stop server: kill $SERVER_PID"
