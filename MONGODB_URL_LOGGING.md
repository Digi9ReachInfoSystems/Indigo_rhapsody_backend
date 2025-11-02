# MongoDB URL Logging Enhancement

## Changes Made

### Enhanced Database Configuration (`src/config/database.js`)

Added comprehensive logging to show which MongoDB URL is being used:

#### 1. Development Mode Logging
```javascript
// Shows which URI is being used
console.log(`✅ Using TESTING_MONGODB_URI`);
console.log(`🔗 Testing URI: ${testingUri}`);

// Or fallback
console.log(`⚠️  Using MONGODB_URI (fallback - TESTING_MONGODB_URI not found)`);
console.log(`🔗 Fallback URI: ${fallbackUri}`);
```

#### 2. Production Mode Logging
```javascript
console.log(`✅ Using MONGODB_URI`);
console.log(`🔗 Production URI: ${productionUri}`);
```

#### 3. Connection Logging
```javascript
console.log(`🔗 Connecting to MongoDB (${NODE_ENV} environment)...`);
console.log(`📍 Database: ${MONGODB_URI.split('@')[1]?.split('/')[1] || 'local'}`);
console.log(`🔗 MongoDB URI: ${MONGODB_URI}`);
```

## What You'll See in Console

### Development Mode (with TESTING_MONGODB_URI)
```
🔍 Environment Check: NODE_ENV = "development"
🧪 Development Mode:
  - TESTING_MONGODB_URI: Set
  - MONGODB_URI (fallback): Set
✅ Using TESTING_MONGODB_URI
🔗 Testing URI: mongodb://localhost:27017/indigorhapsody_test
🔗 Connecting to MongoDB (development environment)...
📍 Database: indigorhapsody_test
🔗 MongoDB URI: mongodb://localhost:27017/indigorhapsody_test
✅ MongoDB connected successfully (development)
```

### Development Mode (fallback to MONGODB_URI)
```
🔍 Environment Check: NODE_ENV = "development"
🧪 Development Mode:
  - TESTING_MONGODB_URI: Not set
  - MONGODB_URI (fallback): Set
⚠️  Using MONGODB_URI (fallback - TESTING_MONGODB_URI not found)
🔗 Fallback URI: mongodb://localhost:27017/indigorhapsody
🔗 Connecting to MongoDB (development environment)...
📍 Database: indigorhapsody
🔗 MongoDB URI: mongodb://localhost:27017/indigorhapsody
✅ MongoDB connected successfully (development)
```

### Production Mode
```
🔍 Environment Check: NODE_ENV = "production"
🏭 Production Mode:
  - MONGODB_URI: Set
✅ Using MONGODB_URI
🔗 Production URI: mongodb+srv://user:pass@cluster.mongodb.net/indigorhapsody
🔗 Connecting to MongoDB (production environment)...
📍 Database: indigorhapsody
🔗 MongoDB URI: mongodb+srv://user:pass@cluster.mongodb.net/indigorhapsody
✅ MongoDB connected successfully (production)
```

## Testing

### Test MongoDB URL Configuration
```bash
node test-mongodb-url.js
```

### Manual Testing
Start your server and you'll see the MongoDB URL in the console:
```bash
npm start
# or
node index.js
```

## Environment Variables

### Development
- `TESTING_MONGODB_URI` - Primary database for development
- `MONGODB_URI` - Fallback database

### Production
- `MONGODB_URI` - Production database

## Security Note

⚠️ **Important**: The full MongoDB URI is logged to console, which includes credentials. Make sure to:
1. Never commit `.env` files to version control
2. Use environment-specific logging levels in production
3. Consider masking sensitive parts of the URI in production logs

## Example .env File

```env
# Development
NODE_ENV=development
TESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test
MONGODB_URI=mongodb://localhost:27017/indigorhapsody

# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/indigorhapsody
```

Now you'll see exactly which MongoDB URL is being used when your application starts! 🎉
