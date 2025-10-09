# PhonePe Payment Status API Integration Guide

## ✅ **Successfully Integrated!**

The PhonePe Payment Status Check API has been fully integrated using the official endpoint with `O-Bearer` authentication.

---

## 🔌 **API Endpoint Details**

### PhonePe Official API
```
GET https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/{orderId}/status
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: O-Bearer {access_token}`

**Parameters:**
- `orderId` - The merchant order ID used during payment creation

---

## 🚀 **Backend Endpoints**

### 1. Check PhonePe Order Status (Recommended)

**Endpoint**: `GET /order/payment/phonepe/status/:orderId`

**Description**: Check payment status for a specific PhonePe order and update database

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example Request:**
```bash
curl "http://localhost:5000/order/payment/phonepe/status/ORD_1703123456789_xyz789ghi" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved and updated successfully",
  "data": {
    "orderId": "ORD_1703123456789_xyz789ghi",
    "status": "PAID",
    "amount": 1299.99,
    "responseCode": "SUCCESS",
    "responseMessage": "Payment successful",
    "paymentDetails": {
      "_id": "payment_id",
      "userId": { "displayName": "John Doe", "email": "john@example.com" },
      "cartId": { "total_amount": 1299.99 },
      "orderId": "ORD_1703123456789_xyz789ghi",
      "paymentMethod": "phonepe",
      "amount": 1299.99,
      "paymentStatus": "Completed",
      "status": "completed",
      "completedAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

**Pending Payment Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved and updated successfully",
  "data": {
    "orderId": "ORD_1703123456789_xyz789ghi",
    "status": "PENDING",
    "amount": 1299.99,
    "responseCode": "PENDING",
    "responseMessage": "Payment pending"
  }
}
```

**Failed Payment Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved and updated successfully",
  "data": {
    "orderId": "ORD_1703123456789_xyz789ghi",
    "status": "FAILED",
    "amount": 1299.99,
    "responseCode": "PAYMENT_DECLINED",
    "responseMessage": "Payment declined by user",
    "paymentDetails": {
      "paymentStatus": "FAILED",
      "status": "failed",
      "failedAt": "2024-01-20T10:30:00.000Z",
      "failureReason": "Payment declined by user"
    }
  }
}
```

---

### 2. Generic Payment Verification (Multi-Gateway)

**Endpoint**: `GET /order/payment/verify/:paymentReferenceId/:paymentMethod`

**Description**: Verify payment status for any payment method

**Example Request:**
```bash
curl "http://localhost:5000/order/payment/verify/PAY_1703123456789_abc123def/phonepe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 **Payment Status Values**

### PhonePe Status Codes
| Status | Description | Database Update |
|--------|-------------|-----------------|
| `PAID` | Payment successful | `Completed`, `completedAt` set |
| `SUCCESS` | Payment successful | `Completed`, `completedAt` set |
| `PENDING` | Payment in progress | `Pending`, no timestamp |
| `FAILED` | Payment failed | `Failed`, `failedAt` set |
| `EXPIRED` | Payment link expired | `Failed`, `failedAt` set |
| `CANCELLED` | Payment cancelled by user | `Cancelled`, no timestamp |

---

## 🔄 **How It Works**

### Flow Diagram
```
Client Request
     │
     ▼
GET /order/payment/phonepe/status/:orderId
     │
     ▼
Generate PhonePe OAuth Token
     │
     ▼
Call PhonePe Status API
(https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/:orderId/status)
     │
     ▼
Receive Payment Status
     │
     ▼
Update Database
(PaymentDetails collection)
     │
     ▼
Return Status + Updated Payment Details
```

---

## 🎯 **Use Cases**

### Use Case 1: Check Status After Payment
```javascript
// User completes payment on PhonePe
// Redirect back to your app with orderId

const checkPaymentStatus = async (orderId) => {
  const response = await fetch(
    `/api/order/payment/phonepe/status/${orderId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success && data.data.status === 'PAID') {
    // Payment successful - show success page
    showSuccessPage(data.data);
  } else if (data.data.status === 'PENDING') {
    // Payment pending - wait and retry
    setTimeout(() => checkPaymentStatus(orderId), 5000);
  } else {
    // Payment failed
    showErrorPage(data.data);
  }
};
```

### Use Case 2: Periodic Status Check
```javascript
// Check payment status every 5 seconds for 2 minutes
const pollPaymentStatus = (orderId, maxAttempts = 24) => {
  let attempts = 0;
  
  const interval = setInterval(async () => {
    attempts++;
    
    const response = await fetch(
      `/api/order/payment/phonepe/status/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success && data.data.status === 'PAID') {
      clearInterval(interval);
      handleSuccess(data.data);
    } else if (data.data.status === 'FAILED') {
      clearInterval(interval);
      handleFailure(data.data);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      handleTimeout();
    }
  }, 5000); // Check every 5 seconds
};
```

### Use Case 3: Admin Dashboard Check
```javascript
// Admin checks payment status for any order
const adminCheckStatus = async (orderId) => {
  const response = await fetch(
    `/api/order/payment/phonepe/status/${orderId}`,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );
  
  const data = await response.json();
  
  // Display payment details in admin dashboard
  updateDashboard(data.data);
};
```

---

## 🛠️ **Technical Implementation**

### PhonePe Service (phonepeService.js)

```javascript
// Verify Payment Status
async verifyPayment(orderId) {
  try {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}/checkout/v2/order/${orderId}/status`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,  // ✅ O-Bearer header
      },
    });

    if (response.data?.data) {
      const data = response.data.data;
      return {
        success: true,
        data: {
          orderId: data.orderId,
          amount: data.amount / 100,  // Convert from paise
          status: data.state,
          responseCode: data.responseCode,
          responseMessage: data.responseMessage,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to verify payment",
      error: error.response?.data || error.message,
    };
  }
}
```

### Controller (orderController.js)

```javascript
exports.checkPhonePeOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  
  // Call PhonePe API
  const verificationResponse = await phonepeService.verifyPayment(orderId);
  
  // Update database
  await PaymentDetails.findOneAndUpdate(
    { transactionId: orderId },
    {
      paymentStatus: status === "PAID" ? "Completed" : status,
      status: status === "PAID" ? "completed" : status.toLowerCase(),
      completedAt: status === "PAID" ? new Date() : undefined,
    }
  );
  
  // Return response
  return res.json({ success: true, data: { ...verificationResponse.data } });
};
```

---

## 🔐 **Authentication**

### PhonePe OAuth Token
```javascript
// Automatically generated before each API call
async getAuthToken() {
  const params = new URLSearchParams();
  params.append("client_id", this.clientId);
  params.append("client_version", this.clientVersion);
  params.append("client_secret", this.clientSecret);
  params.append("grant_type", "client_credentials");

  const response = await axios.post(this.authUrl, params);
  return response.data.access_token;
}
```

### JWT Token (Your API)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 **Testing**

### Test 1: Check Successful Payment
```bash
curl -X GET "http://localhost:5000/order/payment/phonepe/status/ORD_1703123456789_xyz789ghi" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Check Pending Payment
```bash
curl -X GET "http://localhost:5000/order/payment/phonepe/status/ORD_PENDING_12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Check Failed Payment
```bash
curl -X GET "http://localhost:5000/order/payment/phonepe/status/ORD_FAILED_12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🎨 **Frontend Integration**

### React Example

```javascript
import { useState, useEffect } from 'react';

const PaymentStatusPage = ({ orderId }) => {
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    checkStatus();
  }, [orderId]);

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `/api/order/payment/phonepe/status/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setPaymentData(data.data);
        setStatus(data.data.status);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus('error');
    }
  };

  if (status === 'checking') {
    return <div>Checking payment status...</div>;
  }

  if (status === 'PAID' || status === 'SUCCESS') {
    return (
      <div className="success">
        <h1>✅ Payment Successful!</h1>
        <p>Amount: ₹{paymentData.amount}</p>
        <p>Order ID: {paymentData.orderId}</p>
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <div className="pending">
        <h1>⏳ Payment Pending</h1>
        <p>Please wait while we confirm your payment...</p>
        <button onClick={checkStatus}>Check Again</button>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="error">
        <h1>❌ Payment Failed</h1>
        <p>{paymentData.responseMessage}</p>
        <button onClick={() => window.location.href = '/retry-payment'}>
          Retry Payment
        </button>
      </div>
    );
  }

  return null;
};

export default PaymentStatusPage;
```

---

## ⚡ **Key Features**

✅ **Real-time Status Check** - Query PhonePe API in real-time  
✅ **Automatic Database Update** - Payment status updated automatically  
✅ **O-Bearer Authentication** - Proper OAuth token handling  
✅ **Error Handling** - Comprehensive error responses  
✅ **Multiple Status Support** - PAID, PENDING, FAILED, CANCELLED  
✅ **Populated Responses** - Includes user and cart details  
✅ **Fallback Handling** - Works even if DB update fails  

---

## 🔍 **Troubleshooting**

### Issue 1: "Failed to verify payment"
**Solution**: Check if PhonePe credentials are correct in `.env` file

### Issue 2: "Payment not found in database"
**Solution**: Ensure the orderId matches the one used during payment creation

### Issue 3: "Unauthorized" error
**Solution**: Verify JWT token is valid and not expired

### Issue 4: PhonePe API returns 404
**Solution**: Order ID might be incorrect or payment not yet initiated

---

## 📊 **Database Updates**

### Payment Successful (PAID/SUCCESS)
```javascript
{
  paymentStatus: "Completed",
  status: "completed",
  completedAt: new Date(),
  updatedAt: new Date()
}
```

### Payment Failed
```javascript
{
  paymentStatus: "FAILED",
  status: "failed",
  failedAt: new Date(),
  failureReason: "Payment declined by user",
  updatedAt: new Date()
}
```

### Payment Pending
```javascript
{
  paymentStatus: "PENDING",
  status: "pending",
  updatedAt: new Date()
}
```

---

## ✅ **Summary**

| Feature | Status |
|---------|--------|
| PhonePe API Integration | ✅ Complete |
| O-Bearer Auth | ✅ Implemented |
| Database Updates | ✅ Automatic |
| Error Handling | ✅ Comprehensive |
| Frontend Ready | ✅ Yes |
| Testing | ✅ Ready |

---

**The PhonePe Payment Status Check API is fully integrated and ready to use!** 🎉

Test it now with:
```bash
GET /order/payment/phonepe/status/:orderId
```

