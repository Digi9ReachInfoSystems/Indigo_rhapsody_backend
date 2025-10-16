# Database Environment Troubleshooting Guide

## 🚨 **Issue: Fallback Method Called Despite NODE_ENV Set**

If you're seeing the fallback method being called even when `NODE_ENV` is set in your `.env` file, here are the steps to diagnose and fix the issue.

---

## 🔍 **Step 1: Run Debug Script**

First, run the debug script to see what's happening:

```bash
node debug-env.js
```

This will show you:
- Whether `.env` file exists
- What `NODE_ENV` value is being read
- Which MongoDB URIs are available
- Which URI would be selected

---

## 🔍 **Step 2: Check Common Issues**

### Issue 1: .env File Not Loaded
**Problem**: The `.env` file is not being loaded before the database configuration.

**Solution**: Ensure `require('dotenv').config()` is called at the very top of your main file.

```javascript
// index.js - Make sure this is at the VERY TOP
require('dotenv').config();

const express = require('express');
// ... rest of your code
```

### Issue 2: .env File Format Issues
**Problem**: Incorrect format in `.env` file.

**Check your `.env` file:**
```bash
# Correct format
NODE_ENV=development
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
MONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod

# Wrong formats (these won't work):
NODE_ENV = development  # Spaces around =
NODE_ENV="development"  # Quotes not needed
NODE_ENV=development    # Trailing spaces
```

### Issue 3: Environment Variables Not Set
**Problem**: `TESTING_MONGODB_URI` is not set in development.

**Check your `.env` file contains:**
```env
NODE_ENV=development
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
MONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod
```

### Issue 4: Case Sensitivity
**Problem**: Environment variable names are case-sensitive.

**Ensure exact spelling:**
```env
# Correct
NODE_ENV=development
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test

# Wrong
node_env=development
testing_mongodb_uri=mongodb://localhost:27017/indigorhapsody_test
```

---

## 🔧 **Step 3: Manual Testing**

### Test Environment Variables
```bash
# Check if .env file is being read
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV);"

# Check specific variables
node -e "require('dotenv').config(); console.log('TESTING_MONGODB_URI:', process.env.TESTING_MONGODB_URI);"
```

### Test Database Configuration
```bash
# Test the database configuration directly
node -e "
require('dotenv').config();
const { getMongoDBURI } = require('./src/config/database');
try {
  const uri = getMongoDBURI();
  console.log('Selected URI:', uri);
} catch (error) {
  console.error('Error:', error.message);
}
"
```

---

## 🛠️ **Step 4: Fix Common Problems**

### Fix 1: Ensure .env File is in Root Directory
```bash
# Check if .env file is in the right place
ls -la .env

# If not found, create it
cp env.development .env
```

### Fix 2: Clear Node.js Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules cache
rm -rf node_modules/.cache

# Restart server
npm start
```

### Fix 3: Check File Permissions
```bash
# Make sure .env file is readable
chmod 644 .env

# Check file ownership
ls -la .env
```

### Fix 4: Verify .env File Content
```bash
# Check .env file content
cat .env | grep -E "(NODE_ENV|TESTING_MONGODB_URI|MONGODB_URI)"

# Expected output:
# NODE_ENV=development
# TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
# MONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod
```

---

## 🧪 **Step 5: Test Different Scenarios**

### Scenario 1: Development with Testing Database
```bash
# Set up development environment
cp env.development .env

# Verify content
cat .env | grep -E "(NODE_ENV|TESTING_MONGODB_URI)"

# Start server
npm start

# Expected output:
# 🔍 Environment Check: NODE_ENV = "development"
# 🧪 Development Mode:
#   - TESTING_MONGODB_URI: Set
#   - MONGODB_URI (fallback): Set
# ✅ Using TESTING_MONGODB_URI
```

### Scenario 2: Development without Testing Database
```bash
# Remove TESTING_MONGODB_URI from .env
sed -i '/TESTING_MONGODB_URI/d' .env

# Start server
npm start

# Expected output:
# 🔍 Environment Check: NODE_ENV = "development"
# 🧪 Development Mode:
#   - TESTING_MONGODB_URI: Not set
#   - MONGODB_URI (fallback): Set
# ⚠️  Using MONGODB_URI (fallback - TESTING_MONGODB_URI not found)
```

### Scenario 3: Production Environment
```bash
# Set up production environment
cp env.production .env

# Start server
npm start

# Expected output:
# 🔍 Environment Check: NODE_ENV = "production"
# 🏭 Production Mode:
#   - MONGODB_URI: Set
# ✅ Using MONGODB_URI
```

---

## 🔍 **Step 6: Advanced Debugging**

### Debug with Detailed Logging
```bash
# Add debug logging to your .env file
echo "DEBUG=true" >> .env

# Start server with debug output
DEBUG=* npm start
```

### Check Environment Variables in Runtime
```bash
# Add this to your index.js temporarily
console.log('All environment variables:');
console.log(process.env);
```

### Test Database Connection
```bash
# Test MongoDB connection directly
mongosh "mongodb://localhost:27017/indigorhapsody_test"

# Test with the exact URI from your .env
mongosh "$(grep TESTING_MONGODB_URI .env | cut -d'=' -f2)"
```

---

## 📋 **Step 7: Verification Checklist**

### Before Starting Server:
- [ ] `.env` file exists in root directory
- [ ] `NODE_ENV=development` is set
- [ ] `TESTING_MONGODB_URI` is set
- [ ] No extra spaces in `.env` file
- [ ] MongoDB is running
- [ ] Test database exists

### After Starting Server:
- [ ] Console shows "Environment Check: NODE_ENV = development"
- [ ] Console shows "TESTING_MONGODB_URI: Set"
- [ ] Console shows "Using TESTING_MONGODB_URI"
- [ ] No fallback warning messages
- [ ] Database connects successfully

---

## 🚨 **Common Error Messages and Solutions**

### Error: "TESTING_MONGODB_URI not found"
**Solution**: Add `TESTING_MONGODB_URI` to your `.env` file:
```env
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
```

### Error: "Neither TESTING_MONGODB_URI nor MONGODB_URI is set"
**Solution**: Ensure at least one MongoDB URI is set in your `.env` file.

### Error: "MONGODB_URI could not be determined"
**Solution**: Check your `.env` file format and ensure variables are set correctly.

### Warning: "Using MONGODB_URI (fallback)"
**Solution**: This is expected if `TESTING_MONGODB_URI` is not set. Add it to your `.env` file to use the testing database.

---

## 🎯 **Quick Fix Commands**

```bash
# 1. Copy development environment
cp env.development .env

# 2. Verify content
cat .env | grep -E "(NODE_ENV|TESTING_MONGODB_URI)"

# 3. Test environment loading
node debug-env.js

# 4. Start server
npm start
```

---

## ✅ **Expected Working Output**

When everything is working correctly, you should see:

```
🔍 Environment Check: NODE_ENV = "development"
🧪 Development Mode:
  - TESTING_MONGODB_URI: Set
  - MONGODB_URI (fallback): Set
✅ Using TESTING_MONGODB_URI
🔗 Connecting to MongoDB (development environment)...
📍 Database: indigorhapsody_test
✅ MongoDB connected successfully (development)
```

If you see this output, your environment is configured correctly! 🎉
