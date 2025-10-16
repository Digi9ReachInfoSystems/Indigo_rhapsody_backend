# Database Environment Configuration Guide

## 🗄️ **Environment-Specific Database Setup**

This guide explains how the database configuration works with different environments and MongoDB instances.

---

## 🔄 **Database Selection Logic**

### Development Environment (`NODE_ENV=development`)
- **Primary**: Uses `TESTING_MONGODB_URI` (Testing Database)
- **Fallback**: Uses `MONGODB_URI` if `TESTING_MONGODB_URI` is not set
- **Purpose**: Safe testing without affecting production data

### Production Environment (`NODE_ENV=production`)
- **Primary**: Uses `MONGODB_URI` (Production Database)
- **Purpose**: Live production data

---

## 📋 **Environment Variables**

### Development Environment
```env
NODE_ENV=development

# Testing Database (Primary for development)
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test

# Production Database (Fallback)
MONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod
```

### Production Environment
```env
NODE_ENV=production

# Production Database (Primary for production)
MONGODB_URI=mongodb+srv://username:password@cluster-prod.mongodb.net/indigorhapsody_prod?retryWrites=true&w=majority&authSource=admin
```

---

## 🧪 **Database Instances**

### 1. Testing Database (`indigorhapsody_test`)
- **Purpose**: Development and testing
- **Data**: Test data, safe to delete/reset
- **Access**: Development team only
- **Backup**: Optional (test data)

### 2. Production Database (`indigorhapsody_prod`)
- **Purpose**: Live production data
- **Data**: Real customer data, orders, payments
- **Access**: Production team only
- **Backup**: Critical, regular backups required

---

## 🔧 **Configuration Examples**

### Local Development Setup
```env
# env.development
NODE_ENV=development
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
MONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod
```

### MongoDB Atlas Development
```env
# env.development
NODE_ENV=development
TESTING_MONGODB_URI=mongodb+srv://dev-user:dev-password@cluster-dev.mongodb.net/indigorhapsody_test?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://prod-user:prod-password@cluster-prod.mongodb.net/indigorhapsody_prod?retryWrites=true&w=majority
```

### Production Setup
```env
# env.production
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:prod-password@cluster-prod.mongodb.net/indigorhapsody_prod?retryWrites=true&w=majority&authSource=admin
```

---

## 🚀 **Usage Examples**

### Switch to Development (Testing Database)
```bash
# Copy development environment
cp env.development .env

# Start server
npm start

# Console output:
# 🔗 Connecting to MongoDB (development environment)...
# 🧪 Using Testing Database: indigorhapsody_test
# ✅ MongoDB connected successfully (development)
```

### Switch to Production
```bash
# Copy production environment
cp env.production .env

# Start server
npm start

# Console output:
# 🔗 Connecting to MongoDB (production environment)...
# 🏭 Using Production Database: indigorhapsody_prod
# ✅ MongoDB connected successfully (production)
```

---

## 🔍 **Health Check Endpoints**

### Check Database Status
```bash
curl http://localhost:5000/database/status
```

### Development Response
```json
{
  "environment": "development",
  "databaseType": "testing",
  "host": "localhost",
  "port": 27017,
  "name": "indigorhapsody_test",
  "readyState": 1,
  "uri": "TESTING_MONGODB_URI",
  "states": {
    "0": "disconnected",
    "1": "connected",
    "2": "connecting",
    "3": "disconnecting"
  }
}
```

### Production Response
```json
{
  "environment": "production",
  "databaseType": "production",
  "host": "cluster-prod-shard-00-00.xxxxx.mongodb.net",
  "port": 27017,
  "name": "indigorhapsody_prod",
  "readyState": 1,
  "uri": "MONGODB_URI",
  "states": {
    "0": "disconnected",
    "1": "connected",
    "2": "connecting",
    "3": "disconnecting"
  }
}
```

---

## 🛠️ **Database Management Commands**

### Create Test Database
```bash
# Connect to MongoDB
mongosh

# Create test database
use indigorhapsody_test

# Create collections
db.createCollection("users")
db.createCollection("products")
db.createCollection("orders")

# Insert test data
db.users.insertOne({name: "Test User", email: "test@example.com"})
```

### Create Production Database
```bash
# Connect to MongoDB
mongosh

# Create production database
use indigorhapsody_prod

# Create collections with proper indexes
db.createCollection("users")
db.createCollection("products")
db.createCollection("orders")

# Create indexes for performance
db.users.createIndex({email: 1}, {unique: true})
db.products.createIndex({category: 1})
db.orders.createIndex({userId: 1, createdAt: -1})
```

---

## 🔄 **Database Switching Scripts**

### Development Switch Script
```bash
#!/bin/bash
echo "🔄 Switching to Development (Testing Database)..."

# Copy development environment
cp env.development .env

# Verify testing database is set
if grep -q "TESTING_MONGODB_URI" .env; then
    echo "✅ Testing database configured"
else
    echo "❌ Testing database not configured"
    exit 1
fi

# Start server
npm start
```

### Production Switch Script
```bash
#!/bin/bash
echo "🔄 Switching to Production..."

# Copy production environment
cp env.production .env

# Verify production database is set
if grep -q "MONGODB_URI" .env; then
    echo "✅ Production database configured"
else
    echo "❌ Production database not configured"
    exit 1
fi

# Start server
npm start
```

---

## 📊 **Database Monitoring**

### Check Which Database is Active
```bash
# Check current environment
echo $NODE_ENV

# Check database status
curl -s http://localhost:5000/database/status | jq '.databaseType'

# Check logs
tail -f logs/$(echo $NODE_ENV).log | grep "Database:"
```

### Database Connection Monitoring
```bash
# Check MongoDB processes
ps aux | grep mongod

# Check MongoDB connections
mongosh --eval "db.serverStatus().connections"

# Check database size
mongosh --eval "db.stats()"
```

---

## 🚨 **Important Considerations**

### Development Environment
- ✅ Safe to delete/reset test data
- ✅ Can use local MongoDB
- ✅ No impact on production
- ⚠️ Keep test data separate from production

### Production Environment
- 🚨 **NEVER** use test database in production
- 🚨 **ALWAYS** backup before changes
- 🚨 **VERIFY** database URI before deployment
- 🚨 **MONITOR** database performance

---

## 🔒 **Security Best Practices**

### Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo "env.development" >> .gitignore
echo "env.production" >> .gitignore

# Use strong passwords
# Development: Can use simple passwords
# Production: Use complex, unique passwords
```

### Database Access
```bash
# Development: Local access OK
# Production: Use MongoDB Atlas with IP whitelisting
# Production: Use SSL/TLS connections
# Production: Use authentication
```

---

## 🧪 **Testing Database Setup**

### Test Data Seeding
```bash
# Create test data script
cat > seed-test-data.js << 'EOF'
// Connect to test database
use indigorhapsody_test

// Clear existing data
db.users.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})

// Insert test users
db.users.insertMany([
  {name: "Test User 1", email: "test1@example.com", role: "user"},
  {name: "Test User 2", email: "test2@example.com", role: "admin"}
])

// Insert test products
db.products.insertMany([
  {name: "Test Product 1", price: 100, category: "test"},
  {name: "Test Product 2", price: 200, category: "test"}
])

print("Test data seeded successfully")
EOF

# Run test data seeding
mongosh seed-test-data.js
```

---

## 📝 **Troubleshooting**

### Common Issues

1. **Testing Database Not Found**
```bash
# Check if TESTING_MONGODB_URI is set
grep TESTING_MONGODB_URI .env

# Create test database
mongosh --eval "use indigorhapsody_test; db.createCollection('test')"
```

2. **Production Database Connection Failed**
```bash
# Check MONGODB_URI format
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"
```

3. **Wrong Database Being Used**
```bash
# Check environment
echo $NODE_ENV

# Check database status
curl http://localhost:5000/database/status
```

---

## ✅ **Verification Checklist**

### Development Environment
- [ ] `NODE_ENV=development`
- [ ] `TESTING_MONGODB_URI` is set
- [ ] Testing database exists
- [ ] Server connects to testing database
- [ ] Health check shows "testing" database type

### Production Environment
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` is set
- [ ] Production database exists
- [ ] Server connects to production database
- [ ] Health check shows "production" database type

---

**Now you have separate databases for development (testing) and production environments!** 🎉

### Key Benefits:
- ✅ **Safe Testing** - Development uses separate test database
- ✅ **Production Safety** - Production data is protected
- ✅ **Easy Switching** - Simple environment switching
- ✅ **Clear Separation** - No confusion between test and production data
- ✅ **Monitoring** - Health checks show which database is active
