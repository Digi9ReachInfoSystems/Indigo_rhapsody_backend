# Content Video Products API Documentation

## Overview
This API provides enhanced functionality for managing content videos with products. The new endpoints focus on creating videos with products and retrieving videos by product relationships.

## Base URL
```
POST /api/content-videos
GET /api/content-videos
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Add Video with Products

### Endpoint
```
POST /api/content-videos/add-video-with-products
```

### Description
Creates a new content video with associated products in a single request. This endpoint validates product existence and provides comprehensive error handling.

### Request Body
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "creatorId": "64f8a1b2c3d4e5f6a7b8c9d1", // Optional, defaults to userId
  "videoUrl": "https://example.com/video.mp4",
  "title": "Product Showcase Video",
  "description": "A detailed showcase of our latest products",
  "productIds": [
    "64f8a1b2c3d4e5f6a7b8c9d2",
    "64f8a1b2c3d4e5f6a7b8c9d3"
  ],
  "isApproved": false // Optional, defaults to false
}
```

### Required Fields
- `userId`: User ID who is creating the video
- `videoUrl`: Valid HTTP/HTTPS URL of the video
- `title`: Title of the video

### Optional Fields
- `creatorId`: Creator ID (defaults to userId if not provided)
- `description`: Video description
- `productIds`: Array of product IDs to associate with the video
- `isApproved`: Boolean to set approval status (defaults to false)

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Video with products created successfully",
  "video": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "title": "Product Showcase Video",
    "description": "A detailed showcase of our latest products",
    "videoUrl": "https://example.com/video.mp4",
    "is_approved": false,
    "createdDate": "2024-01-15T10:30:00.000Z",
    "no_of_likes": 0,
    "no_of_dislikes": 0,
    "no_of_Shares": 0,
    "userId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "displayName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "profilePicture": "https://example.com/profile.jpg"
    },
    "creatorId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "displayName": "Jane Smith",
      "email": "jane@example.com",
      "phoneNumber": "+1234567891",
      "profilePicture": "https://example.com/jane.jpg"
    },
    "products": [
      {
        "productId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "productName": "Designer T-Shirt",
          "price": 29.99,
          "coverImage": "https://example.com/tshirt.jpg",
          "sku": "TSH001",
          "category": "Clothing",
          "subCategory": "T-Shirts",
          "description": "Premium cotton t-shirt",
          "designerRef": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
            "displayName": "Fashion Designer",
            "email": "designer@example.com",
            "phoneNumber": "+1234567892",
            "profilePicture": "https://example.com/designer.jpg"
          }
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalProducts": 1
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "User ID, Video URL, and title are required."
}
```

### Response (Error - 400 - Invalid URL)
```json
{
  "success": false,
  "message": "Video URL must be a valid HTTP/HTTPS URL."
}
```

### Response (Error - 400 - Products Not Found)
```json
{
  "success": false,
  "message": "Products not found: 64f8a1b2c3d4e5f6a7b8c9d9"
}
```

---

## 2. Get Videos by Product (Enhanced)

### Endpoint
```
GET /api/content-videos/videos-by-product-enhanced/:productId
```

### Description
Retrieves all videos that contain a specific product with enhanced details including user reactions and comprehensive product information.

### URL Parameters
- `productId`: ID of the product to search videos for

### Query Parameters
- `limit`: Number of videos per page (default: 10)
- `page`: Page number (default: 1)
- `approved`: Filter by approval status (default: true)
- `userId`: User ID to include user reaction information

### Example Request
```
GET /api/content-videos/videos-by-product-enhanced/64f8a1b2c3d4e5f6a7b8c9d2?limit=5&page=1&approved=true&userId=64f8a1b2c3d4e5f6a7b8c9d0
```

### Response (Success - 200)
```json
{
  "success": true,
  "product": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "productName": "Designer T-Shirt",
    "price": 29.99,
    "coverImage": "https://example.com/tshirt.jpg"
  },
  "videos": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "title": "Product Showcase Video",
      "description": "A detailed showcase of our latest products",
      "videoUrl": "https://example.com/video.mp4",
      "is_approved": true,
      "createdDate": "2024-01-15T10:30:00.000Z",
      "no_of_likes": 15,
      "no_of_dislikes": 2,
      "no_of_Shares": 5,
      "userId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "displayName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "profilePicture": "https://example.com/profile.jpg"
      },
      "creatorId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "displayName": "Jane Smith",
        "email": "jane@example.com",
        "phoneNumber": "+1234567891",
        "profilePicture": "https://example.com/jane.jpg"
      },
      "products": [
        {
          "productId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "productName": "Designer T-Shirt",
            "price": 29.99,
            "coverImage": "https://example.com/tshirt.jpg",
            "sku": "TSH001",
            "category": "Clothing",
            "subCategory": "T-Shirts",
            "designerRef": {
              "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
              "displayName": "Fashion Designer",
              "email": "designer@example.com",
              "phoneNumber": "+1234567892",
              "profilePicture": "https://example.com/designer.jpg"
            }
          },
          "addedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "comments": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
          "userId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
            "displayName": "Commenter",
            "email": "commenter@example.com",
            "phoneNumber": "+1234567893",
            "profilePicture": "https://example.com/commenter.jpg"
          },
          "commentText": "Great video! Love the product.",
          "createdAt": "2024-01-15T11:00:00.000Z"
        }
      ],
      "userReaction": "like"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalVideos": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Product ID is required."
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Product not found."
}
```

---

## 3. Existing Endpoints (Updated)

### Create Video (Original)
```
POST /api/content-videos/videos
```

### Get Videos with Products
```
GET /api/content-videos/videos-with-products
```

### Get Single Video with Products
```
GET /api/content-videos/videos-with-products/:videoId
```

### Add Products to Existing Video
```
POST /api/content-videos/videos/:videoId/products
```

### Remove Products from Video
```
DELETE /api/content-videos/videos/:videoId/products
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
- Missing required fields
- Invalid data format
- Product validation errors

#### 401 Unauthorized
- Missing or invalid JWT token
- Expired token

#### 403 Forbidden
- Insufficient permissions
- Role-based access restrictions

#### 404 Not Found
- Video not found
- Product not found
- User not found

#### 500 Internal Server Error
- Database connection issues
- Server errors

---

## Usage Examples

### Example 1: Create a Video with Multiple Products
```javascript
const response = await fetch('/api/content-videos/add-video-with-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    userId: '64f8a1b2c3d4e5f6a7b8c9d0',
    videoUrl: 'https://example.com/showcase.mp4',
    title: 'Summer Collection Showcase',
    description: 'Showcasing our latest summer fashion collection',
    productIds: [
      '64f8a1b2c3d4e5f6a7b8c9d2',
      '64f8a1b2c3d4e5f6a7b8c9d3',
      '64f8a1b2c3d4e5f6a7b8c9d4'
    ],
    isApproved: true
  })
});
```

### Example 2: Get Videos for a Specific Product
```javascript
const response = await fetch('/api/content-videos/videos-by-product-enhanced/64f8a1b2c3d4e5f6a7b8c9d2?limit=10&page=1&approved=true&userId=64f8a1b2c3d4e5f6a7b8c9d0', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

---

## Best Practices

1. **Validation**: Always validate product IDs before creating videos
2. **Pagination**: Use pagination for large result sets
3. **Error Handling**: Implement proper error handling for all API calls
4. **Authentication**: Include JWT tokens for protected endpoints
5. **URL Validation**: Ensure video URLs are valid HTTP/HTTPS URLs
6. **Product Verification**: Verify products exist before associating them with videos

---

## Rate Limiting

- Standard rate limiting applies to all endpoints
- Video creation: 10 requests per minute per user
- Video retrieval: 100 requests per minute per user

---

## Support

For technical support or questions about the API, please contact the development team or refer to the main API documentation.
