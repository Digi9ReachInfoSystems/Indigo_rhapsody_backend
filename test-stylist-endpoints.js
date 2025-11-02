const axios = require('axios');

async function testStylistEndpoints() {
    const baseUrl = 'http://localhost:5000';

    console.log('🧪 Testing Stylist Endpoints...\n');

    try {
        // Test 1: Get approved stylists
        console.log('1️⃣ Testing GET /stylist/approved');
        try {
            const response = await axios.get(`${baseUrl}/stylist/approved`);
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Test stylist booking routes
        console.log('2️⃣ Testing GET /stylist-booking/available-slots/:stylistId');
        try {
            const response = await axios.get(`${baseUrl}/stylist-booking/available-slots/68f89eff9be127308581fed8?date=2023-12-25`);
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Health check
        console.log('3️⃣ Testing GET /health');
        try {
            const response = await axios.get(`${baseUrl}/health`);
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests
testStylistEndpoints();
