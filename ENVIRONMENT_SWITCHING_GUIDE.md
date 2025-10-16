# Environment Switching Guide

## 🔄 **How to Switch Between Production and Development**

This guide shows you how to switch between production and development environments on your server.

---

## 📋 **Method 1: Using Environment Files**

### Step 1: Copy Environment Files
```bash
# For Development
cp env.development .env

# For Production
cp env.production .env
```

### Step 2: Restart Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
# or
node index.js
```

---

## 📋 **Method 2: Using NODE_ENV Variable**

### Development Mode
```bash
# Set NODE_ENV to development
export NODE_ENV=development
npm start
```

### Production Mode
```bash
# Set NODE_ENV to production
export NODE_ENV=production
npm start
```

---

## 📋 **Method 3: Using PM2 (Recommended for Production)**

### Install PM2
```bash
npm install -g pm2
```

### Create PM2 Ecosystem File
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'indigorhapsody-dev',
      script: 'index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_file: './env.development',
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'indigorhapsody-prod',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: './env.production',
      instances: 2,
      exec_mode: 'cluster'
    }
  ]
};
```

### PM2 Commands
```bash
# Start development environment
pm2 start ecosystem.config.js --only indigorhapsody-dev

# Start production environment
pm2 start ecosystem.config.js --only indigorhapsody-prod

# Stop all environments
pm2 stop all

# Switch between environments
pm2 stop indigorhapsody-dev
pm2 start indigorhapsody-prod

# Check status
pm2 status

# View logs
pm2 logs indigorhapsody-prod
```

---

## 📋 **Method 4: Using Docker (Advanced)**

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app-dev:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
    env_file:
      - ./env.development
    volumes:
      - ./logs:/app/logs

  app-prod:
    build: .
    ports:
      - "5001:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./env.production
    volumes:
      - ./logs:/app/logs
```

### Docker Commands
```bash
# Start development
docker-compose up app-dev

# Start production
docker-compose up app-prod

# Stop all
docker-compose down
```

---

## 🛠️ **Quick Switch Scripts**

### Create switch-dev.sh
```bash
#!/bin/bash
echo "🔄 Switching to Development Environment..."

# Copy development environment
cp env.development .env

# Set NODE_ENV
export NODE_ENV=development

# Restart server
echo "🚀 Starting Development Server..."
npm start
```

### Create switch-prod.sh
```bash
#!/bin/bash
echo "🔄 Switching to Production Environment..."

# Copy production environment
cp env.production .env

# Set NODE_ENV
export NODE_ENV=production

# Restart server
echo "🚀 Starting Production Server..."
npm start
```

### Make Scripts Executable
```bash
chmod +x switch-dev.sh
chmod +x switch-prod.sh
```

### Use Scripts
```bash
# Switch to development
./switch-dev.sh

# Switch to production
./switch-prod.sh
```

---

## 🔍 **Verification Commands**

### Check Current Environment
```bash
# Check NODE_ENV
echo $NODE_ENV

# Check environment file
cat .env | grep NODE_ENV

# Check server logs
tail -f logs/development.log  # for dev
tail -f logs/production.log   # for prod
```

### Health Check Endpoints
```bash
# Check server health
curl http://localhost:5000/health

# Check database status
curl http://localhost:5000/database/status
```

---

## 📊 **Environment Comparison**

| Feature | Development | Production |
|---------|-------------|------------|
| **Database** | `indigorhapsody_dev` | `indigorhapsody_prod` |
| **Logging** | Verbose, Debug | Info, Errors only |
| **CORS** | `localhost:3000` | `indigorhapsody.com` |
| **PhonePe** | Sandbox/Test | Live API |
| **Email** | Test SMTP | Production SMTP |
| **File Upload** | `./uploads/dev` | `./uploads/prod` |
| **Rate Limiting** | 100 req/15min | 1000 req/15min |
| **Security** | Basic | Enhanced |

---

## 🚨 **Important Notes**

### Before Switching Environments:

1. **Backup Database**
```bash
# Development backup
mongodump --db indigorhapsody_dev --out ./backups/dev-$(date +%Y%m%d)

# Production backup
mongodump --db indigorhapsody_prod --out ./backups/prod-$(date +%Y%m%d)
```

2. **Check Environment Variables**
```bash
# Verify all required variables are set
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');"
```

3. **Test Database Connection**
```bash
# Test connection
node -e "require('dotenv').config(); const { connectDB } = require('./src/config/database'); connectDB();"
```

---

## 🔧 **Troubleshooting**

### Common Issues:

1. **Environment Not Switching**
```bash
# Clear Node.js cache
rm -rf node_modules/.cache
npm start
```

2. **Database Connection Failed**
```bash
# Check MongoDB status
systemctl status mongod  # Linux
brew services list | grep mongo  # macOS

# Check connection string
echo $MONGODB_URI
```

3. **Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

4. **Environment Variables Not Loading**
```bash
# Check .env file exists
ls -la .env

# Check file permissions
chmod 644 .env
```

---

## 📝 **Best Practices**

### 1. **Use Environment-Specific Logs**
```bash
# Development
NODE_ENV=development npm start > logs/dev-$(date +%Y%m%d).log 2>&1

# Production
NODE_ENV=production npm start > logs/prod-$(date +%Y%m%d).log 2>&1
```

### 2. **Database Migration Script**
```bash
#!/bin/bash
# migrate.sh

if [ "$1" = "dev" ]; then
    echo "🔄 Migrating to Development..."
    cp env.development .env
    export NODE_ENV=development
elif [ "$1" = "prod" ]; then
    echo "🔄 Migrating to Production..."
    cp env.production .env
    export NODE_ENV=production
else
    echo "Usage: ./migrate.sh [dev|prod]"
    exit 1
fi

# Restart server
npm start
```

### 3. **Environment Validation**
```bash
#!/bin/bash
# validate-env.sh

echo "🔍 Validating Environment..."

# Check required variables
required_vars=("NODE_ENV" "MONGODB_URI" "JWT_SECRET" "PHONEPE_CLIENT_ID")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required variable: $var"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

echo "✅ Environment validation passed!"
```

---

## 🎯 **Quick Commands Summary**

```bash
# Switch to Development
cp env.development .env && export NODE_ENV=development && npm start

# Switch to Production
cp env.production .env && export NODE_ENV=production && npm start

# Check current environment
echo $NODE_ENV

# Check server health
curl http://localhost:5000/health

# View logs
tail -f logs/$(echo $NODE_ENV).log
```

---

## ✅ **Verification Checklist**

- [ ] Environment file copied (`.env`)
- [ ] NODE_ENV variable set
- [ ] Database connection successful
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Database status endpoint works
- [ ] Logs are being written
- [ ] CORS settings appropriate
- [ ] Payment gateway configured correctly

---

**Now you can easily switch between development and production environments!** 🚀
