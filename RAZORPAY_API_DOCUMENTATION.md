# Razorpay Payment Integration API Documentation

## Overview
This document provides API endpoints and examples for testing Razorpay payment integration.

---

## 1. Initiate Razorpay Payment

### Endpoint
```
POST /payment/razorpay/initiate
```

### Description
Creates a Razorpay order and initiates payment. Returns order details needed for client-side Razorpay Checkout integration.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```jsonv
{
  "userId": "507f1f77bcf86cd799439011",
  "cartId": "507f1f77bcf86cd799439012",
  "amount": 1000.00,
  "currency": "INR",
  "notes": {
    "order_description": "Order for products",
    "customer_note": "Please deliver quickly"
  }
}
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | String (ObjectId) | Yes | User ID from your database |
| `cartId` | String (ObjectId) | Yes | Cart ID from your database |
| `amount` | Number | Yes | Payment amount in rupees (e.g., 1000.00) |
| `currency` | String | No | Currency code (default: "INR") |
| `notes` | Object | No | Additional notes/metadata for the order |

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Razorpay payment initiated successfully",
  "data": {
    "orderId": "order_MN8xqJ3xK8xqJ3",
    "amount": 100000,
    "currency": "INR",
    "receipt": "receipt_1703123456789_abc123def456",
    "key": "rzp_live_Rj6UAcYaeqIjZM",
    "transactionId": "abc123def45678901234567890123456",
    "paymentId": "507f1f77bcf86cd799439013"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "message": "userId, cartId, and amount are required"
}
```

#### 404 Not Found - Cart Not Found
```json
{
  "success": false,
  "message": "Cart not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error initiating Razorpay payment",
  "error": "Error message details"
}
```

---

## 2. Razorpay Webhook Endpoint

### Endpoint
```
POST /payment/razorpay/webhook
```

### Description
Handles Razorpay webhook events. This endpoint is called by Razorpay when payment events occur. **Do not call this endpoint manually** - it's for Razorpay's use only.

### Request Headers
```
Content-Type: application/json
X-Razorpay-Signature: <webhook_signature>
```

### Webhook Events Handled
- `payment.captured` - Payment successfully captured
- `order.paid` - Order marked as paid
- `payment.failed` - Payment failed

### Webhook Configuration
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/payment/razorpay/webhook`
3. Select events: `payment.captured`, `order.paid`, `payment.failed`
4. Copy the webhook secret and add to `RAZORPAY_WEBHOOK_SECRET` in environment variables

---

## Testing Examples

### cURL Examples

#### 1. Initiate Payment
```bash
curl -X POST http://localhost:5000/payment/razorpay/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "cartId": "507f1f77bcf86cd799439012",
    "amount": 1000.00,
    "currency": "INR",
    "notes": {
      "order_description": "Test order"
    }
  }'
```

#### 2. With Authentication (if required)
```bash
curl -X POST http://localhost:5000/payment/razorpay/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "cartId": "507f1f77bcf86cd799439012",
    "amount": 1500.50
  }'
```

### Postman Collection

#### Request Configuration
- **Method**: POST
- **URL**: `http://localhost:5000/payment/razorpay/initiate`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "cartId": "507f1f77bcf86cd799439012",
  "amount": 1000.00,
  "currency": "INR",
  "notes": {
    "order_description": "Test payment",
    "customer_note": "Please process quickly"
  }
}
```

---

## Client-Side Integration

After receiving the response from the initiate endpoint, use the data to integrate Razorpay Checkout on the client side:

### HTML Example
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <button id="pay-button">Pay Now</button>

    <script>
        document.getElementById('pay-button').onclick = function() {
            // First, call your API to initiate payment
            fetch('/payment/razorpay/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: '507f1f77bcf86cd799439011',
                    cartId: '507f1f77bcf86cd799439012',
                    amount: 1000.00
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const options = {
                        key: data.data.key,
                        amount: data.data.amount,
                        currency: data.data.currency,
                        name: 'Indigo Rhapsody',
                        description: 'Order Payment',
                        order_id: data.data.orderId,
                        handler: function(response) {
                            // Payment successful
                            console.log('Payment ID:', response.razorpay_payment_id);
                            console.log('Order ID:', response.razorpay_order_id);
                            console.log('Signature:', response.razorpay_signature);
                            
                            // Verify payment on your backend
                            verifyPayment(response);
                        },
                        prefill: {
                            name: 'Customer Name',
                            email: 'customer@example.com',
                            contact: '9999999999'
                        },
                        theme: {
                            color: '#3399cc'
                        }
                    };
                    
                    const rzp = new Razorpay(options);
                    rzp.open();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        };

        function verifyPayment(paymentResponse) {
            fetch('/payment/razorpay/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentResponse)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Payment verified successfully!');
                    // Redirect to success page
                } else {
                    alert('Payment verification failed!');
                }
            });
        }
    </script>
</body>
</html>
```

---

## Complete Payment Flow

### Step 1: Create Cart with Address
Before initiating payment, ensure the cart has complete address information:
```json
{
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phoneNumber": "9876543210"
  }
}
```

### Step 2: Initiate Payment
Call `/payment/razorpay/initiate` with cart details.

### Step 3: Client-Side Payment
Use Razorpay Checkout on the frontend with the order details.

### Step 4: Webhook Processing
Razorpay sends webhook to `/payment/razorpay/webhook`:
- Verifies signature
- Updates payment status
- Creates order automatically if payment successful

### Step 5: Order Confirmation
Order is created automatically and user receives confirmation.

---

## Testing Checklist

- [ ] Cart exists with valid `cartId`
- [ ] Cart has complete address information (street, city, state, pincode)
- [ ] User exists with valid `userId`
- [ ] Amount is a valid number (greater than 0)
- [ ] Razorpay keys are configured in environment variables
- [ ] Webhook secret is configured
- [ ] Webhook URL is configured in Razorpay dashboard

---

## Environment Variables Required

```env
RAZORPAY_KEY_ID=rzp_live_Rj6UAcYaeqIjZM
RAZORPAY_KEY_SECRET=GeZUjkk2wnxPFFyFYMJ2loEy
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

---

## Error Troubleshooting

### Issue: "Cart not found"
- **Solution**: Ensure the `cartId` exists in the database and belongs to the user.

### Issue: "Cart does not have complete address information"
- **Solution**: Update the cart with complete address before initiating payment.

### Issue: "Invalid webhook signature"
- **Solution**: Verify `RAZORPAY_WEBHOOK_SECRET` matches the secret from Razorpay dashboard.

### Issue: "Failed to create Razorpay order"
- **Solution**: Check Razorpay API keys are correct and account is active.

---

## Notes

1. **Amount**: Razorpay expects amount in paise (smallest currency unit). The API automatically converts rupees to paise (multiplies by 100).

2. **Order Creation**: Orders are automatically created when payment is successful via webhook. No manual order creation needed.

3. **Webhook Security**: Always verify webhook signatures to ensure requests are from Razorpay.

4. **Testing**: Use Razorpay test keys for development and live keys for production.

---

## Support

For issues or questions:
- Check Razorpay Dashboard for payment status
- Review server logs for detailed error messages
- Verify environment variables are correctly set

