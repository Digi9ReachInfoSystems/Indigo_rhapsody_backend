const axios = require('axios');

async function testRazorpayFix() {
    const applicationId = '68f89eff9be127308581fed8';
    const url = `http://localhost:5000/stylist-application/payment/initiate/${applicationId}`;

    try {
        console.log('🔧 Testing Razorpay integration fix...');
        console.log('URL:', url);
        console.log('Application ID:', applicationId);

        const response = await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ SUCCESS! Payment initiated successfully');
        console.log('Status:', response.status);
        console.log('\n📋 Response Data:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data.paymentOptions) {
            console.log('\n🎯 Razorpay Payment Options:');
            console.log('Order ID:', response.data.data.paymentOptions.order_id);
            console.log('Amount:', response.data.data.paymentOptions.amount);
            console.log('Currency:', response.data.data.paymentOptions.currency);
            console.log('Description:', response.data.data.paymentOptions.description);
            console.log('Receipt Length:', response.data.data.paymentOptions.order_id.length);
            console.log('\n✅ Integration is working correctly!');
        }

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
testRazorpayFix();
