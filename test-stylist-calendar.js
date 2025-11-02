const axios = require('axios');

async function testStylistCalendar() {
    const baseUrl = 'http://localhost:5000';

    console.log('🧪 Testing Stylist Calendar System...\n');

    try {
        // Test 1: Set availability (requires authentication)
        console.log('1️⃣ Testing POST /stylist-calendar/set-availability');
        try {
            const availabilityData = {
                weeklySchedule: {
                    monday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                    tuesday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                    wednesday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                    thursday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                    friday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                    saturday: { isAvailable: true, startTime: "10:00", endTime: "16:00", breaks: [] },
                    sunday: { isAvailable: false, startTime: "09:00", endTime: "18:00", breaks: [] }
                },
                bookingPreferences: {
                    minAdvanceBooking: 2,
                    maxAdvanceBooking: 30,
                    slotDuration: 60,
                    maxBookingsPerDay: 8,
                    bufferTime: 15
                }
            };

            const response = await axios.post(`${baseUrl}/stylist-calendar/set-availability`, availabilityData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
                }
            });
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error (Expected - needs authentication):', error.response?.data?.message || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Get availability
        console.log('2️⃣ Testing GET /stylist-calendar/get-availability');
        try {
            const response = await axios.get(`${baseUrl}/stylist-calendar/get-availability`, {
                headers: {
                    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
                }
            });
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error (Expected - needs authentication):', error.response?.data?.message || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Test available slots (should work now with default availability)
        console.log('3️⃣ Testing GET /stylist-booking/available-slots/:stylistId');
        try {
            const response = await axios.get(`${baseUrl}/stylist-booking/available-slots/68f89eff9be127308581fed8?date=2023-12-25&duration=60`);
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Health check
        console.log('4️⃣ Testing GET /health');
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
testStylistCalendar();
