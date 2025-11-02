const axios = require('axios');

async function testPaymentInitiate() {
    const applicationId = '68f89eff9be127308581fed8';
    const url = `http://localhost:5000/stylist-application/payment/initiate/${applicationId}`;

    try {
        console.log('Testing payment initiation...');
        console.log('URL:', url);

        const response = await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n✅ Payment initiated successfully!');
            console.log('Order ID:', response.data.data.orderId);
            console.log('Amount:', response.data.data.amount);
            console.log('Currency:', response.data.data.currency);
            console.log('\nPayment Options for Razorpay:');
            console.log(JSON.stringify(response.data.data.paymentOptions, null, 2));
        } else {
            console.log('\n❌ Payment initiation failed:', response.data.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testPaymentInitiate();
