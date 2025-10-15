# PhonePe Webhook New Format Integration

## ✅ **Updated PhonePe Webhook Handler**

The PhonePe webhook handler has been updated to handle the new webhook response format with comprehensive order creation logic.

---

## 🎯 **New Webhook Format**

### PhonePe Webhook Structure
```json
{
    "event": "checkout.order.completed",
    "payload": {
        "orderId": "OMO2403282020198641071317",
        "merchantId": "merchantId",
        "merchantOrderId": "ORD_1703123456789_xyz",
        "state": "COMPLETED",
        "amount": 10000,
        "expireAt": 1724866793837,
        "metaInfo": {
            "udf1": "",
            "udf2": "",
            "udf3": "",
            "udf4": ""
        },
        "paymentDetails": [
            {
                "paymentMode": "UPI_QR",
                "transactionId": "OM12334",
                "timestamp": 1724866793837,
                "amount": 10000,
                "state": "COMPLETED"
            }
        ]
    }
}
```

---

## 🔄 **Processing Flow**

### Step 1: Webhook Reception
```
PhonePe → POST /order/payment/webhook/phonepe
Content-Type: application/json
Body: { event: "checkout.order.completed", payload: {...} }
```

### Step 2: Data Parsing
```javascript
// In phonepeService.js - handlePaymentCallback()
const { payload } = callbackData;
const paymentDetails = payload.paymentDetails[0];

const responseData = {
  orderId: payload.orderId,
  merchantOrderId: payload.merchantOrderId,
  state: payload.state,
  amount: payload.amount,
  transactionId: paymentDetails?.transactionId,
  paymentMode: paymentDetails?.paymentMode,
  status: payload.state === "COMPLETED" ? "COMPLETED" : "FAILED"
};
```

### Step 3: Database Update
```javascript
// Update payment record
const updateData = {
  status: status.toLowerCase(),
  paymentStatus: status === "COMPLETED" ? "Completed" : "Failed",
  paymentId: orderId,
  responseCode: responseCode,
  responseMessage: responseMessage,
  updatedAt: new Date()
};

// Try to find by transactionId first, then by orderId
let updatedPayment = await PaymentDetails.findOneAndUpdate(
  { transactionId: transactionId },
  updateData,
  { new: true }
);

if (!updatedPayment) {
  updatedPayment = await PaymentDetails.findOneAndUpdate(
    { orderId: merchantOrderId },
    updateData,
    { new: true }
  );
}
```

### Step 4: Order Creation
```javascript
// If payment is successful, create order
if (status === "COMPLETED") {
  const orderRequest = {
    body: {
      userId: paymentRecord.userId,
      cartId: paymentRecord.cartId,
      paymentMethod: "PhonePe",
      shippingDetails: {},
      notes: `Payment completed via PhonePe - Order ID: ${paymentRecord.orderId}`
    }
  };
  
  const orderResult = await createOrder(orderRequest, res);
}
```

---

## 📊 **Response Format**

### Successful Webhook Response
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "orderId": "OMO2403282020198641071317",
    "merchantOrderId": "ORD_1703123456789_xyz",
    "state": "COMPLETED",
    "amount": 10000,
    "transactionId": "OM12334",
    "paymentMode": "UPI_QR",
    "status": "COMPLETED",
    "shouldCreateOrder": true,
    "orderCreated": true,
    "paymentRecord": {
      "id": "payment_record_id",
      "userId": "user_id",
      "cartId": "cart_id",
      "orderId": "ORD_1703123456789_xyz",
      "amount": 10000
    }
  }
}
```

### Failed Webhook Response
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "orderId": "OMO2403282020198641071318",
    "merchantOrderId": "ORD_1703123456789_abc",
    "state": "FAILED",
    "amount": 5000,
    "transactionId": "OM12335",
    "paymentMode": "UPI_QR",
    "status": "FAILED",
    "shouldCreateOrder": false,
    "paymentRecord": {
      "id": "payment_record_id",
      "userId": "user_id",
      "cartId": "cart_id",
      "orderId": "ORD_1703123456789_abc",
      "amount": 5000
    }
  }
}
```

---

## 🧪 **Testing the Webhook**

### Test Successful Payment
```bash
curl -X POST "http://localhost:5000/order/payment/webhook/phonepe" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "checkout.order.completed",
    "payload": {
        "orderId": "OMO2403282020198641071317",
        "merchantId": "merchantId",
        "merchantOrderId": "ORD_1703123456789_xyz",
        "state": "COMPLETED",
        "amount": 10000,
        "expireAt": 1724866793837,
        "metaInfo": {
            "udf1": "",
            "udf2": "",
            "udf3": "",
            "udf4": ""
        },
        "paymentDetails": [
            {
                "paymentMode": "UPI_QR",
                "transactionId": "OM12334",
                "timestamp": 1724866793837,
                "amount": 10000,
                "state": "COMPLETED"
            }
        ]
    }
}'
```

### Test Failed Payment
```bash
curl -X POST "http://localhost:5000/order/payment/webhook/phonepe" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "checkout.order.completed",
    "payload": {
        "orderId": "OMO2403282020198641071318",
        "merchantId": "merchantId",
        "merchantOrderId": "ORD_1703123456789_abc",
        "state": "FAILED",
        "amount": 5000,
        "expireAt": 1724866793837,
        "metaInfo": {
            "udf1": "",
            "udf2": "",
            "udf3": "",
            "udf4": ""
        },
        "paymentDetails": [
            {
                "paymentMode": "UPI_QR",
                "transactionId": "OM12335",
                "timestamp": 1724866793837,
                "amount": 5000,
                "state": "FAILED"
            }
        ]
    }
}'
```

---

## 🔍 **Key Features**

### 1. **Dual Lookup Strategy**
- First tries to find payment record by `transactionId`
- Falls back to finding by `merchantOrderId` if not found
- Ensures robust payment record matching

### 2. **Comprehensive Data Extraction**
- Extracts all relevant fields from new webhook format
- Handles multiple payment details
- Preserves meta information

### 3. **Automatic Order Creation**
- Creates order automatically when payment is successful
- Links order to payment record
- Includes payment details in order notes

### 4. **Error Handling**
- Graceful handling of missing payment records
- Database error recovery
- Detailed logging for debugging

### 5. **Legacy Support**
- Maintains backward compatibility with old webhook format
- Fallback processing for legacy data

---

## 📋 **Supported Payment States**

| State | Description | Order Creation |
|-------|-------------|----------------|
| `COMPLETED` | Payment successful | ✅ Yes |
| `FAILED` | Payment failed | ❌ No |
| `PENDING` | Payment pending | ❌ No |
| `CANCELLED` | Payment cancelled | ❌ No |

---

## 💳 **Supported Payment Modes**

| Payment Mode | Description |
|--------------|-------------|
| `UPI_QR` | UPI QR Code |
| `UPI_PAY` | UPI Payment |
| `CREDIT_CARD` | Credit Card |
| `DEBIT_CARD` | Debit Card |
| `NET_BANKING` | Net Banking |
| `WALLET` | Digital Wallet |
| `EMI` | EMI Payment |

---

## 🔧 **Configuration**

### Environment Variables
```env
# PhonePe Configuration
PHONEPE_CLIENT_ID=SU2510141432464834659105
PHONEPE_CLIENT_SECRET=089c4f5c-b7e2-4c3a-820d-c1f5ccc5002a
PHONEPE_REDIRECT_URL=http://localhost:3000/payment-status?orderId=
PHONEPE_CALLBACK_URL=https://your-backend.vercel.app/payment/webhook
```

### Webhook Endpoint
```
POST /order/payment/webhook/phonepe
Content-Type: application/json
```

---

## 📝 **Logging**

### Console Output
```
🎯 PhonePe Webhook Received: { ... }
📊 Processing PhonePe Webhook Data:
- Order ID: OMO2403282020198641071317
- Merchant Order ID: ORD_1703123456789_xyz
- Transaction ID: OM12334
- Status: COMPLETED
- Amount: 10000
- Payment Mode: UPI_QR
✅ Payment status updated in database for transaction: OM12334
📋 Updated Payment Record: { ... }
🎉 Payment completed for transaction: OM12334
🛒 Ready to create order for user: user_id
🛒 Creating order from webhook...
✅ Order created successfully from webhook
```

---

## 🚨 **Error Handling**

### Missing Payment Record
```json
{
  "success": true,
  "data": {
    "shouldCreateOrder": false,
    "warning": "Payment record not found in database"
  }
}
```

### Database Error
```json
{
  "success": true,
  "data": {
    "shouldCreateOrder": false,
    "warning": "Database update failed"
  }
}
```

### Order Creation Error
```json
{
  "success": true,
  "data": {
    "orderCreated": false,
    "orderCreationError": "Error message"
  }
}
```

---

## 🔄 **Complete Flow Example**

### 1. Payment Initiation
```javascript
// User initiates payment
const paymentResponse = await fetch('/order/payment/phonepe/legacy', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user_id',
    amount: 10000,
    customerDetails: { phone: '9876543210' }
  })
});

// Response: { redirectUrl: "https://mercury.phonepe.com/transact/..." }
```

### 2. User Pays on PhonePe
```
User completes payment on PhonePe page
```

### 3. PhonePe Sends Webhook
```json
{
  "event": "checkout.order.completed",
  "payload": {
    "orderId": "OMO2403282020198641071317",
    "merchantOrderId": "ORD_1703123456789_xyz",
    "state": "COMPLETED",
    "amount": 10000,
    "paymentDetails": [...]
  }
}
```

### 4. Backend Processing
```
✅ Webhook received
✅ Data parsed and validated
✅ Payment record updated
✅ Order created automatically
✅ Response sent to PhonePe
```

### 5. User Redirected
```
User redirected to: http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz
Frontend checks status and shows success page
```

---

## 📊 **Database Updates**

### PaymentDetails Collection
```javascript
{
  _id: ObjectId,
  userId: "user_id",
  cartId: "cart_id",
  orderId: "ORD_1703123456789_xyz",
  transactionId: "OM12334",
  paymentId: "OMO2403282020198641071317",
  amount: 10000,
  status: "completed",
  paymentStatus: "Completed",
  paymentMethod: "phonepe",
  responseCode: "PAYMENT_SUCCESS",
  responseMessage: "Payment completed successfully",
  completedAt: ISODate,
  updatedAt: ISODate
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  userId: "user_id",
  cartId: "cart_id",
  orderId: "ORD_1703123456789_xyz",
  paymentMethod: "PhonePe",
  totalAmount: 10000,
  status: "confirmed",
  notes: "Payment completed via PhonePe - Order ID: ORD_1703123456789_xyz",
  createdAt: ISODate
}
```

---

## ✅ **Summary**

| Feature | Status |
|---------|--------|
| New Webhook Format Support | ✅ Implemented |
| Automatic Order Creation | ✅ Working |
| Payment Record Updates | ✅ Complete |
| Error Handling | ✅ Robust |
| Legacy Format Support | ✅ Maintained |
| Comprehensive Logging | ✅ Added |
| Testing Suite | ✅ Created |

---

**The PhonePe webhook handler now fully supports the new format and automatically creates orders upon successful payment!** 🎉

The system maintains backward compatibility while providing enhanced functionality for the new webhook structure.
