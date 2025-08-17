# Recently Viewed Products API Documentation

## Overview
The Recently Viewed Products functionality allows you to track and retrieve products that users have viewed. This feature automatically tracks product views when users access product details and provides endpoints to manage this data.

## Features
- **Automatic Tracking**: Product views are automatically tracked when authenticated users view product details
- **Guest User Support**: Guest users can view products without tracking (no authentication required for viewing)
- **User-Specific**: Each authenticated user has their own recently viewed products list
- **Limited History**: Keeps only the last 20 viewed products per user
- **Chronological Order**: Most recently viewed products appear first
- **Smart Tracking**: Only tracks views for authenticated users, not guests

## API Endpoints

### 1. Track Product View
**POST** `/api/products/:productId/track-view`

Manually track a product view for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `productId` (path parameter): The ID of the product to track

**Response:**
```json
{
  "message": "Product view tracked successfully",
  "productId": "product_id_here"
}
```

### 2. Get Recently Viewed Products
**GET** `/api/products/recently-viewed`

Retrieve the user's recently viewed products.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 10, max: 20)

**Response:**
```json
{
  "message": "Recently viewed products retrieved successfully",
  "products": [
    {
      "productId": "product_id",
      "productName": "Product Name",
      "description": "Product Description",
      "price": 100,
      "mrp": 120,
      "discount": 20,
      "coverImage": "image_url",
      "variants": [...],
      "category": { "name": "Category Name" },
      "subCategory": { "name": "SubCategory Name" },
      "averageRating": 4.5,
      "totalRatings": 10,
      "viewedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalCount": 1
}
```

### 3. Clear Recently Viewed Products
**DELETE** `/api/products/recently-viewed`

Clear all recently viewed products for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Recently viewed products cleared successfully"
}
```

## Automatic Tracking

The system automatically tracks product views when authenticated users access product details through these endpoints:

**GET** `/api/products/:productId`
**GET** `/api/products/subCategory/:subCategoryId`

These endpoints now include automatic tracking for authenticated users (not guests). No additional API calls are needed to track views.

### User Types Supported:
- **Authenticated Users**: Full tracking enabled
- **Guest Users**: Can view products but no tracking (role: 'Guest')
- **Anonymous Users**: Can view products but no tracking (no authentication)

### Response Format for Product Endpoints:
```json
{
  "productId": "product_id",
  "productName": "Product Name",
  "description": "Product Description",
  "price": 100,
  // ... other product fields
  "userType": "authenticated|guest|anonymous",
  "trackingEnabled": true|false
}
```

## Database Schema

### User Model Updates
The user model now includes a `recentlyViewedProducts` field:

```javascript
recentlyViewedProducts: [
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },getProductsBySubCategory
]
```

## Usage Examples

### Frontend Integration

1. **Automatic Tracking for Authenticated Users**: Simply call the existing product details endpoint with authentication:
```javascript
// This automatically tracks the view for authenticated users
const response = await fetch(`/api/products/${productId}`, {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

2. **Guest User Access**: Guest users can view products without tracking:
```javascript
// Guest users can view products without authentication
const response = await fetch(`/api/products/${productId}`);
// Response will include userType: 'guest' and trackingEnabled: false
```

2. **Get Recently Viewed Products**:
```javascript
const response = await fetch('/api/products/recently-viewed?limit=10', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
const data = await response.json();
console.log(data.products); // Array of recently viewed products
```

3. **Clear History**:
```javascript
const response = await fetch('/api/products/recently-viewed', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid product ID)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found (product or user not found)
- `500`: Internal Server Error

## Notes

- Product views are automatically deduplicated (same product appears only once, most recent view)
- The system maintains a maximum of 20 recently viewed products per user
- Only authenticated users (not guests) have their views tracked
- Product views are tracked chronologically with timestamps
- The system gracefully handles cases where products may have been deleted
- Guest users can view products without authentication or tracking
- Response includes `userType` and `trackingEnabled` fields for frontend logic
