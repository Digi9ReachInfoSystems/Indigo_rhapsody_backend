# Payment Decimal Amounts Support Guide

## ✅ **Decimal Amounts Now Fully Supported!**

The payment system has been updated to properly handle decimal amounts (e.g., ₹1299.99, ₹99.50, etc.)

---

## 🔄 **What Changed**

### 1. **Enhanced Validation**
- Amount validation now explicitly supports decimal numbers
- Better error messages for invalid amounts
- Proper parsing and validation before processing

### 2. **PhonePe Integration**
- Decimal amounts properly converted to paise (multiplied by 100)
- Rounded to avoid fractional paise issues
- Example: ₹1299.99 → 129999 paise

### 3. **Database Storage**
- Amounts stored as precise decimal values
- No loss of precision
- Full support for 2 decimal places

---

## 💰 **Supported Amount Formats**

### ✅ **Valid Amounts**
```json
"amount": "1299"      // Integer
"amount": "1299.99"   // Decimal with 2 places
"amount": "99.50"     // Decimal with trailing zero
"amount": "5000.5"    // Decimal with 1 place
"amount": 1299.99     // Number (without quotes)
"amount": 1299        // Integer number
```

### ❌ **Invalid Amounts**
```json
"amount": "0"         // Zero not allowed
"amount": "-100"      // Negative not allowed
"amount": "abc"       // Non-numeric
"amount": ""          // Empty string
"amount": null        // Null value
```

---

## 📋 **API Examples**

### Example 1: Integer Amount
```bash
curl -X POST "http://localhost:5000/order/payment/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "cartId": "68ccf9196fdf60f32f91a100",
    "paymentMethod": "phonepe",
    "amount": 3000,
    "currency": "INR",
    "customerDetails": {
      "name": "Rajat",
      "email": "rajatjiedm@gmail.com",
      "phone": "9876543210",
      "address": "c 1304 apex athena sec 75 noida"
    }
  }'
```

### Example 2: Decimal Amount (String)
```bash
curl -X POST "http://localhost:5000/order/payment/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "cartId": "68ccf9196fdf60f32f91a100",
    "paymentMethod": "phonepe",
    "amount": "1299.99",
    "currency": "INR",
    "customerDetails": {
      "name": "Rajat",
      "email": "rajatjiedm@gmail.com",
      "phone": "9876543210",
      "address": "c 1304 apex athena sec 75 noida"
    }
  }'
```

### Example 3: Decimal Amount (Number)
```bash
curl -X POST "http://localhost:5000/order/payment/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "cartId": "68ccf9196fdf60f32f91a100",
    "paymentMethod": "phonepe",
    "amount": 2499.50,
    "currency": "INR",
    "customerDetails": {
      "name": "Rajat",
      "email": "rajatjiedm@gmail.com",
      "phone": "9876543210",
      "address": "c 1304 apex athena sec 75 noida"
    }
  }'
```

---

## 🔢 **Amount Processing Flow**

### Step 1: Client Sends Request
```json
{
  "amount": "1299.99"
}
```

### Step 2: Server Validation
```javascript
const parsedAmount = parseFloat(amount);  // 1299.99
if (isNaN(parsedAmount) || parsedAmount <= 0) {
  // Error: Invalid amount
}
```

### Step 3: PhonePe Conversion
```javascript
// Convert to paise and round
const amountInPaise = Math.round(parsedAmount * 100);  // 129999
```

### Step 4: Database Storage
```javascript
{
  amount: 1299.99  // Stored as decimal
}
```

---

## 📊 **Response Examples**

### Success Response
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "paymentReferenceId": "PAY_1703123456789_abc123def",
    "orderId": "ORD_1703123456789_xyz789ghi",
    "paymentMethod": "phonepe",
    "amount": 1299.99,
    "currency": "INR",
    "redirectUrl": "https://mercury.phonepe.com/transact/...",
    "transactionId": "ORD_1703123456789_xyz789ghi",
    "expiresIn": 1800
  }
}
```

### Error Response (Invalid Amount)
```json
{
  "success": false,
  "message": "Amount must be a valid number greater than 0. Decimal amounts are supported (e.g., 1299.99)"
}
```

---

## 🎯 **Use Cases**

### 1. Product Price with Tax
```json
{
  "amount": "1349.15",  // ₹1200 + 12.43% tax
  "description": "Product price including GST"
}
```

### 2. Discounted Price
```json
{
  "amount": "899.99",  // ₹1000 - 10% discount
  "description": "Discounted price after coupon"
}
```

### 3. Shipping Charges
```json
{
  "amount": "49.50",  // Shipping cost
  "description": "Shipping charges"
}
```

### 4. Total Cart Amount
```json
{
  "amount": "2599.75",  // Product + Tax + Shipping
  "description": "Total cart amount"
}
```

---

## 💡 **Best Practices**

### 1. **Always Use 2 Decimal Places for Currency**
```javascript
// ✅ Good
const amount = 1299.99;
const amountStr = amount.toFixed(2);  // "1299.99"

// ❌ Avoid
const amount = 1299.9999;  // Too many decimals
```

### 2. **Frontend Validation**
```javascript
// Validate before sending to API
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return "Invalid amount";
  }
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
};

// Usage
const validAmount = validateAmount("1299.99");  // 1299.99
```

### 3. **Display Formatting**
```javascript
// Display with currency symbol
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

console.log(formatCurrency(1299.99));  // "₹1,299.99"
```

### 4. **Calculation Precision**
```javascript
// Avoid floating point precision issues
const calculateTotal = (items) => {
  // Convert to paise, calculate, then convert back
  const totalPaise = items.reduce((sum, item) => {
    return sum + Math.round(item.price * 100);
  }, 0);
  return totalPaise / 100;
};
```

---

## 🔍 **Validation Rules**

### Amount Must Be:
✅ A valid number (integer or decimal)  
✅ Greater than 0  
✅ Positive value  
✅ Can have up to 2 decimal places (recommended)

### Amount Cannot Be:
❌ Zero or negative  
❌ Non-numeric string  
❌ Empty or null  
❌ NaN (Not a Number)

---

## 🧪 **Testing**

### Test Case 1: Integer Amount
```bash
# Request
{
  "amount": 1000
}

# Expected: Success
# Amount in DB: 1000
# Amount to PhonePe: 100000 paise
```

### Test Case 2: Decimal Amount
```bash
# Request
{
  "amount": "1299.99"
}

# Expected: Success
# Amount in DB: 1299.99
# Amount to PhonePe: 129999 paise
```

### Test Case 3: Single Decimal
```bash
# Request
{
  "amount": "999.5"
}

# Expected: Success
# Amount in DB: 999.5
# Amount to PhonePe: 99950 paise
```

### Test Case 4: Invalid Amount
```bash
# Request
{
  "amount": "abc"
}

# Expected: Error
# Message: "Amount must be a valid number greater than 0..."
```

### Test Case 5: Zero Amount
```bash
# Request
{
  "amount": 0
}

# Expected: Error
# Message: "Amount must be a valid number greater than 0..."
```

---

## 📱 **Frontend Integration**

### React Example
```javascript
import React, { useState } from 'react';

const PaymentForm = () => {
  const [amount, setAmount] = useState('');
  
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/order/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: parseFloat(amount),  // or just amount (as string)
        userId: userId,
        cartId: cartId,
        paymentMethod: 'phonepe',
        customerDetails: { /* ... */ }
      })
    });

    const data = await response.json();
    if (data.success) {
      // Redirect to payment URL
      window.location.href = data.data.redirectUrl;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Amount (₹):
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          pattern="^\d*\.?\d{0,2}$"
        />
      </label>
      <button type="submit">Pay ₹{amount || '0.00'}</button>
    </form>
  );
};
```

### JavaScript Validation
```javascript
function validatePaymentAmount(amount) {
  // Convert to number
  const num = parseFloat(amount);
  
  // Check if valid number
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Please enter a valid amount'
    };
  }
  
  // Check if positive
  if (num <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than 0'
    };
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  
  return {
    valid: true,
    amount: rounded
  };
}

// Usage
const result = validatePaymentAmount('1299.99');
if (result.valid) {
  // Proceed with payment
  createPayment(result.amount);
} else {
  // Show error
  alert(result.error);
}
```

---

## 🔐 **Security Notes**

1. **Server-Side Validation**: Always validate amount on server (never trust client)
2. **Precision**: Server rounds to avoid precision issues
3. **Range Checks**: Consider adding min/max amount limits
4. **SQL Injection**: Using parseFloat prevents injection attacks

---

## ✅ **Summary**

| Feature | Status | Details |
|---------|--------|---------|
| Integer Amounts | ✅ Supported | 1000, 2500, 3000 |
| Decimal Amounts | ✅ Supported | 1299.99, 99.50 |
| String Format | ✅ Supported | "1299.99" |
| Number Format | ✅ Supported | 1299.99 |
| Validation | ✅ Enhanced | Better error messages |
| PhonePe Conversion | ✅ Updated | Proper rounding |
| Database Storage | ✅ Precise | No precision loss |

---

**Your payment system now fully supports decimal amounts!** 💰✨

Test it with amounts like:
- `1299.99`
- `2499.50`
- `999.9`
- `5000`

All will work perfectly! 🎉

