# Razorpay Integration Guide for Stylist Application

## Overview

This guide explains how to test and use the Razorpay payment integration for stylist applications.

## Environment Setup

### 1. Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Install Dependencies

Make sure you have the Razorpay package installed:

```bash
npm install razorpay
```

## API Endpoint

### Payment Initiation

**Endpoint:** `POST http://localhost:5000/stylist-application/payment/initiate/{applicationId}`

**Example Request:**
```bash
curl -X POST http://localhost:5000/stylist-application/payment/initiate/68f89eff9be127308581fed8 \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "applicationId": "68f89eff9be127308581fed8",
    "orderId": "order_123456789",
    "amount": 500,
    "currency": "INR",
    "paymentOptions": {
      "key": "your_razorpay_key_id",
      "amount": 50000,
      "currency": "INR",
      "name": "IndigoRhapsody",
      "description": "Stylist Registration Fee - John Doe",
      "order_id": "order_123456789",
      "prefill": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "contact": "+919876543210"
      },
      "notes": {
        "applicationId": "68f89eff9be127308581fed8",
        "stylistName": "John Doe",
        "type": "stylist_registration"
      },
      "theme": {
        "color": "#3399cc"
      }
    },
    "expiresIn": 1800
  }
}
```

## Testing Methods

### 1. Using the HTML Test Page

1. Open `test-razorpay-payment.html` in your browser
2. Enter the application ID: `68f89eff9be127308581fed8`
3. Click "Initiate Payment"
4. The Razorpay checkout will open automatically

### 2. Using the Node.js Test Script

```bash
node test-payment-initiate.js
```

### 3. Using cURL

```bash
curl -X POST http://localhost:5000/stylist-application/payment/initiate/68f89eff9be127308581fed8 \
  -H "Content-Type: application/json" \
  -v
```

### 4. Using Postman

1. Create a new POST request
2. URL: `http://localhost:5000/stylist-application/payment/initiate/68f89eff9be127308581fed8`
3. Headers: `Content-Type: application/json`
4. Send the request

## Frontend Integration

### HTML/JavaScript Integration

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <script>
        async function initiatePayment() {
            try {
                const response = await fetch('/stylist-application/payment/initiate/68f89eff9be127308581fed8', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const options = data.data.paymentOptions;
                    const razorpay = new Razorpay(options);
                    
                    razorpay.on('payment.success', function (response) {
                        console.log('Payment successful:', response);
                        // Handle successful payment
                    });
                    
                    razorpay.on('payment.error', function (error) {
                        console.error('Payment failed:', error);
                        // Handle payment error
                    });
                    
                    razorpay.open();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    </script>
    
    <button onclick="initiatePayment()">Pay Now</button>
</body>
</html>
```

### React Integration

```jsx
import React from 'react';

const PaymentComponent = () => {
    const initiatePayment = async () => {
        try {
            const response = await fetch('/stylist-application/payment/initiate/68f89eff9be127308581fed8', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                const options = data.data.paymentOptions;
                const razorpay = new window.Razorpay(options);
                
                razorpay.on('payment.success', function (response) {
                    console.log('Payment successful:', response);
                });
                
                razorpay.on('payment.error', function (error) {
                    console.error('Payment failed:', error);
                });
                
                razorpay.open();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <button onClick={initiatePayment}>
            Pay Now
        </button>
    );
};

export default PaymentComponent;
```

### Flutter Integration

```dart
import 'package:razorpay_flutter/razorpay_flutter.dart';

class PaymentService {
  late Razorpay _razorpay;
  
  void initPayment() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  }
  
  Future<void> initiatePayment(String applicationId) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/stylist-application/payment/initiate/$applicationId'),
        headers: {'Content-Type': 'application/json'},
      );
      
      final data = json.decode(response.body);
      
      if (data['success']) {
        final paymentOptions = data['data']['paymentOptions'];
        _razorpay.open(paymentOptions);
      }
    } catch (e) {
      print('Error: $e');
    }
  }
  
  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    print('Payment successful: ${response.paymentId}');
  }
  
  void _handlePaymentError(PaymentFailureResponse response) {
    print('Payment failed: ${response.message}');
  }
}
```

## Payment Flow

1. **Initiate Payment**: Call the payment initiation endpoint
2. **Get Payment Options**: Receive Razorpay payment options
3. **Open Checkout**: Use Razorpay checkout to collect payment
4. **Handle Response**: Process payment success/failure
5. **Verify Payment**: Verify payment on your backend

## Error Handling

### Common Errors

1. **Invalid Application ID**: Application not found
2. **Payment Already Completed**: Application already paid
3. **Invalid Status**: Application not in correct status for payment
4. **Razorpay Error**: Payment gateway error

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Security Considerations

1. **Environment Variables**: Never expose Razorpay keys in client-side code
2. **Payment Verification**: Always verify payments on the backend
3. **HTTPS**: Use HTTPS in production
4. **Input Validation**: Validate all inputs before processing

## Testing with Test Cards

Razorpay provides test cards for testing:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Production Deployment

1. **Update Environment Variables**: Use production Razorpay keys
2. **Update URLs**: Change localhost URLs to production URLs
3. **Enable Webhooks**: Set up Razorpay webhooks for payment verification
4. **SSL Certificate**: Ensure HTTPS is enabled

## Webhook Integration

For production, set up Razorpay webhooks to handle payment events:

```javascript
// Webhook endpoint
app.post('/razorpay/webhook', (req, res) => {
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
        // Handle successful payment
        const { order_id, payment_id } = payload.payment.entity;
        // Update application status
    }
    
    res.status(200).json({ received: true });
});
```

This integration provides a complete payment solution for your stylist application system!
