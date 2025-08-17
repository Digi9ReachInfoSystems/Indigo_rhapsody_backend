# Content Video Products API Documentation

## Overview
This document describes the enhanced content video system that allows designers to associate products with their content videos. This feature enables better product discovery and marketing through video content.

## Features
- **Product Association**: Link multiple products to content videos
- **Product Management**: Add and remove products from videos
- **Product Discovery**: Find videos by specific products
- **Enhanced Queries**: Get videos with populated product information
- **Role-based Access**: Admin and Designer permissions for product management

## Database Schema Updates

### Content Video Model
```javascript
{
  // ... existing fields ...
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}
```

## API Endpoints

### 1. Create Video with Products
**POST** `/content-video/videos`

Create a new content video with optional product associations.

**Headers:**
```
Authorization: Bearer jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "creatorId": "creator_id",
  "videoUrl": "https://example.com/video.mp4",
  "title": "Fashion Show 2024",
  "productIds": ["product_id_1", "product_id_2", "product_id_3"]
}
```

**Response:**
```json
{
  "message": "Video created successfully",
  "video": {
    "_id": "video_id",
    "title": "Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "userId": "user_id",
    "creatorId": "creator_id",
    "products": [
      {
        "productId": {
          "_id": "product_id_1",
          "productName": "Designer Dress",
          "price": 299.99,
          "coverImage": "https://example.com/dress.jpg",
          "sku": "DRS001",
          "category": "Dresses",
          "subCategory": "Evening Dresses"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "productId": {
          "_id": "product_id_2",
          "productName": "Stylish Shoes",
          "price": 149.99,
          "coverImage": "https://example.com/shoes.jpg",
          "sku": "SHO001",
          "category": "Footwear",
          "subCategory": "Heels"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "is_approved": false,
    "createdDate": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Create Admin Video with Products
**POST** `/content-video/createAdminVideo`

Create a new content video as admin with products (automatically approved).

**Headers:**
```
Authorization: Bearer jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "videoUrl": "https://example.com/video.mp4",
  "title": "Admin Fashion Show 2024",
  "productIds": ["product_id_1", "product_id_2"]
}
```

**Response:**
```json
{
  "message": "Admin video created and approved successfully",
  "video": {
    "_id": "video_id",
    "title": "Admin Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "userId": "user_id",
    "products": [
      {
        "productId": {
          "_id": "product_id_1",
          "productName": "Designer Dress",
          "price": 299.99,
          "coverImage": "https://example.com/dress.jpg",
          "sku": "DRS001",
          "category": "Dresses",
          "subCategory": "Evening Dresses"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "is_approved": true,
    "createdDate": "2024-01-15T10:00:00.000Z"
  }
}
```

### 3. Add Products to Content Video
**POST** `/content-video/videos/:videoId/products`

Add one or more products to a content video.

**Headers:**
```
Authorization: Bearer jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["product_id_1", "product_id_2", "product_id_3"]
}
```

**Response:**
```json
{
  "message": "2 product(s) added to video successfully",
  "video": {
    "_id": "video_id",
    "title": "Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "products": [
      {
        "productId": {
          "_id": "product_id_1",
          "productName": "Designer Dress",
          "price": 299.99,
          "coverImage": "https://example.com/dress.jpg"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "productId": {
          "_id": "product_id_2",
          "productName": "Stylish Shoes",
          "price": 149.99,
          "coverImage": "https://example.com/shoes.jpg"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Remove Products from Content Video
**DELETE** `/content-video/videos/:videoId/products`

Remove one or more products from a content video.

**Headers:**
```
Authorization: Bearer jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["product_id_1", "product_id_2"]
}
```

**Response:**
```json
{
  "message": "2 product(s) removed from video successfully",
  "video": {
    "_id": "video_id",
    "title": "Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "products": [
      {
        "productId": {
          "_id": "product_id_3",
          "productName": "Accessory Set",
          "price": 79.99,
          "coverImage": "https://example.com/accessory.jpg"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Content Videos with Products
**GET** `/content-video/videos-with-products`

Get all content videos with their associated products.

**Query Parameters:**
- `limit` (optional): Number of videos per page (default: 10)
- `page` (optional): Page number (default: 1)
- `approved` (optional): Filter by approval status (default: true)

**Example Request:**
```
GET /content-video/videos-with-products?limit=5&page=1&approved=true
```

**Response:**
```json
{
  "videos": [
    {
      "_id": "video_id_1",
      "title": "Fashion Show 2024",
      "videoUrl": "https://example.com/video1.mp4",
      "userId": {
        "_id": "user_id",
        "displayName": "Designer Name",
        "email": "designer@example.com"
      },
      "products": [
        {
          "productId": {
            "_id": "product_id_1",
            "productName": "Designer Dress",
            "price": 299.99,
            "coverImage": "https://example.com/dress.jpg",
            "sku": "DRS001",
            "category": "Dresses",
            "subCategory": "Evening Dresses"
          },
          "addedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "no_of_likes": 150,
      "no_of_Shares": 25,
      "is_approved": true,
      "createdDate": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalVideos": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 4. Get Single Content Video with Products
**GET** `/content-video/videos-with-products/:videoId`

Get a specific content video with its associated products.

**Response:**
```json
{
  "video": {
    "_id": "video_id",
    "title": "Fashion Show 2024",
    "videoUrl": "https://example.com/video.mp4",
    "userId": {
      "_id": "user_id",
      "displayName": "Designer Name",
      "email": "designer@example.com"
    },
    "products": [
      {
        "productId": {
          "_id": "product_id_1",
          "productName": "Designer Dress",
          "price": 299.99,
          "coverImage": "https://example.com/dress.jpg",
          "sku": "DRS001",
          "category": "Dresses",
          "subCategory": "Evening Dresses",
          "description": "Beautiful evening dress",
          "variants": [...]
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "no_of_likes": 150,
    "no_of_Shares": 25,
    "is_approved": true,
    "createdDate": "2024-01-15T10:00:00.000Z"
  }
}
```

### 5. Get Videos by Product
**GET** `/content-video/videos-by-product/:productId`

Find all videos that contain a specific product.

**Query Parameters:**
- `limit` (optional): Number of videos per page (default: 10)
- `page` (optional): Page number (default: 1)
- `approved` (optional): Filter by approval status (default: true)

**Example Request:**
```
GET /content-video/videos-by-product/product_id_1?limit=5&page=1&approved=true
```

**Response:**
```json
{
  "videos": [
    {
      "_id": "video_id_1",
      "title": "Fashion Show 2024",
      "videoUrl": "https://example.com/video1.mp4",
      "userId": {
        "_id": "user_id",
        "displayName": "Designer Name",
        "email": "designer@example.com"
      },
      "products": [
        {
          "productId": {
            "_id": "product_id_1",
            "productName": "Designer Dress",
            "price": 299.99,
            "coverImage": "https://example.com/dress.jpg",
            "sku": "DRS001",
            "category": "Dresses",
            "subCategory": "Evening Dresses"
          },
          "addedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "no_of_likes": 150,
      "no_of_Shares": 25,
      "is_approved": true,
      "createdDate": "2024-01-15T10:00:00.000Z"
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

## Error Responses

### 400 Bad Request
```json
{
  "message": "Product IDs array is required and must not be empty."
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. Admin or Designer role required."
}
```

### 404 Not Found
```json
{
  "message": "Video not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error",
  "error": "Error details"
}
```

## Usage Examples

### Mobile App Integration

#### React Native Example
```javascript
// Create video with products
const createVideoWithProducts = async (videoData, productIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content-video/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...videoData,
        productIds: productIds || []
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating video with products:', error);
    throw error;
  }
};

// Add products to existing video
const addProductsToVideo = async (videoId, productIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content-video/videos/${videoId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ productIds }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding products to video:', error);
    throw error;
  }
};

// Get videos with products
const getVideosWithProducts = async (limit = 10, page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/content-video/videos-with-products?limit=${limit}&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching videos with products:', error);
    throw error;
  }
};

// Get videos by product
const getVideosByProduct = async (productId, limit = 10, page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/content-video/videos-by-product/${productId}?limit=${limit}&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching videos by product:', error);
    throw error;
  }
};
```

#### Flutter Example
```dart
// Create video with products
Future<Map<String, dynamic>> createVideoWithProducts(Map<String, dynamic> videoData, List<String> productIds) async {
  try {
    final requestBody = Map<String, dynamic>.from(videoData);
    requestBody['productIds'] = productIds ?? [];
    
    final response = await http.post(
      Uri.parse('$API_BASE_URL/content-video/videos'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: json.encode(requestBody),
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error creating video with products: $e');
  }
}

// Add products to existing video
Future<Map<String, dynamic>> addProductsToVideo(String videoId, List<String> productIds) async {
  try {
    final response = await http.post(
      Uri.parse('$API_BASE_URL/content-video/videos/$videoId/products'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: json.encode({'productIds': productIds}),
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error adding products to video: $e');
  }
}

// Get videos with products
Future<Map<String, dynamic>> getVideosWithProducts({int limit = 10, int page = 1}) async {
  try {
    final response = await http.get(
      Uri.parse('$API_BASE_URL/content-video/videos-with-products?limit=$limit&page=$page'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error fetching videos with products: $e');
  }
}

// Get videos by product
Future<Map<String, dynamic>> getVideosByProduct(String productId, {int limit = 10, int page = 1}) async {
  try {
    final response = await http.get(
      Uri.parse('$API_BASE_URL/content-video/videos-by-product/$productId?limit=$limit&page=$page'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return json.decode(response.body);
  } catch (e) {
    throw Exception('Error fetching videos by product: $e');
  }
}
```

## Complete Usage Example

### Video Creation Flow
```javascript
// Example: Creating a fashion video with products
const createFashionVideo = async () => {
  try {
    // Step 1: Prepare video data
    const videoData = {
      userId: "user_id_123",
      creatorId: "creator_id_456", 
      videoUrl: "https://example.com/fashion-show-2024.mp4",
      title: "Spring Fashion Show 2024"
    };

    // Step 2: Select products to associate
    const selectedProductIds = [
      "product_id_1", // Designer Dress
      "product_id_2", // Matching Shoes
      "product_id_3"  // Accessory Set
    ];

    // Step 3: Create video with products
    const result = await createVideoWithProducts(videoData, selectedProductIds);
    
    console.log("Video created successfully:", result.video);
    console.log("Associated products:", result.video.products.length);
    
    return result;
  } catch (error) {
    console.error("Failed to create video:", error);
    throw error;
  }
};

// Example: Creating admin video (automatically approved)
const createAdminVideo = async () => {
  try {
    const videoData = {
      userId: "user_id_123",
      videoUrl: "https://example.com/admin-video.mp4",
      title: "Official Brand Video"
    };

    const productIds = ["product_id_1", "product_id_2"];
    
    const response = await fetch(`${API_BASE_URL}/content-video/createAdminVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...videoData,
        productIds
      }),
    });

    const result = await response.json();
    console.log("Admin video created:", result.video);
    return result;
  } catch (error) {
    console.error("Failed to create admin video:", error);
    throw error;
  }
};
```

## Business Logic

### Product Association Rules
1. **Duplicate Prevention**: The system prevents adding the same product multiple times to a video
2. **Role-based Access**: Only Admins and Designers can add/remove products from videos
3. **Product Validation**: The system validates that products exist before association
4. **Timestamp Tracking**: Each product association includes a timestamp for tracking

### Use Cases
1. **Designer Marketing**: Designers can showcase their products in video content
2. **Product Discovery**: Users can discover products through video content
3. **Cross-selling**: Related products can be featured together in videos
4. **Analytics**: Track which products perform well in video content

## Performance Considerations

### Database Optimization
- Indexes on `products.productId` for efficient queries
- Pagination support for large datasets
- Lean queries for read operations to reduce memory usage

### Caching Strategy
- Cache frequently accessed video-product associations
- Implement Redis caching for popular videos with products
- Cache product details to reduce database queries

## Security Considerations

### Access Control
- Role-based middleware for product management
- JWT token validation for all endpoints
- Input validation for product IDs

### Data Validation
- Validate product IDs before association
- Sanitize input data
- Prevent SQL injection through proper query building

## Testing

### Test Cases
1. **Add Products**: Test adding single and multiple products
2. **Remove Products**: Test removing products from videos
3. **Duplicate Prevention**: Test adding the same product twice
4. **Invalid Product IDs**: Test with non-existent product IDs
5. **Authorization**: Test access control for different user roles
6. **Pagination**: Test pagination functionality
7. **Product Queries**: Test finding videos by product

### Test Data
```javascript
// Sample test data
const testVideo = {
  _id: 'video_id_1',
  title: 'Test Fashion Video',
  videoUrl: 'https://example.com/test.mp4',
  userId: 'user_id_1',
  products: []
};

const testProducts = [
  {
    _id: 'product_id_1',
    productName: 'Test Dress',
    price: 199.99,
    coverImage: 'https://example.com/dress.jpg'
  },
  {
    _id: 'product_id_2',
    productName: 'Test Shoes',
    price: 99.99,
    coverImage: 'https://example.com/shoes.jpg'
  }
];
```

## Migration Guide

### Database Migration
If you have existing content videos, you can migrate them to include the products field:

```javascript
// Migration script
const migrateContentVideos = async () => {
  const videos = await ContentVideo.find({ products: { $exists: false } });
  
  for (const video of videos) {
    video.products = [];
    await video.save();
  }
  
  console.log(`Migrated ${videos.length} videos`);
};
```

### API Migration
1. Update existing video endpoints to include product population
2. Add new product management endpoints
3. Update frontend to handle product associations
4. Test all existing functionality

## Support

For issues and questions:
1. Check API documentation
2. Review error logs
3. Test with sample data
4. Contact development team
