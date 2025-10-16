// Fix Environment Configuration
const fs = require('fs');

console.log('🔧 Fixing Environment Configuration');
console.log('====================================');

// Check if .env file exists
if (!fs.existsSync('.env')) {
    console.log('❌ .env file not found');

    // Check if env.development exists
    if (fs.existsSync('env.development')) {
        console.log('📋 Copying env.development to .env');
        fs.copyFileSync('env.development', '.env');
        console.log('✅ .env file created from env.development');
    } else {
        console.log('❌ env.development file not found');
        process.exit(1);
    }
} else {
    console.log('✅ .env file exists');
}

// Read and validate .env file
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');

console.log('\n📋 Validating .env file:');

let hasNodeEnv = false;
let hasTestingUri = false;
let hasMongoUri = false;

lines.forEach((line, index) => {
    if (line.trim().startsWith('NODE_ENV=')) {
        hasNodeEnv = true;
        console.log(`✅ Line ${index + 1}: NODE_ENV found`);
    }
    if (line.trim().startsWith('TESTING_MONGODB_URI=')) {
        hasTestingUri = true;
        console.log(`✅ Line ${index + 1}: TESTING_MONGODB_URI found`);
    }
    if (line.trim().startsWith('MONGODB_URI=')) {
        hasMongoUri = true;
        console.log(`✅ Line ${index + 1}: MONGODB_URI found`);
    }
});

console.log('\n📊 Validation Results:');
console.log(`NODE_ENV: ${hasNodeEnv ? '✅' : '❌'}`);
console.log(`TESTING_MONGODB_URI: ${hasTestingUri ? '✅' : '❌'}`);
console.log(`MONGODB_URI: ${hasMongoUri ? '✅' : '❌'}`);

if (!hasNodeEnv) {
    console.log('\n🔧 Adding NODE_ENV to .env file');
    fs.appendFileSync('.env', '\nNODE_ENV=development\n');
}

if (!hasTestingUri) {
    console.log('🔧 Adding TESTING_MONGODB_URI to .env file');
    fs.appendFileSync('.env', '\nTESTING_MONGODB_URI=mongodb://localhost:27017/indigorhapsody_test\n');
}

if (!hasMongoUri) {
    console.log('🔧 Adding MONGODB_URI to .env file');
    fs.appendFileSync('.env', '\nMONGODB_URI=mongodb://localhost:27017/indigorhapsody_prod\n');
}

console.log('\n✅ Environment configuration fixed!');
console.log('Now try running: npm start');
