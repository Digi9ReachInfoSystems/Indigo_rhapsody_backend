# PhonePe Legacy API Integration Guide (X-VERIFY Method)

## ✅ **Successfully Integrated!**

The PhonePe Legacy API v1 with X-VERIFY header authentication has been fully integrated.

---

## 🔌 **API Endpoint**

### PhonePe Official Legacy Endpoint
```
POST https://api.phonepe.com/apis/hermes/pg/v1/pay
```

**Headers:**
- `Content-Type: application/json`
- `X-VERIFY: {hash}###1`
- `accept: application/json`

**Request Body:**
```json
{
  "request": "<base64_encoded_payload>"
}
```

---

## 🚀 **Your Backend Endpoint**

### Create PhonePe Payment (Legacy API)

**Endpoint**: `POST /order/payment/phonepe/legacy`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "68ccf8d9c585b659b38bc7ed",
  "cartId": "68ccf9196fdf60f32f91a100",
  "orderId": "optional",
  "amount": "1299.99",
  "currency": "INR",
  "customerDetails": {
    "name": "Rajat",
    "email": "rajatjiedm@gmail.com",
    "phone": "9876543210",
    "address": "c 1304 apex athena sec 75 noida"
  },
  "description": "Payment for order",
  "notes": "Optional notes"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully via PhonePe Legacy API",
  "data": {
    "paymentId": "mongodb_payment_id",
    "paymentReferenceId": "PAY_1703123456789_abc123def",
    "orderId": "ORD_1703123456789_xyz789ghi",
    "merchantTransactionId": "ORD_1703123456789_xyz789ghi",
    "transactionId": "T2024012012345678",
    "paymentMethod": "phonepe",
    "amount": 1299.99,
    "currency": "INR",
    "redirectUrl": "https://mercury.phonepe.com/transact/...",
    "paymentUrl": "https://mercury.phonepe.com/transact/..."
  }
}
```

---

## 🔐 **X-VERIFY Header Generation**

### How X-VERIFY is Generated

#### Step 1: Create Payload
```javascript
const payload = {
  merchantId: "M1LA2M87XNOE",
  merchantTransactionId: "ORD_123456789",
  merchantUserId: "user_id",
  amount: 129999, // in paise (1299.99 * 100)
  redirectUrl: "https://your-site.com/callback",
  redirectMode: "POST",
  callbackUrl: "https://your-api.com/webhook",
  mobileNumber: "9876543210",
  email: "user@example.com",
  paymentInstrument: { type: "PAY_PAGE" }
};
```

#### Step 2: Convert to Base64
```javascript
const jsonString = JSON.stringify(payload);
const base64String = Buffer.from(jsonString).toString("base64");
```

#### Step 3: Generate SHA256 Hash
```javascript
const data = base64String + "/pg/v1/pay" + saltKey;
const hash = sha256(data);
```

#### Step 4: Create X-VERIFY Header
```javascript
const xVerify = hash + "###1";
// Example: "a1b2c3d4e5f6...xyz###1"
```

#### Step 5: Send Request
```javascript
POST https://api.phonepe.com/apis/hermes/pg/v1/pay
Headers:
  Content-Type: application/json
  X-VERIFY: {hash}###1
Body:
  { "request": "{base64String}" }
```

---

## 🛠️ **Technical Implementation**

### PhonePe Service Methods

#### 1. Generate SHA256 Hash
```javascript
generateSHA256(data) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(data).digest("hex");
}
```

#### 2. Generate X-VERIFY for Payment
```javascript
generateXVerifyForPay(base64Payload) {
  const data = base64Payload + "/pg/v1/pay" + this.saltKey;
  const hash = this.generateSHA256(data);
  return `${hash}###${this.saltIndex}`;
}
```

#### 3. Create Payment (Legacy)
```javascript
async createPaymentLegacy(paymentData) {
  // 1. Build payload
  const payload = {
    merchantId: this.merchantId,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: merchantUserId,
    amount: Math.round(parseFloat(amount) * 100),
    redirectUrl: this.redirectUrl,
    redirectMode: "POST",
    callbackUrl: this.callbackUrl,
    mobileNumber: mobileNumber,
    email: email,
    paymentInstrument: { type: "PAY_PAGE" }
  };

  // 2. Convert to base64
  const base64String = Buffer.from(JSON.stringify(payload)).toString("base64");

  // 3. Generate X-VERIFY
  const xVerify = this.generateXVerifyForPay(base64String);

  // 4. Call API
  const response = await axios.post(
    `${this.legacyBaseUrl}/pg/v1/pay`,
    { request: base64String },
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "accept": "application/json"
      }
    }
  );

  return response;
}
```

#### 4. Check Status (Legacy)
```javascript
async checkPaymentStatusLegacy(merchantTransactionId) {
  const xVerify = this.generateXVerifyForStatus(merchantTransactionId);
  
  const response = await axios.get(
    `${this.legacyBaseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "accept": "application/json"
      }
    }
  );

  return response;
}
```

---

## 📊 **Configuration**

### Environment Variables (Optional)

```env
# Legacy API Configuration
PHONEPE_MERCHANT_ID=M1LA2M87XNOE
PHONEPE_SALT_KEY=6362bd9f-17b6-4eb2-b030-1ebbb78ce518
PHONEPE_SALT_INDEX=1
PHONEPE_LEGACY_BASE_URL=https://api.phonepe.com/apis/hermes

# Redirect URLs
PHONEPE_REDIRECT_URL=https://your-site.com/payment/callback
PHONEPE_CALLBACK_URL=https://your-api.com/order/payment/webhook/phonepe
```

---

## 🧪 **Testing**

### Test 1: Create Payment (Legacy API)

```bash
curl -X POST "http://localhost:5000/order/payment/phonepe/legacy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "cartId": "68ccf9196fdf60f32f91a100",
    "amount": "1299.99",
    "currency": "INR",
    "customerDetails": {
      "name": "Rajat",
      "email": "rajatjiedm@gmail.com",
      "phone": "9876543210",
      "address": "c 1304 apex athena sec 75 noida"
    },
    "description": "Test payment via legacy API",
    "notes": "Testing X-VERIFY method"
  }'
```

### Test 2: With Custom Order ID

```bash
curl -X POST "http://localhost:5000/order/payment/phonepe/legacy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "cartId": "68ccf9196fdf60f32f91a100",
    "orderId": "CUSTOM_ORDER_12345",
    "amount": 2499.50,
    "customerDetails": {
      "name": "Rajat",
      "email": "rajatjiedm@gmail.com",
      "phone": "9876543210"
    }
  }'
```

---

## 📋 **Request/Response Flow**

### Complete Flow Diagram

```
1. Client Request
   ↓
   POST /order/payment/phonepe/legacy
   Body: { userId, amount, phone, ... }
   
2. Validate Input
   ↓
   - Check userId, amount, phone
   - Parse and validate amount
   
3. Generate IDs
   ↓
   - paymentReferenceId: PAY_xxx
   - orderId: ORD_xxx (or use provided)
   
4. Build PhonePe Payload
   ↓
   {
     merchantId: "M1LA2M87XNOE",
     merchantTransactionId: "ORD_xxx",
     merchantUserId: "user_id",
     amount: 129999, // paise
     mobileNumber: "9876543210",
     email: "user@example.com",
     ...
   }
   
5. Convert to Base64
   ↓
   base64String = Buffer.from(JSON.stringify(payload)).toString("base64")
   
6. Generate X-VERIFY
   ↓
   data = base64String + "/pg/v1/pay" + saltKey
   hash = SHA256(data)
   xVerify = hash + "###1"
   
7. Call PhonePe API
   ↓
   POST https://api.phonepe.com/apis/hermes/pg/v1/pay
   Headers: { X-VERIFY: xVerify }
   Body: { request: base64String }
   
8. Save to Database
   ↓
   PaymentDetails.create({
     orderId, amount, status: "initiated", ...
   })
   
9. Return Response
   ↓
   {
     success: true,
     data: {
       redirectUrl: "https://mercury.phonepe.com/...",
       orderId: "ORD_xxx",
       ...
     }
   }
```

---

## 🎯 **Key Features**

✅ **X-VERIFY Authentication** - SHA256 hash-based security  
✅ **Base64 Encoding** - Payload encoded as per PhonePe specs  
✅ **Decimal Amount Support** - Handles amounts like 1299.99  
✅ **Auto-generated Order ID** - Creates orderId if not provided  
✅ **Database Storage** - Saves payment details  
✅ **Email Support** - Optional email field  
✅ **Error Handling** - Comprehensive error responses  
✅ **Logging** - Detailed console logs for debugging  

---

## 🔍 **Differences: Legacy vs OAuth API**

| Feature | Legacy API (v1) | OAuth API (v2) |
|---------|-----------------|----------------|
| Endpoint | `/pg/v1/pay` | `/checkout/v2/pay` |
| Authentication | X-VERIFY header | O-Bearer token |
| Hash Method | SHA256 | OAuth token |
| Base64 Encoding | ✅ Yes | ❌ No |
| Request Body | `{ request: base64 }` | Direct JSON |
| Status Check | `/pg/v1/status` | `/checkout/v2/order/:id/status` |

---

## 💡 **When to Use Which API**

### Use Legacy API (v1) When:
- ✅ PhonePe merchant account is older
- ✅ You have merchantId and saltKey
- ✅ You need X-VERIFY authentication
- ✅ Your production setup uses legacy API

### Use OAuth API (v2) When:
- ✅ PhonePe merchant account is newer
- ✅ You have clientId and clientSecret
- ✅ You prefer OAuth token authentication
- ✅ Recommended for new integrations

---

## 🔐 **Security Details**

### X-VERIFY Generation Logic

```javascript
// Input
base64Payload = "eyJtZXJjaGFudElkIjoi..."
saltKey = "6362bd9f-17b6-4eb2-b030-1ebbb78ce518"
saltIndex = "1"

// Concatenate
data = base64Payload + "/pg/v1/pay" + saltKey

// Hash
hash = SHA256(data)
// Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."

// Format
xVerify = hash + "###" + saltIndex
// Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...###1"
```

### Base64 Payload Example

**Original Payload:**
```json
{
  "merchantId": "M1LA2M87XNOE",
  "merchantTransactionId": "ORD_123456789",
  "merchantUserId": "user_123",
  "amount": 129999,
  "redirectUrl": "https://yoursite.com",
  "redirectMode": "POST",
  "callbackUrl": "https://api.yoursite.com/webhook",
  "mobileNumber": "9876543210",
  "email": "user@example.com",
  "paymentInstrument": { "type": "PAY_PAGE" }
}
```

**Base64 Encoded:**
```
eyJtZXJjaGFudElkIjoiTTFMQTJNODdYTk9FIiwibWVyY2hhbnRUcmFuc2FjdGlvbklkIjoiT1JEXzEyMzQ1Njc4OSIsIm1lcmNoYW50VXNlcklkIjoidXNlcl8xMjMiLCJhbW91bnQiOjEyOTk5OSwicmVkaXJlY3RVcmwiOiJodHRwczovL3lvdXJzaXRlLmNvbSIsInJlZGlyZWN0TW9kZSI6IlBPU1QiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vYXBpLnlvdXJzaXRlLmNvbS93ZWJob29rIiwibW9iaWxlTnVtYmVyIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBheW1lbnRJbnN0cnVtZW50Ijp7InR5cGUiOiJQQVlfUEFHRSJ9fQ==
```

---

## 📝 **Field Descriptions**

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| userId | String | User's MongoDB ID | "68ccf8d9c585b659b38bc7ed" |
| amount | String/Number | Payment amount | "1299.99" or 1299.99 |
| phone | String | Mobile number | "9876543210" |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| cartId | String | Cart ID | "68ccf9196fdf60f32f91a100" |
| orderId | String | Custom order ID | "CUSTOM_ORDER_123" |
| currency | String | Currency code | "INR" (default) |
| email | String | User email | "user@example.com" |
| name | String | Customer name | "Rajat" |
| address | String/Object | Address | "123 Main St" |
| description | String | Payment description | "Order payment" |
| notes | String | Additional notes | "Test payment" |

---

## 🔄 **Complete Implementation Details**

### PhonePe Payload Structure

```javascript
{
  merchantId: "M1LA2M87XNOE",
  merchantTransactionId: "ORD_1703123456789_xyz",
  merchantUserId: "user_id",
  amount: 129999,  // Amount in paise
  redirectUrl: "https://yoursite.com/callback",
  redirectMode: "POST",
  callbackUrl: "https://api.yoursite.com/webhook/phonepe",
  mobileNumber: "9876543210",
  email: "user@example.com",  // Optional
  paymentInstrument: {
    type: "PAY_PAGE"
  }
}
```

### X-VERIFY Calculation Example

```javascript
// Payload after base64 encoding
const base64 = "eyJtZXJjaGFudElkIjoiTTFMQT...";

// Concatenate with path and salt
const data = base64 + "/pg/v1/pay" + "6362bd9f-17b6-4eb2-b030-1ebbb78ce518";

// Generate SHA256 hash
const hash = crypto.createHash('sha256').update(data).digest('hex');
// Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

// Add salt index
const xVerify = hash + "###1";
// Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6###1"
```

---

## 🎨 **Frontend Integration**

### React/Next.js Example

```javascript
const initiatePhonePePayment = async (paymentDetails) => {
  try {
    const response = await fetch('/api/order/payment/phonepe/legacy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user._id,
        cartId: cart._id,
        amount: cart.total_amount,
        customerDetails: {
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber,
          address: shippingAddress
        },
        description: `Payment for ${cart.products.length} items`
      })
    });

    const data = await response.json();

    if (data.success && data.data.redirectUrl) {
      // Redirect user to PhonePe payment page
      window.location.href = data.data.redirectUrl;
    } else {
      console.error('Payment initiation failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Mobile App Example (React Native)

```javascript
import { Linking } from 'react-native';

const initiatePhonePePayment = async (paymentDetails) => {
  try {
    const response = await fetch(
      'https://your-api.com/order/payment/phonepe/legacy',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          amount: totalAmount,
          customerDetails: {
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        })
      }
    );

    const data = await response.json();

    if (data.success && data.data.redirectUrl) {
      // Open PhonePe payment page
      await Linking.openURL(data.data.redirectUrl);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

---

## 🔍 **Check Payment Status (Legacy)**

### Using Service Method

```javascript
const phonepeService = require('../service/phonepeService');

const merchantTransactionId = "ORD_1703123456789_xyz";
const status = await phonepeService.checkPaymentStatusLegacy(merchantTransactionId);

console.log(status);
// {
//   success: true,
//   data: {
//     merchantTransactionId: "ORD_xxx",
//     transactionId: "T123456789",
//     amount: 1299.99,
//     status: "PAYMENT_SUCCESS",
//     responseCode: "SUCCESS",
//     responseMessage: "Payment completed successfully"
//   }
// }
```

---

## 📊 **Comparison with OAuth API**

### Your Backend Now Supports BOTH APIs:

#### **1. Legacy API (X-VERIFY)**
```
POST /order/payment/phonepe/legacy
```
- Uses X-VERIFY header
- Base64 encoded payload
- SHA256 hash authentication
- Production URL: https://api.phonepe.com/apis/hermes

#### **2. OAuth API (O-Bearer)**
```
POST /order/payment/create
Body: { paymentMethod: "phonepe", ... }
```
- Uses O-Bearer token
- Direct JSON payload
- OAuth 2.0 authentication
- Sandbox URL: https://api-preprod.phonepe.com

---

## ⚠️ **Important Notes**

1. **Merchant Credentials**: Ensure you have correct merchantId and saltKey
2. **Salt Key Security**: Keep saltKey secret, never expose in client code
3. **Production URL**: Update `PHONEPE_LEGACY_BASE_URL` for production
4. **Amount Format**: Always in paise (multiply by 100)
5. **Phone Number**: Required field for legacy API
6. **Callback URL**: Must be publicly accessible HTTPS URL

---

## 🔧 **Configuration Setup**

### .env File

```env
# PhonePe Legacy API Configuration
PHONEPE_MERCHANT_ID=M1LA2M87XNOE
PHONEPE_SALT_KEY=6362bd9f-17b6-4eb2-b030-1ebbb78ce518
PHONEPE_SALT_INDEX=1
PHONEPE_LEGACY_BASE_URL=https://api.phonepe.com/apis/hermes

# URLs
PHONEPE_REDIRECT_URL=https://your-frontend.com/payment/callback
PHONEPE_CALLBACK_URL=https://your-backend.com/order/payment/webhook/phonepe
```

---

## ✅ **Summary**

### What Was Implemented:

1. ✅ **SHA256 Hash Generation** - For X-VERIFY header
2. ✅ **Base64 Encoding** - Payload encoding
3. ✅ **X-VERIFY Header Generation** - Security hash
4. ✅ **Legacy Payment Creation** - `/pg/v1/pay` endpoint
5. ✅ **Legacy Status Check** - `/pg/v1/status` endpoint
6. ✅ **Controller Endpoint** - `POST /order/payment/phonepe/legacy`
7. ✅ **Database Integration** - Saves payment details
8. ✅ **Error Handling** - Comprehensive error responses
9. ✅ **Logging** - Debug logs for troubleshooting

---

### Files Modified:

1. ✅ **src/service/phonepeService.js** - Added legacy API methods
2. ✅ **src/controllers/orderController.js** - Added controller endpoint
3. ✅ **src/routes/orderRoutes.js** - Added route
4. ✅ **PHONEPE_LEGACY_API_GUIDE.md** - This documentation

---

**PhonePe Legacy API v1 with X-VERIFY is now fully integrated and ready to use!** 🎉

Test it with:
```
POST /order/payment/phonepe/legacy
```

