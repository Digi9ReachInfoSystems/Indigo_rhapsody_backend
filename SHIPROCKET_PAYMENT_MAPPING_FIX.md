# Shiprocket Payment Method Mapping Fix

## Problem Description

**Issue:** Prepaid orders in Shiprocket were showing as COD (Cash on Delivery) instead of PREPAID.

**Root Cause:** The shipping controller was sending the raw `paymentMethod` value from the order directly to Shiprocket without proper mapping. Shiprocket expects specific values:
- `"PREPAID"` for online payments
- `"COD"` for cash on delivery

## Solution Implemented

### 1. **Payment Method Mapping Function**

Added a mapping function in `src/controllers/shippingController.js`:

```javascript
const mapPaymentMethodToShiprocket = (paymentMethod) => {
  if (!paymentMethod) return "PREPAID"; // Default to PREPAID if no method specified
  
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
```

### 2. **Updated Shipping Controller**

**Before:**
```javascript
payment_method: order.paymentMethod,
```

**After:**
```javascript
payment_method: mapPaymentMethodToShiprocket(order.paymentMethod),
```

### 3. **Fixed Both Order Creation and Return Order Creation**

- **Regular Orders:** Line 140 in shipping controller
- **Return Orders:** Line 616 in shipping controller

## Payment Method Mapping Table

| Your System Value | Shiprocket Value | Description |
|------------------|------------------|-------------|
| `"phonepe"` | `"PREPAID"` | PhonePe UPI/Card payments |
| `"razorpay"` | `"PREPAID"` | Razorpay payments |
| `"stripe"` | `"PREPAID"` | Stripe payments |
| `"paypal"` | `"PREPAID"` | PayPal payments |
| `"upi"` | `"PREPAID"` | UPI payments |
| `"card"` | `"PREPAID"` | Card payments |
| `"netbanking"` | `"PREPAID"` | Net banking |
| `"wallet"` | `"PREPAID"` | Digital wallet |
| `"cod"` | `"COD"` | Cash on delivery |
| `"cash_on_delivery"` | `"COD"` | Cash on delivery |
| `null/undefined` | `"PREPAID"` | Default fallback |
| `"unknown"` | `"PREPAID"` | Unknown methods default to PREPAID |

## Testing

### Test the Mapping Function
```bash
node test-shiprocket-payment-mapping.js
```

### Expected Output
```
🧪 Testing Payment Method Mapping for Shiprocket...

📊 Test Results:
============================================================
1. Input: "phonepe"
   Expected: "PREPAID"
   Got: "PREPAID"
   Status: ✅ PASS

2. Input: "razorpay"
   Expected: "PREPAID"
   Got: "PREPAID"
   Status: ✅ PASS

3. Input: "cod"
   Expected: "COD"
   Got: "COD"
   Status: ✅ PASS
...
```

## Verification Steps

### 1. **Check Order Creation**
```bash
# Create a test order with PhonePe payment
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "cartId": "CART_ID",
    "paymentMethod": "phonepe",
    "address": {...}
  }'
```

### 2. **Check Shipping Creation**
```bash
# Create shipping for the order
curl -X POST http://localhost:5000/shipping/ship \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "length": 10,
    "breadth": 5,
    "height": 8,
    "weight": 1.5
  }'
```

### 3. **Verify in Shiprocket Dashboard**
- Login to Shiprocket dashboard
- Check the order details
- Verify that prepaid orders show as "PREPAID" not "COD"

## Code Changes Summary

### Files Modified:
1. **`src/controllers/shippingController.js`**
   - Added `mapPaymentMethodToShiprocket()` function
   - Updated line 140: `payment_method: mapPaymentMethodToShiprocket(order.paymentMethod)`
   - Updated line 616: `payment_method: mapPaymentMethodToShiprocket(order.paymentMethod) || "PREPAID"`

### Key Benefits:
- ✅ **Prepaid orders** now correctly show as "PREPAID" in Shiprocket
- ✅ **COD orders** still correctly show as "COD"
- ✅ **Unknown payment methods** default to "PREPAID" (safer option)
- ✅ **Case-insensitive** mapping (handles "PhonePe", "PHONEPE", "phonepe")
- ✅ **Backward compatible** with existing orders

## Common Payment Methods in Your System

Based on your codebase analysis:

### **Prepaid Methods:**
- `"phonepe"` - PhonePe UPI/Card payments
- `"razorpay"` - Razorpay payments
- `"stripe"` - Stripe payments
- `"paypal"` - PayPal payments

### **COD Methods:**
- `"cod"` - Cash on delivery

## Troubleshooting

### If orders still show as COD:

1. **Check the order's paymentMethod value:**
   ```javascript
   const order = await Orders.findOne({ orderId: "YOUR_ORDER_ID" });
   console.log("Payment Method:", order.paymentMethod);
   ```

2. **Verify the mapping function:**
   ```javascript
   const mapped = mapPaymentMethodToShiprocket(order.paymentMethod);
   console.log("Mapped to:", mapped);
   ```

3. **Check Shiprocket API logs:**
   - Look for the actual payload being sent
   - Verify the `payment_method` field value

### If you add new payment methods:

Update the mapping function to include the new method:

```javascript
case "new_payment_method":
  return "PREPAID"; // or "COD" depending on the method
```

## Integration with Other Systems

This fix ensures that:
- **Shiprocket** receives correct payment method values
- **Order tracking** works properly
- **Payment reconciliation** is accurate
- **Customer notifications** show correct payment status

The mapping function is centralized and can be easily maintained as you add new payment methods to your system.

## Testing Checklist

- [ ] PhonePe orders show as PREPAID in Shiprocket
- [ ] Razorpay orders show as PREPAID in Shiprocket
- [ ] COD orders show as COD in Shiprocket
- [ ] Unknown payment methods default to PREPAID
- [ ] Case variations work correctly (PhonePe, PHONEPE, phonepe)
- [ ] Return orders also use correct payment method mapping

This fix resolves the issue where prepaid orders were incorrectly showing as COD in Shiprocket! 🎉
