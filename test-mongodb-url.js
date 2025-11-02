const { connectDB, getDatabaseInfo } = require('./src/config/database');

async function testMongoDBURL() {
    console.log('🧪 Testing MongoDB URL Configuration...\n');

    try {
        console.log('📋 Environment Variables:');
        console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
        console.log('TESTING_MONGODB_URI:', process.env.TESTING_MONGODB_URI ? 'Set' : 'Not set');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

        console.log('\n🔗 Connecting to MongoDB...');
        await connectDB();

        console.log('\n📊 Database Info:');
        const dbInfo = getDatabaseInfo();
        console.log(JSON.stringify(dbInfo, null, 2));

        console.log('\n✅ MongoDB connection test completed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Run the test
testMongoDBURL();
