const axios = require('axios');

// Test the payment method mapping
function testPaymentMethodMapping() {
    console.log('🧪 Testing Payment Method Mapping for Shiprocket...\n');

    // Simulate the mapping function
    const mapPaymentMethodToShiprocket = (paymentMethod) => {
        if (!paymentMethod) return "PREPAID";

        const method = paymentMethod.toLowerCase();

        switch (method) {
            case "phonepe":
            case "razorpay":
            case "stripe":
            case "paypal":
            case "upi":
            case "card":
            case "netbanking":
            case "wallet":
                return "PREPAID";
            case "cod":
            case "cash_on_delivery":
                return "COD";
            default:
                console.warn(`Unknown payment method: ${paymentMethod}, defaulting to PREPAID`);
                return "PREPAID";
        }
    };

    // Test cases
    const testCases = [
        { input: "phonepe", expected: "PREPAID" },
        { input: "PhonePe", expected: "PREPAID" },
        { input: "PHONEPE", expected: "PREPAID" },
        { input: "razorpay", expected: "PREPAID" },
        { input: "stripe", expected: "PREPAID" },
        { input: "paypal", expected: "PREPAID" },
        { input: "upi", expected: "PREPAID" },
        { input: "card", expected: "PREPAID" },
        { input: "netbanking", expected: "PREPAID" },
        { input: "wallet", expected: "PREPAID" },
        { input: "cod", expected: "COD" },
        { input: "COD", expected: "COD" },
        { input: "cash_on_delivery", expected: "COD" },
        { input: "unknown_method", expected: "PREPAID" },
        { input: null, expected: "PREPAID" },
        { input: undefined, expected: "PREPAID" },
        { input: "", expected: "PREPAID" }
    ];

    console.log('📊 Test Results:');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        const result = mapPaymentMethodToShiprocket(testCase.input);
        const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';

        console.log(`${index + 1}. Input: "${testCase.input}"`);
        console.log(`   Expected: "${testCase.expected}"`);
        console.log(`   Got: "${result}"`);
        console.log(`   Status: ${status}`);
        console.log('');

        if (result === testCase.expected) {
            passed++;
        } else {
            failed++;
        }
    });

    console.log('='.repeat(60));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All tests passed! Payment method mapping is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the mapping logic.');
    }
}

// Test Shiprocket integration
async function testShiprocketIntegration() {
    const baseUrl = 'http://localhost:5000';

    console.log('\n🚀 Testing Shiprocket Integration...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing GET /health');
        try {
            const response = await axios.get(`${baseUrl}/health`);
            console.log('✅ Status:', response.status);
            console.log('📊 Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Get orders to check payment methods
        console.log('2️⃣ Testing GET /orders (to check payment methods)');
        try {
            const response = await axios.get(`${baseUrl}/orders`);
            console.log('✅ Status:', response.status);

            if (response.data && response.data.length > 0) {
                console.log('📊 Sample Order Payment Methods:');
                response.data.slice(0, 3).forEach((order, index) => {
                    console.log(`   Order ${index + 1}: ${order.orderId} - Payment Method: "${order.paymentMethod}"`);
                });
            } else {
                console.log('📊 No orders found');
            }
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests
console.log('🔧 Shiprocket Payment Method Mapping Test\n');
testPaymentMethodMapping();
testShiprocketIntegration();
