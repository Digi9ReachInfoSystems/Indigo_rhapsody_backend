// Simple Environment Test
require('dotenv').config();

console.log('🔍 Environment Test');
console.log('==================');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TESTING_MONGODB_URI:', process.env.TESTING_MONGODB_URI ? 'Set' : 'Not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Test the logic
const NODE_ENV = process.env.NODE_ENV || "development";
console.log('\nLogic Test:');
console.log('NODE_ENV === "development":', NODE_ENV === "development");

if (NODE_ENV === "development") {
    const testingUri = process.env.TESTING_MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI;

    console.log('TESTING_MONGODB_URI exists:', !!testingUri);
    console.log('MONGODB_URI exists:', !!fallbackUri);

    if (testingUri) {
        console.log('✅ Would use TESTING_MONGODB_URI');
    } else if (fallbackUri) {
        console.log('⚠️  Would use MONGODB_URI (fallback)');
    } else {
        console.log('❌ No URI found');
    }
}
