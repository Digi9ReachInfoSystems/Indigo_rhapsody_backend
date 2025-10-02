# Cart ID API Documentation

## Overview
The Cart ID API provides endpoints to retrieve cart information by user ID. These endpoints are useful for getting cart identifiers and basic cart details without fetching the full cart with all product information.

## Endpoints

### 1. Get Cart ID by User ID (Basic)

**Endpoint:** `GET /api/cart/cart-id/:userId`

**Description:** Retrieves basic cart information including cart ID, user ID, status, and timestamps.

**Authentication:** Required (Bearer Token)

**Parameters:**
- `userId` (path parameter): MongoDB ObjectId of the user

**Response:**
```json
{
  "success": true,
  "message": "Cart ID retrieved successfully",
  "data": {
    "cartId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "status": "active",
    "createdDate": "2024-01-15T10:30:00.000Z",
    "lastUpdatedDate": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid user ID format
- `404 Not Found`: Cart not found for this user
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

### 2. Get Cart Details by User ID (Extended)

**Endpoint:** `GET /api/cart/cart-details/:userId`

**Description:** Retrieves detailed cart information including cart ID, totals, item count, and financial details.

**Authentication:** Required (Bearer Token)

**Parameters:**
- `userId` (path parameter): MongoDB ObjectId of the user

**Response:**
```json
{
  "success": true,
  "message": "Cart details retrieved successfully",
  "data": {
    "cartId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "status": "active",
    "itemCount": 3,
    "subtotal": 1500.00,
    "totalAmount": 1779.00,
    "discountAmount": 0.00,
    "taxAmount": 180.00,
    "shippingCost": 99.00,
    "createdDate": "2024-01-15T10:30:00.000Z",
    "lastUpdatedDate": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid user ID format
- `404 Not Found`: Cart not found for this user
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

## Request Examples

### cURL Examples

#### Get Basic Cart ID
```bash
curl -X GET "http://localhost:3000/api/cart/cart-id/507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Detailed Cart Information
```bash
curl -X GET "http://localhost:3000/api/cart/cart-details/507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript Examples

#### Using Fetch API
```javascript
// Get basic cart ID
const getCartId = async (userId, token) => {
  try {
    const response = await fetch(`/api/cart/cart-id/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting cart ID:', error);
    throw error;
  }
};

// Get detailed cart information
const getCartDetails = async (userId, token) => {
  try {
    const response = await fetch(`/api/cart/cart-details/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting cart details:', error);
    throw error;
  }
};
```

#### Using Axios
```javascript
import axios from 'axios';

// Get basic cart ID
const getCartId = async (userId, token) => {
  try {
    const response = await axios.get(`/api/cart/cart-id/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting cart ID:', error);
    throw error;
  }
};

// Get detailed cart information
const getCartDetails = async (userId, token) => {
  try {
    const response = await axios.get(`/api/cart/cart-details/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting cart details:', error);
    throw error;
  }
};
```

## Response Fields

### Basic Cart ID Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `cartId` | String | MongoDB ObjectId of the cart |
| `userId` | String | MongoDB ObjectId of the user |
| `status` | String | Cart status (active, completed, abandoned) |
| `createdDate` | Date | When the cart was created |
| `lastUpdatedDate` | Date | When the cart was last updated |

### Detailed Cart Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `cartId` | String | MongoDB ObjectId of the cart |
| `userId` | String | MongoDB ObjectId of the user |
| `status` | String | Cart status (active, completed, abandoned) |
| `itemCount` | Number | Number of items in the cart |
| `subtotal` | Number | Subtotal amount before tax and shipping |
| `totalAmount` | Number | Final total amount including tax and shipping |
| `discountAmount` | Number | Applied discount amount |
| `taxAmount` | Number | Tax amount (GST at 12%) |
| `shippingCost` | Number | Shipping cost |
| `createdDate` | Date | When the cart was created |
| `lastUpdatedDate` | Date | When the cart was last updated |

## Error Handling

### Common Error Scenarios

1. **Invalid User ID Format**
   ```json
   {
     "success": false,
     "message": "Invalid user ID format"
   }
   ```

2. **Cart Not Found**
   ```json
   {
     "success": false,
     "message": "Cart not found for this user"
   }
   ```

3. **Authentication Required**
   ```json
   {
     "success": false,
     "message": "Access denied. No token provided."
   }
   ```

4. **Invalid Token**
   ```json
   {
     "success": false,
     "message": "Access denied. Invalid token."
   }
   ```

5. **Server Error**
   ```json
   {
     "success": false,
     "message": "Error retrieving cart ID",
     "error": "Detailed error message"
   }
   ```

## Use Cases

### 1. Order Processing
Use the cart ID to create orders or process payments:
```javascript
const cartResponse = await getCartId(userId, token);
const cartId = cartResponse.data.cartId;
// Use cartId for order creation
```

### 2. Cart Status Check
Check if a user has an active cart:
```javascript
const cartResponse = await getCartId(userId, token);
if (cartResponse.data.status === 'active') {
  // User has an active cart
}
```

### 3. Cart Summary Display
Display cart summary in UI without loading full product details:
```javascript
const cartDetails = await getCartDetails(userId, token);
const { itemCount, totalAmount, subtotal } = cartDetails.data;
// Display cart summary
```

### 4. Cart Validation
Validate cart existence before performing operations:
```javascript
try {
  const cartResponse = await getCartId(userId, token);
  // Cart exists, proceed with operation
} catch (error) {
  if (error.response?.status === 404) {
    // No cart exists for this user
  }
}
```

## Performance Considerations

1. **Efficient Queries**: Both endpoints use MongoDB's `select()` method to fetch only required fields, reducing data transfer and improving performance.

2. **No Population**: These endpoints don't populate product details, making them faster than the full cart endpoint.

3. **Indexing**: Ensure proper indexing on the `userId` field in the Cart collection for optimal query performance.

## Security Features

1. **Authentication Required**: Both endpoints require valid JWT tokens.

2. **User ID Validation**: ObjectId format validation prevents injection attacks.

3. **User Isolation**: Users can only access their own cart information.

## Integration with Other Endpoints

These endpoints work seamlessly with other cart operations:

- **Create Cart**: Use after creating a cart to get the cart ID
- **Add Items**: Use to verify cart exists before adding items
- **Update Cart**: Use to get cart ID for update operations
- **Delete Items**: Use to verify cart exists before removing items
- **Order Creation**: Use to get cart ID for order processing

## Best Practices

1. **Use Basic Endpoint**: Use the basic cart ID endpoint when you only need the cart identifier.

2. **Use Detailed Endpoint**: Use the detailed endpoint when you need cart summary information for UI display.

3. **Error Handling**: Always implement proper error handling for 404 responses (cart not found).

4. **Caching**: Consider caching cart ID responses for frequently accessed carts.

5. **Validation**: Validate user ID format on the client side before making requests.

## Related Endpoints

- `GET /api/cart/getCart/:userId` - Get full cart with product details
- `POST /api/cart/CreateCart` - Create or update cart
- `POST /api/cart/addItem` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `POST /api/cart/` - Delete item from cart
