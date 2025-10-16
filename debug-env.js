// Debug Environment Variables
require('dotenv').config();

console.log('🔍 Environment Debug Information');
console.log('==================================');

// Check if .env file exists
const fs = require('fs');
if (fs.existsSync('.env')) {
    console.log('✅ .env file exists');
} else {
    console.log('❌ .env file not found');
}

// Check NODE_ENV
console.log(`📍 NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`📍 NODE_ENV type: ${typeof process.env.NODE_ENV}`);
console.log(`📍 NODE_ENV length: ${process.env.NODE_ENV?.length}`);

// Check MongoDB URIs
console.log(`🧪 TESTING_MONGODB_URI: "${process.env.TESTING_MONGODB_URI}"`);
console.log(`🏭 MONGODB_URI: "${process.env.MONGODB_URI}"`);

// Check which URI would be used
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`\n🔧 Logic Check:`);
console.log(`NODE_ENV === "development": ${NODE_ENV === "development"}`);
console.log(`NODE_ENV === "production": ${NODE_ENV === "production"}`);

if (NODE_ENV === "development") {
    const testingUri = process.env.TESTING_MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI;

    console.log(`\n🧪 Development Logic:`);
    console.log(`TESTING_MONGODB_URI exists: ${!!testingUri}`);
    console.log(`MONGODB_URI exists: ${!!fallbackUri}`);

    if (testingUri) {
        console.log(`✅ Would use TESTING_MONGODB_URI: ${testingUri}`);
    } else if (fallbackUri) {
        console.log(`⚠️  Would use MONGODB_URI (fallback): ${fallbackUri}`);
    } else {
        console.log(`❌ No MongoDB URI found!`);
    }
} else {
    console.log(`\n🏭 Production Logic:`);
    console.log(`Would use MONGODB_URI: ${process.env.MONGODB_URI}`);
}

// Check .env file contents
console.log(`\n📄 .env file contents:`);
console.log('==================================');
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('NODE_ENV') || line.includes('TESTING_MONGODB_URI') || line.includes('MONGODB_URI')) {
            console.log(`${index + 1}: ${line}`);
        }
    });
} catch (error) {
    console.log(`❌ Error reading .env file: ${error.message}`);
}

console.log('\n✅ Debug complete!');
