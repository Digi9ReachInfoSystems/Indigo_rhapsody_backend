# PhonePe Redirect URL with Order ID

## ✅ **Redirect URL Updated!**

The PhonePe Legacy API now automatically appends the orderId to the redirectUrl, allowing you to check payment status immediately upon redirect.

---

## 🔗 **Redirect URL Configuration**

### Environment Variable
```env
PHONEPE_REDIRECT_URL=http://localhost:3000/payment-status?orderId=
```

### How It Works

When payment is created with orderId `ORD_1703123456789_xyz`, the redirect URL becomes:

```
http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz
```

PhonePe will redirect the user to this URL after payment completion.

---

## 📊 **Complete Flow**

### Step-by-Step Process

```
1. User Initiates Payment
   ↓
   POST /order/payment/phonepe/legacy
   Body: { amount: 1299.99, userId: "...", phone: "..." }
   
2. Backend Generates Order ID
   ↓
   orderId = "ORD_1703123456789_xyz"
   
3. Backend Builds Redirect URL
   ↓
   redirectUrl = "http://localhost:3000/payment-status?orderId=" + orderId
   Result: "http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz"
   
4. Backend Sends to PhonePe
   ↓
   Payload includes: { redirectUrl: "http://localhost:3000/payment-status?orderId=ORD_xxx" }
   
5. User Pays on PhonePe
   ↓
   User completes payment on PhonePe page
   
6. PhonePe Redirects Back
   ↓
   Browser redirects to: http://localhost:3000/payment-status?orderId=ORD_xxx
   
7. Frontend Checks Status
   ↓
   Extract orderId from URL params
   Call: GET /order/payment/phonepe/status/:orderId
   
8. Display Result
   ↓
   Show success or failure page based on status
```

---

## 🎨 **Frontend Implementation**

### React/Next.js Payment Status Page

```javascript
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PaymentStatusPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);

  // Get orderId from URL query parameter
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setStatus('error');
    }
  }, [orderId]);

  const checkPaymentStatus = async (orderId) => {
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
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  // Render based on status
  if (status === 'checking') {
    return (
      <div className="payment-status-page">
        <div className="checking">
          <h2>🔍 Checking Payment Status...</h2>
          <p>Please wait while we verify your payment</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (status === 'PAID' || status === 'SUCCESS') {
    return (
      <div className="payment-status-page">
        <div className="success">
          <h1>✅ Payment Successful!</h1>
          <p>Your payment has been completed successfully</p>
          <div className="details">
            <p><strong>Order ID:</strong> {paymentData.orderId}</p>
            <p><strong>Amount:</strong> ₹{paymentData.amount}</p>
            <p><strong>Transaction ID:</strong> {paymentData.transactionId}</p>
          </div>
          <button onClick={() => router.push('/orders')}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <div className="payment-status-page">
        <div className="pending">
          <h2>⏳ Payment Pending</h2>
          <p>Your payment is being processed</p>
          <button onClick={() => checkPaymentStatus(orderId)}>
            Check Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'FAILED' || status === 'error') {
    return (
      <div className="payment-status-page">
        <div className="error">
          <h1>❌ Payment Failed</h1>
          <p>{paymentData?.responseMessage || 'Payment could not be processed'}</p>
          <button onClick={() => router.push('/cart')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStatusPage;
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Payment Status</title>
</head>
<body>
  <div id="status-container">
    <h2>Checking payment status...</h2>
  </div>

  <script>
    // Get orderId from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
      document.getElementById('status-container').innerHTML = 
        '<h1>❌ Error</h1><p>Order ID not found in URL</p>';
    } else {
      // Check payment status
      checkPaymentStatus(orderId);
    }

    async function checkPaymentStatus(orderId) {
      try {
        const response = await fetch(
          `http://localhost:5000/order/payment/phonepe/status/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await response.json();

        if (data.success) {
          const status = data.data.status;

          if (status === 'PAID' || status === 'SUCCESS') {
            document.getElementById('status-container').innerHTML = `
              <h1>✅ Payment Successful!</h1>
              <p>Order ID: ${data.data.orderId}</p>
              <p>Amount: ₹${data.data.amount}</p>
              <p>Transaction ID: ${data.data.responseCode}</p>
              <button onclick="window.location.href='/orders'">View Orders</button>
            `;
          } else if (status === 'PENDING') {
            document.getElementById('status-container').innerHTML = `
              <h2>⏳ Payment Pending</h2>
              <p>Please wait...</p>
              <button onclick="checkPaymentStatus('${orderId}')">Check Again</button>
            `;
          } else {
            document.getElementById('status-container').innerHTML = `
              <h1>❌ Payment Failed</h1>
              <p>${data.data.responseMessage || 'Payment failed'}</p>
              <button onclick="window.location.href='/cart'">Try Again</button>
            `;
          }
        }
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('status-container').innerHTML = 
          '<h1>❌ Error</h1><p>Could not check payment status</p>';
      }
    }
  </script>
</body>
</html>
```

---

## 🔄 **URL Structure Examples**

### Example 1: Successful Payment
```
PhonePe redirects to:
http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz

Your frontend extracts orderId and calls:
GET /order/payment/phonepe/status/ORD_1703123456789_xyz

Response: { status: "PAID", amount: 1299.99 }
```

### Example 2: Failed Payment
```
PhonePe redirects to:
http://localhost:3000/payment-status?orderId=ORD_1703123456789_abc

Your frontend extracts orderId and calls:
GET /order/payment/phonepe/status/ORD_1703123456789_abc

Response: { status: "FAILED", responseMessage: "Payment declined" }
```

### Example 3: Pending Payment
```
PhonePe redirects to:
http://localhost:3000/payment-status?orderId=ORD_1703123456789_def

Your frontend extracts orderId and calls:
GET /order/payment/phonepe/status/ORD_1703123456789_def

Response: { status: "PENDING" }
```

---

## 📋 **Configuration Settings**

### Current Configuration

```javascript
// In phonepeService.js
this.redirectUrl = 
  process.env.PHONEPE_REDIRECT_URL || 
  "http://localhost:3000/payment-status?orderId=";

this.callbackUrl = 
  process.env.PHONEPE_CALLBACK_URL || 
  "https://indigo-rhapsody-backend-ten.vercel.app/payment/webhook";
```

### Environment Variables

```env
# .env file
PHONEPE_REDIRECT_URL=http://localhost:3000/payment-status?orderId=
PHONEPE_CALLBACK_URL=https://your-backend.vercel.app/payment/webhook
```

### Production Configuration

```env
# Production .env
PHONEPE_REDIRECT_URL=https://indigorhapsody.com/payment-status?orderId=
PHONEPE_CALLBACK_URL=https://api.indigorhapsody.com/payment/webhook
```

---

## 🎯 **How to Use**

### Step 1: Create Payment

```bash
curl -X POST "http://localhost:5000/order/payment/phonepe/legacy" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "amount": "1299.99",
    "customerDetails": {
      "phone": "9876543210",
      "email": "user@example.com"
    }
  }'
```

### Step 2: Redirect User to Payment URL

```javascript
// Response contains redirectUrl
const { redirectUrl } = response.data;
window.location.href = redirectUrl;
```

### Step 3: User Pays on PhonePe

User completes payment on PhonePe's payment page.

### Step 4: PhonePe Redirects Back

PhonePe redirects to:
```
http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz
```

### Step 5: Frontend Checks Status

```javascript
// Extract orderId from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

// Check payment status
const response = await fetch(
  `/api/order/payment/phonepe/status/${orderId}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const data = await response.json();
if (data.data.status === 'PAID') {
  showSuccessPage();
}
```

---

## 📱 **Mobile App Integration**

### React Native Example

```javascript
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

const PaymentStatusScreen = ({ route, navigation }) => {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // Listen for URL changes (when app comes back from PhonePe)
    const handleURL = (event) => {
      const url = event.url;
      const orderId = extractOrderId(url);
      if (orderId) {
        checkPaymentStatus(orderId);
      }
    };

    // Check if app was opened with a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        const orderId = extractOrderId(url);
        if (orderId) {
          checkPaymentStatus(orderId);
        }
      }
    });

    // Listen for URL events
    const subscription = Linking.addEventListener('url', handleURL);

    return () => subscription.remove();
  }, []);

  const extractOrderId = (url) => {
    const match = url.match(/orderId=([^&]+)/);
    return match ? match[1] : null;
  };

  const checkPaymentStatus = async (orderId) => {
    const response = await fetch(
      `${API_URL}/order/payment/phonepe/status/${orderId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await response.json();
    setStatus(data.data.status);
  };

  return (
    <View>
      {status === 'PAID' && <SuccessView />}
      {status === 'FAILED' && <FailureView />}
      {status === 'checking' && <LoadingView />}
    </View>
  );
};
```

---

## 🔍 **URL Query Parameter Extraction**

### JavaScript (Browser)

```javascript
// Method 1: URLSearchParams
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

// Method 2: URL API
const url = new URL(window.location.href);
const orderId = url.searchParams.get('orderId');

// Method 3: Manual parsing
const queryString = window.location.search; // "?orderId=ORD_xxx"
const orderId = queryString.split('orderId=')[1];
```

### React (Next.js)

```javascript
// Using useSearchParams (Next.js 13+)
import { useSearchParams } from 'next/navigation';

const PaymentStatus = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  useEffect(() => {
    if (orderId) {
      checkStatus(orderId);
    }
  }, [orderId]);
};
```

### React (React Router)

```javascript
// Using useLocation
import { useLocation } from 'react-router-dom';

const PaymentStatus = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
};
```

---

## 📝 **Complete Example**

### Backend Response

```json
{
  "success": true,
  "message": "Payment initiated successfully via PhonePe Legacy API",
  "data": {
    "orderId": "ORD_1703123456789_xyz",
    "redirectUrl": "http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz"
  }
}
```

### Frontend Payment Page

```javascript
const CheckoutPage = () => {
  const initiatePayment = async () => {
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
          phone: user.phoneNumber
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      // Save orderId for reference
      localStorage.setItem('lastOrderId', data.data.orderId);
      
      // Redirect to PhonePe
      window.location.href = data.data.redirectUrl;
    }
  };

  return (
    <button onClick={initiatePayment}>
      Pay with PhonePe
    </button>
  );
};
```

### Frontend Status Page

```javascript
const PaymentStatusPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    // Get orderId from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('orderId');
    
    if (id) {
      setOrderId(id);
      checkStatus(id);
    }
  }, []);

  const checkStatus = async (orderId) => {
    const response = await fetch(
      `/api/order/payment/phonepe/status/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const data = await response.json();
    setStatus(data.data.status);
  };

  return (
    <div>
      {status === 'checking' && <p>Checking...</p>}
      {status === 'PAID' && <SuccessMessage orderId={orderId} />}
      {status === 'FAILED' && <FailureMessage />}
    </div>
  );
};
```

---

## 🔗 **Redirect URL Examples**

### Development
```
Base URL: http://localhost:3000/payment-status?orderId=
Order ID: ORD_1703123456789_xyz
Result:   http://localhost:3000/payment-status?orderId=ORD_1703123456789_xyz
```

### Production
```
Base URL: https://indigorhapsody.com/payment-status?orderId=
Order ID: ORD_1703123456789_abc
Result:   https://indigorhapsody.com/payment-status?orderId=ORD_1703123456789_abc
```

### Custom Domain
```
Base URL: https://shop.yoursite.com/checkout/status?order=
Order ID: ORD_1703123456789_def
Result:   https://shop.yoursite.com/checkout/status?order=ORD_1703123456789_def
```

---

## 🎨 **Payment Status Page Design**

### Recommended Layout

```
┌─────────────────────────────────────┐
│         Payment Status              │
├─────────────────────────────────────┤
│                                     │
│  [Checking Status...]               │
│       ⟳ Loading Spinner             │
│                                     │
│  OR                                 │
│                                     │
│  ✅ Payment Successful!             │
│  Order ID: ORD_xxx                  │
│  Amount: ₹1,299.99                  │
│  [View Orders]                      │
│                                     │
│  OR                                 │
│                                     │
│  ❌ Payment Failed                  │
│  Reason: Payment declined           │
│  [Try Again]                        │
│                                     │
└─────────────────────────────────────┘
```

---

## ⚙️ **Configuration Checklist**

- [x] Set PHONEPE_REDIRECT_URL in .env
- [x] Ensure redirectUrl ends with `?orderId=` or `&orderId=`
- [x] Create /payment-status page in frontend
- [x] Extract orderId from URL query params
- [x] Call status check API with orderId
- [x] Handle PAID, PENDING, FAILED states
- [x] Test redirect flow end-to-end

---

## 🧪 **Testing the Flow**

### Test Script

```bash
# 1. Create payment
RESPONSE=$(curl -X POST "http://localhost:5000/order/payment/phonepe/legacy" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "68ccf8d9c585b659b38bc7ed",
    "amount": 100,
    "customerDetails": {
      "phone": "9876543210"
    }
  }')

# 2. Extract redirect URL
REDIRECT_URL=$(echo $RESPONSE | jq -r '.data.redirectUrl')
echo "Redirect URL: $REDIRECT_URL"

# 3. Extract order ID from URL
ORDER_ID=$(echo $REDIRECT_URL | grep -oP 'orderId=\K[^&]+')
echo "Order ID: $ORDER_ID"

# 4. Simulate checking status (what frontend will do)
curl "http://localhost:5000/order/payment/phonepe/status/${ORDER_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## ✅ **Summary**

| Feature | Status |
|---------|--------|
| Order ID in Redirect URL | ✅ Implemented |
| Auto-appending | ✅ Working |
| Status Check API | ✅ Ready |
| Frontend Examples | ✅ Provided |
| Mobile Support | ✅ Documented |
| Testing Guide | ✅ Complete |

---

**Redirect URL Configuration:**
```
http://localhost:3000/payment-status?orderId={orderId}
```

After payment, PhonePe will redirect to this URL with the actual orderId, and your frontend can immediately check the payment status! 🎉

