#!/bin/bash

echo "🔍 Environment Status Check"
echo "============================"

# Check current environment
if [ -f ".env" ]; then
    echo "📋 Current .env file found"
    NODE_ENV=$(grep NODE_ENV .env | cut -d'=' -f2)
    echo "📍 NODE_ENV: $NODE_ENV"
else
    echo "❌ No .env file found"
    exit 1
fi

# Check environment variables
echo ""
echo "🔧 Environment Variables:"
echo "------------------------"

# Required variables
required_vars=("NODE_ENV" "JWT_SECRET" "PHONEPE_CLIENT_ID" "PHONEPE_CLIENT_SECRET")

# Check environment-specific MongoDB URI
if [ "$NODE_ENV" = "development" ]; then
    required_vars+=("TESTING_MONGODB_URI")
else
    required_vars+=("MONGODB_URI")
fi

for var in "${required_vars[@]}"; do
    value=$(grep "^$var=" .env | cut -d'=' -f2)
    if [ -n "$value" ]; then
        # Mask sensitive values
        if [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"KEY"* ]]; then
            masked_value="${value:0:8}...${value: -4}"
            echo "✅ $var: $masked_value"
        else
            echo "✅ $var: $value"
        fi
    else
        echo "❌ $var: Not set"
    fi
done

# Check database connection
echo ""
echo "🗄️  Database Status:"
echo "-------------------"

if [ "$NODE_ENV" = "development" ]; then
    # Check testing database
    TESTING_MONGODB_URI=$(grep TESTING_MONGODB_URI .env | cut -d'=' -f2)
    if [ -n "$TESTING_MONGODB_URI" ]; then
        echo "🧪 Testing Database: $TESTING_MONGODB_URI"
        if [[ $TESTING_MONGODB_URI == *"localhost"* ]]; then
            echo "📍 Type: Local MongoDB (Testing)"
        elif [[ $TESTING_MONGODB_URI == *"mongodb+srv"* ]]; then
            echo "📍 Type: MongoDB Atlas (Testing)"
            cluster=$(echo $TESTING_MONGODB_URI | sed 's/.*@\([^.]*\).*/\1/')
            echo "🌐 Cluster: $cluster"
        else
            echo "📍 Type: Custom MongoDB (Testing)"
        fi
    else
        echo "❌ TESTING_MONGODB_URI not set"
    fi
    
    # Check fallback production URI
    MONGODB_URI=$(grep MONGODB_URI .env | cut -d'=' -f2)
    if [ -n "$MONGODB_URI" ]; then
        echo "📍 Fallback Database: Available"
    fi
else
    # Check production database
    MONGODB_URI=$(grep MONGODB_URI .env | cut -d'=' -f2)
    if [ -n "$MONGODB_URI" ]; then
        echo "🏭 Production Database: $MONGODB_URI"
        if [[ $MONGODB_URI == *"localhost"* ]]; then
            echo "📍 Type: Local MongoDB (Production)"
        elif [[ $MONGODB_URI == *"mongodb+srv"* ]]; then
            echo "📍 Type: MongoDB Atlas (Production)"
            cluster=$(echo $MONGODB_URI | sed 's/.*@\([^.]*\).*/\1/')
            echo "🌐 Cluster: $cluster"
        else
            echo "📍 Type: Custom MongoDB (Production)"
        fi
    else
        echo "❌ MONGODB_URI not set"
    fi
fi

# Check server status
echo ""
echo "🖥️  Server Status:"
echo "------------------"
if lsof -i:5000 >/dev/null 2>&1; then
    echo "✅ Server is running on port 5000"
    PID=$(lsof -ti:5000)
    echo "🆔 Process ID: $PID"
    
    # Check if it's our Node.js process
    if ps -p $PID -o comm= | grep -q node; then
        echo "✅ Node.js process confirmed"
    else
        echo "⚠️  Port 5000 is in use by another process"
    fi
else
    echo "❌ No server running on port 5000"
fi

# Check health endpoint
echo ""
echo "🏥 Health Check:"
echo "----------------"
if curl -s http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ Health endpoint responding"
    health_response=$(curl -s http://localhost:5000/health)
    echo "📊 Response: $(echo $health_response | jq -r '.status' 2>/dev/null || echo 'OK')"
else
    echo "❌ Health endpoint not responding"
fi

# Check database endpoint
echo ""
echo "🗄️  Database Health:"
echo "-------------------"
if curl -s http://localhost:5000/database/status >/dev/null 2>&1; then
    echo "✅ Database status endpoint responding"
    db_response=$(curl -s http://localhost:5000/database/status)
    db_status=$(echo $db_response | jq -r '.states[.readyState]' 2>/dev/null || echo 'unknown')
    echo "📊 Database Status: $db_status"
else
    echo "❌ Database status endpoint not responding"
fi

# Environment-specific checks
echo ""
echo "🔍 Environment-Specific Checks:"
echo "-------------------------------"

if [ "$NODE_ENV" = "development" ]; then
    echo "🛠️  Development Environment:"
    
    # Check if debug logging is enabled
    if grep -q "DEBUG=app:\*" .env; then
        echo "✅ Debug logging enabled"
    else
        echo "⚠️  Debug logging not configured"
    fi
    
    # Check CORS settings
    CORS_ORIGIN=$(grep CORS_ORIGIN .env | cut -d'=' -f2)
    if [[ $CORS_ORIGIN == *"localhost"* ]]; then
        echo "✅ CORS configured for localhost"
    else
        echo "⚠️  CORS may not be configured for development"
    fi
    
elif [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Production Environment:"
    
    # Check security settings
    BCRYPT_ROUNDS=$(grep BCRYPT_ROUNDS .env | cut -d'=' -f2)
    if [ "$BCRYPT_ROUNDS" -ge 12 ]; then
        echo "✅ Strong password hashing (rounds: $BCRYPT_ROUNDS)"
    else
        echo "⚠️  Consider increasing BCRYPT_ROUNDS for production"
    fi
    
    # Check JWT expiration
    JWT_EXPIRES_IN=$(grep JWT_EXPIRES_IN .env | cut -d'=' -f2)
    if [[ $JWT_EXPIRES_IN == *"h"* ]] || [[ $JWT_EXPIRES_IN == *"d"* ]]; then
        echo "✅ JWT expiration configured: $JWT_EXPIRES_IN"
    else
        echo "⚠️  JWT expiration should be configured for production"
    fi
    
    # Check PhonePe production settings
    PHONEPE_REDIRECT_URL=$(grep PHONEPE_REDIRECT_URL .env | cut -d'=' -f2)
    if [[ $PHONEPE_REDIRECT_URL == *"https"* ]]; then
        echo "✅ PhonePe redirect URL uses HTTPS"
    else
        echo "⚠️  PhonePe redirect URL should use HTTPS in production"
    fi
fi

echo ""
echo "✅ Environment check completed!"
echo "=============================="
