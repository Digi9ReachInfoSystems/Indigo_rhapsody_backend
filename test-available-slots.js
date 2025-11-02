const axios = require('axios');

async function testAvailableSlots() {
    const stylistId = '68f89eff9be127308581fed8';
    const date = '2023-12-25';
    const duration = 60;
    const url = `http://localhost:5000/stylist-booking/available-slots/${stylistId}?date=${date}&duration=${duration}`;

    try {
        console.log('🧪 Testing Available Slots Endpoint...');
        console.log('URL:', url);
        console.log('Stylist ID:', stylistId);
        console.log('Date:', date);
        console.log('Duration:', duration);

        const response = await axios.get(url);

        console.log('\n✅ SUCCESS! Available slots retrieved');
        console.log('Status:', response.status);
        console.log('\n📊 Response Data:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ ERROR:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testAvailableSlots();
