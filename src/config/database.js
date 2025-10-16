const mongoose = require("mongoose");

// Function to get the correct MongoDB URI based on environment
const getMongoDBURI = () => {
  const NODE_ENV = process.env.NODE_ENV || "development";

  console.log(`🔍 Environment Check: NODE_ENV = "${NODE_ENV}"`);

  if (NODE_ENV === "development") {
    const testingUri = process.env.TESTING_MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI;

    console.log(`🧪 Development Mode:`);
    console.log(`  - TESTING_MONGODB_URI: ${testingUri ? 'Set' : 'Not set'}`);
    console.log(`  - MONGODB_URI (fallback): ${fallbackUri ? 'Set' : 'Not set'}`);

    if (testingUri) {
      console.log(`✅ Using TESTING_MONGODB_URI`);
      return testingUri;
    } else if (fallbackUri) {
      console.log(`⚠️  Using MONGODB_URI (fallback - TESTING_MONGODB_URI not found)`);
      return fallbackUri;
    } else {
      throw new Error("Neither TESTING_MONGODB_URI nor MONGODB_URI is set for development environment");
    }
  } else {
    const productionUri = process.env.MONGODB_URI;
    console.log(`🏭 Production Mode:`);
    console.log(`  - MONGODB_URI: ${productionUri ? 'Set' : 'Not set'}`);

    if (productionUri) {
      console.log(`✅ Using MONGODB_URI`);
      return productionUri;
    } else {
      throw new Error("MONGODB_URI is not set for production environment");
    }
  }
};

// Database connection options based on environment
const getConnectionOptions = (nodeEnv) => {
  const baseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // Uncomment if using older versions of Mongoose
    // useFindAndModify: false, // Uncomment if using older versions of Mongoose
  };

  if (nodeEnv === "production") {
    return {
      ...baseOptions,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      // Production-specific options
      retryWrites: true,
      w: "majority",
      readPreference: "secondaryPreferred",
    };
  } else {
    // Development options
    return {
      ...baseOptions,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
    };
  }
};

const connectDB = async () => {
  const NODE_ENV = process.env.NODE_ENV || "development";

  try {
    const MONGODB_URI = getMongoDBURI();

    if (!MONGODB_URI) {
      throw new Error("MongoDB URI could not be determined");
    }

    const options = getConnectionOptions(NODE_ENV);

    console.log(`🔗 Connecting to MongoDB (${NODE_ENV} environment)...`);
    console.log(`📍 Database: ${MONGODB_URI.split('@')[1]?.split('/')[1] || 'local'}`);

    await mongoose.connect(MONGODB_URI, options);

    console.log(`✅ MongoDB connected successfully (${NODE_ENV})`);

    // Log connection details in development
    if (NODE_ENV === "development") {
      console.log(`🔧 Connection Options:`, {
        socketTimeoutMS: options.socketTimeoutMS,
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
        maxPoolSize: options.maxPoolSize || 'default',
      });
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error (${NODE_ENV}):`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`⚠️ MongoDB disconnected (${NODE_ENV})`);
    });

    mongoose.connection.on('reconnected', () => {
      console.log(`🔄 MongoDB reconnected (${NODE_ENV})`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log(`🔌 MongoDB connection closed (${NODE_ENV})`);
        process.exit(0);
      } catch (err) {
        console.error(`❌ Error closing MongoDB connection (${NODE_ENV}):`, err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error(`❌ MongoDB connection failed (${NODE_ENV}):`, err.message);

    // In production, try to reconnect after a delay
    if (NODE_ENV === "production") {
      console.log("🔄 Attempting to reconnect in 5 seconds...");
      setTimeout(() => {
        connectDB();
      }, 5000);
    } else {
      // In development, exit immediately
      process.exit(1);
    }
  }
};

// Export connection status check function
const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Export database info function
const getDatabaseInfo = () => {
  const NODE_ENV = process.env.NODE_ENV || "development";
  const isTestingDb = NODE_ENV === "development" && process.env.TESTING_MONGODB_URI;

  return {
    environment: NODE_ENV,
    databaseType: isTestingDb ? 'testing' : (NODE_ENV === 'production' ? 'production' : 'fallback'),
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState,
    uri: isTestingDb ? 'TESTING_MONGODB_URI' : 'MONGODB_URI',
    states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
  };
};

module.exports = {
  connectDB,
  checkConnection,
  getDatabaseInfo,
  mongoose
};
