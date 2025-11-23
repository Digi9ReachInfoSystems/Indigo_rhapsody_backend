/**
 * Razorpay Payment Integration Test Script
 * 
 * Usage:
 * 1. Update the USER_ID, CART_ID, and BASE_URL variables
 * 2. Ensure your server is running
 * 3. Run: node test-razorpay-integration.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID
const CART_ID = 'YOUR_CART_ID_HERE'; // Replace with actual cart ID
const AMOUNT = 1000.00;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRazorpayInitiation() {
  log('\n=== Testing Razorpay Payment Initiation ===', 'cyan');
  
  try {
    const requestBody = {
      userId: USER_ID,
      cartId: CART_ID,
      amount: AMOUNT,
      currency: 'INR',
      notes: {
        order_description: 'Test order for Razorpay integration',
        customer_note: 'Please process quickly',
        test: true,
      },
    };

    log('\n📤 Sending request...', 'blue');
    log(`URL: ${BASE_URL}/payment/razorpay/initiate`, 'yellow');
    log(`Body: ${JSON.stringify(requestBody, null, 2)}`, 'yellow');

    const response = await axios.post(
      `${BASE_URL}/payment/razorpay/initiate`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      log('\n✅ Payment initiated successfully!', 'green');
      log('\n📋 Response Data:', 'cyan');
      console.log(JSON.stringify(response.data, null, 2));
      
      log('\n💡 Next Steps:', 'blue');
      log('1. Use the orderId in Razorpay Checkout on frontend', 'yellow');
      log(`2. Order ID: ${response.data.data.orderId}`, 'yellow');
      log(`3. Transaction ID: ${response.data.data.transactionId}`, 'yellow');
      log(`4. Payment ID: ${response.data.data.paymentId}`, 'yellow');
      log(`5. Razorpay Key: ${response.data.data.key}`, 'yellow');
      
      return response.data;
    } else {
      log('\n❌ Payment initiation failed!', 'red');
      log(`Error: ${response.data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log('\n❌ Error occurred!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Message: ${error.response.data.message || error.message}`, 'red');
      if (error.response.data.error) {
        log(`Error Details: ${error.response.data.error}`, 'red');
      }
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function testGetPaymentDetails(transactionId) {
  log('\n=== Testing Get Payment Details ===', 'cyan');
  
  try {
    log(`\n📤 Fetching payment details for transaction: ${transactionId}`, 'blue');
    
    const response = await axios.get(
      `${BASE_URL}/payment/transaction/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.paymentDetails) {
      log('\n✅ Payment details retrieved successfully!', 'green');
      log('\n📋 Payment Details:', 'cyan');
      console.log(JSON.stringify(response.data.paymentDetails, null, 2));
      return response.data.paymentDetails;
    } else {
      log('\n❌ Payment details not found!', 'red');
      return null;
    }
  } catch (error) {
    log('\n❌ Error occurred!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function runTests() {
  log('\n🚀 Starting Razorpay Integration Tests', 'cyan');
  log('='.repeat(50), 'cyan');

  // Check if configuration is set
  if (USER_ID === 'YOUR_USER_ID_HERE' || CART_ID === 'YOUR_CART_ID_HERE') {
    log('\n⚠️  WARNING: Please update USER_ID and CART_ID in the script!', 'yellow');
    log('Edit the variables at the top of this file.', 'yellow');
    return;
  }

  // Test 1: Initiate Payment
  const paymentData = await testRazorpayInitiation();
  
  if (paymentData && paymentData.data) {
    // Test 2: Get Payment Details
    await testGetPaymentDetails(paymentData.data.transactionId);
  }

  log('\n' + '='.repeat(50), 'cyan');
  log('✨ Tests completed!', 'cyan');
  log('\n💡 To test the complete flow:', 'blue');
  log('1. Use the orderId in Razorpay Checkout on your frontend', 'yellow');
  log('2. Complete the payment on Razorpay', 'yellow');
  log('3. Webhook will automatically create the order', 'yellow');
  log('4. Check your database for the created order', 'yellow');
}

// Run tests
runTests().catch((error) => {
  log('\n❌ Fatal error:', 'red');
  console.error(error);
  process.exit(1);
});

