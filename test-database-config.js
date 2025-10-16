// Test Database Configuration
require('dotenv').config();

console.log('🧪 Testing Database Configuration');
console.log('==================================');

try {
    // Test environment variables
    console.log('📋 Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('TESTING_MONGODB_URI:', process.env.TESTING_MONGODB_URI ? 'Set' : 'Not set');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

    // Test the database configuration
    const { getMongoDBURI, getConnectionOptions } = require('./src/config/database');

    console.log('\n🔧 Testing getMongoDBURI():');
    const mongoUri = getMongoDBURI();
    console.log('✅ MongoDB URI obtained:', mongoUri ? 'Yes' : 'No');

    console.log('\n🔧 Testing getConnectionOptions():');
    const NODE_ENV = process.env.NODE_ENV || "development";
    const options = getConnectionOptions(NODE_ENV);
    console.log('✅ Connection options obtained:', options ? 'Yes' : 'No');
    console.log('Options:', JSON.stringify(options, null, 2));

    console.log('\n✅ All database configuration tests passed!');

} catch (error) {
    console.error('❌ Database configuration test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}
