# Postman Testing Guide - Content Video Products API

## Setup Instructions

### 1. Environment Variables
Create a new environment in Postman and add these variables:
```
BASE_URL: http://localhost:3000 (or your server URL)
JWT_TOKEN: (your JWT token after login)
ADMIN_TOKEN: (admin JWT token)
```

### 2. Headers Setup
For all requests, add these headers:
```
Content-Type: application/json
Authorization: Bearer {{JWT_TOKEN}}
```

## API Endpoints with Request Bodies

### 1. Create Video with Products
**POST** `{{BASE_URL}}/content-video/videos`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{JWT_TOKEN}}
```

**Request Body Examples:**

#### Example 1: Basic Video with Products
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "creatorId": "507f1f77bcf86cd799439012",
  "videoUrl": "https://example.com/videos/fashion-show-2024.mp4",
  "title": "Spring Fashion Show 2024",
  "productIds": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014",
    "507f1f77bcf86cd799439015"
  ]
}
```

#### Example 2: Video without Products
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "creatorId": "507f1f77bcf86cd799439012",
  "videoUrl": "https://example.com/videos/lifestyle-video.mp4",
  "title": "Lifestyle Video 2024"
}
```

#### Example 3: Video with Single Product
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "creatorId": "507f1f77bcf86cd799439012",
  "videoUrl": "https://example.com/videos/product-showcase.mp4",
  "title": "Product Showcase Video",
  "productIds": ["507f1f77bcf86cd799439013"]
}
```

### 2. Create Admin Video with Products
**POST** `{{BASE_URL}}/content-video/createAdminVideo`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Request Body Examples:**

#### Example 1: Admin Video with Products
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "videoUrl": "https://example.com/videos/official-brand-video.mp4",
  "title": "Official Brand Video 2024",
  "productIds": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

#### Example 2: Admin Video without Products
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "videoUrl": "https://example.com/videos/company-intro.mp4",
  "title": "Company Introduction Video"
}
```

### 3. Add Products to Existing Video
**POST** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{JWT_TOKEN}}
```

**Request Body Examples:**

#### Example 1: Add Multiple Products
```json
{
  "productIds": [
    "507f1f77bcf86cd799439016",
    "507f1f77bcf86cd799439017",
    "507f1f77bcf86cd799439018"
  ]
}
```

#### Example 2: Add Single Product
```json
{
  "productIds": ["507f1f77bcf86cd799439016"]
}
```

### 4. Remove Products from Video
**DELETE** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{JWT_TOKEN}}
```

**Request Body Examples:**

#### Example 1: Remove Multiple Products
```json
{
  "productIds": [
    "507f1f77bcf86cd799439016",
    "507f1f77bcf86cd799439017"
  ]
}
```

#### Example 2: Remove Single Product
```json
{
  "productIds": ["507f1f77bcf86cd799439016"]
}
```

## GET Endpoints (No Request Body Needed)

### 5. Get Videos with Products
**GET** `{{BASE_URL}}/content-video/videos-with-products`

**Query Parameters:**
```
limit=10&page=1&approved=true
```

### 6. Get Single Video with Products
**GET** `{{BASE_URL}}/content-video/videos-with-products/{{VIDEO_ID}}`

### 7. Get Videos by Product
**GET** `{{BASE_URL}}/content-video/videos-by-product/{{PRODUCT_ID}}`

**Query Parameters:**
```
limit=10&page=1&approved=true
```

### 8. Toggle Video Reaction (Like/Dislike)
**POST** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/reaction`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reactionType": "like"
}
```

### 9. Get User Reaction
**GET** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/reaction/{{USER_ID}}`

### 10. Add Comment
**POST** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/comments`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "commentText": "Amazing fashion show! Love the designs."
}
```

### 11. Get Video Comments
**GET** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/comments`

**Query Parameters:**
```
limit=10&page=1
```

### 12. Update Comment
**PUT** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/comments/{{COMMENT_ID}}`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "commentText": "Updated comment text here."
}
```

### 13. Delete Comment
**DELETE** `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/comments/{{COMMENT_ID}}`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

## Sample Data for Testing

### Sample User IDs
```json
{
  "user1": "507f1f77bcf86cd799439011",
  "user2": "507f1f77bcf86cd799439012",
  "admin": "507f1f77bcf86cd799439013"
}
```

### Sample Product IDs
```json
{
  "dress1": "507f1f77bcf86cd799439020",
  "dress2": "507f1f77bcf86cd799439021",
  "shoes1": "507f1f77bcf86cd799439022",
  "shoes2": "507f1f77bcf86cd799439023",
  "accessory1": "507f1f77bcf86cd799439024",
  "accessory2": "507f1f77bcf86cd799439025"
}
```

### Sample Video URLs
```json
{
  "fashion_show": "https://example.com/videos/fashion-show-2024.mp4",
  "lifestyle": "https://example.com/videos/lifestyle-video.mp4",
  "product_showcase": "https://example.com/videos/product-showcase.mp4",
  "brand_video": "https://example.com/videos/official-brand-video.mp4",
  "company_intro": "https://example.com/videos/company-intro.mp4"
}
```

## Test Scenarios

### Scenario 1: Complete Video Creation Flow
1. **Create Video with Products**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "creatorId": "507f1f77bcf86cd799439012",
     "videoUrl": "https://example.com/videos/fashion-show-2024.mp4",
     "title": "Spring Fashion Show 2024",
     "productIds": [
       "507f1f77bcf86cd799439020",
       "507f1f77bcf86cd799439021",
       "507f1f77bcf86cd799439022"
     ]
   }
   ```

2. **Get Created Video with Products**
   - Use the video ID from step 1
   - GET `{{BASE_URL}}/content-video/videos-with-products/{{VIDEO_ID}}`

3. **Add More Products**
   ```json
   {
     "productIds": [
       "507f1f77bcf86cd799439023",
       "507f1f77bcf86cd799439024"
     ]
   }
   ```

4. **Remove Some Products**
   ```json
   {
     "productIds": ["507f1f77bcf86cd799439020"]
   }
   ```

### Scenario 2: Admin Video Creation
1. **Create Admin Video**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "videoUrl": "https://example.com/videos/official-brand-video.mp4",
     "title": "Official Brand Video 2024",
     "productIds": [
       "507f1f77bcf86cd799439020",
       "507f1f77bcf86cd799439021"
     ]
   }
   ```

### Scenario 3: Product Discovery
1. **Get Videos by Product**
   - GET `{{BASE_URL}}/content-video/videos-by-product/507f1f77bcf86cd799439020`

2. **Get All Videos with Products**
   - GET `{{BASE_URL}}/content-video/videos-with-products?limit=5&page=1`

### Scenario 4: Video Reactions & Comments
1. **Like a Video**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "reactionType": "like"
   }
   ```

2. **Add a Comment**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "commentText": "Amazing fashion show! Love the designs."
   }
   ```

3. **Get User Reaction**
   - GET `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/reaction/507f1f77bcf86cd799439011`

4. **Get Comments**
   - GET `{{BASE_URL}}/content-video/videos/{{VIDEO_ID}}/comments?limit=5&page=1`

5. **Change to Dislike**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "reactionType": "dislike"
   }
   ```

6. **Update Comment**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "commentText": "Updated comment text here."
   }
   ```

7. **Delete Comment**
   ```json
   {
     "userId": "507f1f77bcf86cd799439011"
   }
   ```

## Error Testing

### Test Invalid Product IDs
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "creatorId": "507f1f77bcf86cd799439012",
  "videoUrl": "https://example.com/videos/test.mp4",
  "title": "Test Video",
  "productIds": [
    "invalid_product_id_1",
    "invalid_product_id_2"
  ]
}
```

### Test Missing Required Fields
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "videoUrl": "https://example.com/videos/test.mp4"
}
```

### Test Empty Product Array
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "creatorId": "507f1f77bcf86cd799439012",
  "videoUrl": "https://example.com/videos/test.mp4",
  "title": "Test Video",
  "productIds": []
}
```

## Expected Responses

### Successful Video Creation
```json
{
  "message": "Video created successfully",
  "video": {
    "_id": "507f1f77bcf86cd799439030",
    "title": "Spring Fashion Show 2024",
    "videoUrl": "https://example.com/videos/fashion-show-2024.mp4",
    "userId": "507f1f77bcf86cd799439011",
    "creatorId": "507f1f77bcf86cd799439012",
    "products": [
      {
        "productId": {
          "_id": "507f1f77bcf86cd799439020",
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
    "is_approved": false,
    "createdDate": "2024-01-15T10:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "message": "User ID, Creator ID, Video URL, and title are required."
}
```

## Tips for Testing

1. **Use Real IDs**: Replace the sample IDs with actual user and product IDs from your database
2. **Test Authorization**: Try requests without JWT token to test authentication
3. **Test Role Access**: Use different user roles (Admin, Designer, User) to test permissions
4. **Test Pagination**: Use different limit and page values
5. **Test Edge Cases**: Try with empty arrays, invalid IDs, and missing fields
6. **Save Responses**: Save video IDs from creation responses to use in subsequent tests

## Collection Import

You can import this as a Postman collection by creating a JSON file with the following structure:

```json
{
  "info": {
    "name": "Content Video Products API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Video with Products",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{JWT_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"507f1f77bcf86cd799439011\",\n  \"creatorId\": \"507f1f77bcf86cd799439012\",\n  \"videoUrl\": \"https://example.com/videos/fashion-show-2024.mp4\",\n  \"title\": \"Spring Fashion Show 2024\",\n  \"productIds\": [\n    \"507f1f77bcf86cd799439020\",\n    \"507f1f77bcf86cd799439021\",\n    \"507f1f77bcf86cd799439022\"\n  ]\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/content-video/videos",
          "host": ["{{BASE_URL}}"],
          "path": ["content-video", "videos"]
        }
      }
    }
  ]
}
```
