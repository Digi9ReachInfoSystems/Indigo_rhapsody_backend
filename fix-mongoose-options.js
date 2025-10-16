// Fix Mongoose Connection Options
const fs = require('fs');

console.log('🔧 Fixing Mongoose Connection Options');
console.log('=====================================');

// Check current .env file
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');

    console.log('📋 Current .env file:');
    lines.forEach((line, index) => {
        if (line.includes('NODE_ENV') || line.includes('MONGODB_URI') || line.includes('TESTING_MONGODB_URI')) {
            console.log(`Line ${index + 1}: ${line}`);
        }
    });

    // Check if NODE_ENV is set to production
    const nodeEnvLine = lines.find(line => line.startsWith('NODE_ENV='));
    if (nodeEnvLine && nodeEnvLine.includes('production')) {
        console.log('\n⚠️  NODE_ENV is set to production');
        console.log('This means it will use MONGODB_URI instead of TESTING_MONGODB_URI');
        console.log('\n🔧 To use testing database, change NODE_ENV to development:');
        console.log('NODE_ENV=development');
    }

    // Check if TESTING_MONGODB_URI is set
    const testingUriLine = lines.find(line => line.startsWith('TESTING_MONGODB_URI='));
    if (!testingUriLine) {
        console.log('\n⚠️  TESTING_MONGODB_URI not found');
        console.log('Adding TESTING_MONGODB_URI to .env file...');
        fs.appendFileSync('.env', '\nTESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test\n');
        console.log('✅ TESTING_MONGODB_URI added');
    }

} else {
    console.log('❌ .env file not found');
    console.log('Creating .env file from env.development...');

    if (fs.existsSync('env.development')) {
        fs.copyFileSync('env.development', '.env');
        console.log('✅ .env file created');
    } else {
        console.log('❌ env.development file not found');
    }
}

console.log('\n✅ Mongoose options fixed!');
console.log('The deprecated bufferMaxEntries and bufferCommands options have been removed.');
console.log('Now try running: npm start');
