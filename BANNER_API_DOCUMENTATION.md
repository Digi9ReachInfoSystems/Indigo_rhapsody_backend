# Banner API Documentation

## Overview
Comprehensive banner management system supporting web and mobile platforms with page-based organization, scheduling, analytics tracking, and rich customization options.

---

## Table of Contents
1. [Features](#features)
2. [Schema Structure](#schema-structure)
3. [API Endpoints](#api-endpoints)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Features

### ✨ Core Features
- **Multi-Platform Support**: Create banners for web, mobile, or both platforms
- **Responsive Images**: Different images for desktop, tablet, and mobile
- **Page-Based Organization**: Associate banners with specific pages
- **Action Linking**: Link to products, categories, designers, or custom URLs
- **Scheduling**: Set start and end dates for banner visibility
- **Display Ordering**: Control banner sequence with display order
- **Status Management**: Activate/deactivate banners on demand
- **Analytics**: Track clicks, impressions, and calculate CTR
- **Customization**: Custom button text, colors, and styling

### 🎯 Supported Pages
- `home` - Homepage
- `products` - Product listing page
- `categories` - Category page
- `designers` - Designer showcase
- `about` - About us page
- `contact` - Contact page
- `checkout` - Checkout page
- `profile` - User profile
- `cart` - Shopping cart
- `wishlist` - Wishlist page
- `orders` - Order history
- `custom` - Custom pages

### 🔗 Action Types
- `none` - Display only (no action)
- `url` - Link to external/internal URL
- `product` - Link to specific product
- `category` - Link to category
- `designer` - Link to designer profile
- `page` - Link to app page

### 📱 Platform Options
- `web` - Web platform only
- `mobile` - Mobile app only
- `both` - All platforms

---

## Schema Structure

```javascript
{
  // Basic Information
  name: String,              // Banner name (required)
  title: String,             // Display title
  subtitle: String,          // Display subtitle
  description: String,       // Banner description
  
  // Platform
  platform: String,          // "web" | "mobile" | "both"
  
  // Images
  images: {
    web: {
      desktop: String,       // Desktop image URL
      tablet: String         // Tablet image URL
    },
    mobile: String           // Mobile image URL
  },
  image: String,             // Legacy image field
  
  // Page Relationship
  page: String,              // Page enum (required)
  customPage: String,        // For custom pages
  
  // Action/Link
  actionType: String,        // Action type enum
  actionValue: String,       // Action value
  actionUrl: String,         // Action URL
  linkedProduct: ObjectId,   // Product reference
  linkedCategory: ObjectId,  // Category reference
  linkedDesigner: ObjectId,  // Designer reference
  
  // Display Settings
  displayOrder: Number,      // Display sequence (default: 0)
  isActive: Boolean,         // Active status (default: true)
  
  // Scheduling
  startDate: Date,           // Start date (optional)
  endDate: Date,             // End date (optional)
  
  // Customization
  buttonText: String,        // CTA button text
  buttonColor: String,       // Button color (hex)
  textColor: String,         // Text color (hex)
  
  // Analytics
  clickCount: Number,        // Total clicks
  impressionCount: Number,   // Total impressions
  
  // Metadata
  tags: [String],            // Tags array
  createdBy: ObjectId,       // Creator user
  updatedBy: ObjectId,       // Last updater
  createdDate: Date,         // Creation date
  updatedDate: Date          // Last update date
}
```

---

## API Endpoints

### Public Endpoints

#### 1. Get All Banners
```http
GET /banner
```

**Query Parameters:**
- `page` (string) - Filter by page
- `platform` (string) - Filter by platform (web/mobile/both)
- `isActive` (boolean) - Filter by active status
- `limit` (number) - Results per page (default: 50)
- `skip` (number) - Skip results (default: 0)
- `sortBy` (string) - Sort field (default: displayOrder)
- `sortOrder` (string) - Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "banner_id",
      "name": "Summer Sale Banner",
      "title": "Summer Collection 2024",
      "platform": "both",
      "page": "home",
      "isActive": true,
      "displayOrder": 1,
      "images": {
        "web": {
          "desktop": "url",
          "tablet": "url"
        },
        "mobile": "url"
      }
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

#### 2. Get Banners by Page
```http
GET /banner/page/:pageName
```

**Query Parameters:**
- `platform` (string) - Filter by platform

**Example:**
```bash
GET /banner/page/home?platform=mobile
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "banner_id",
      "name": "Home Banner 1",
      "title": "Welcome to Our Store",
      "platform": "mobile",
      "page": "home",
      "images": {
        "mobile": "https://example.com/banner.jpg"
      },
      "linkedProduct": {
        "_id": "product_id",
        "productName": "Designer Dress",
        "price": 2999
      }
    }
  ],
  "count": 3
}
```

#### 3. Get Single Banner
```http
GET /banner/:bannerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "banner_id",
    "name": "Featured Banner",
    "title": "New Arrivals",
    "subtitle": "Shop the Latest",
    "platform": "both",
    "page": "products",
    "clickCount": 150,
    "impressionCount": 1000,
    "createdBy": {
      "displayName": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

#### 4. Track Banner Click
```http
POST /banner/:bannerId/click
```

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "bannerId": "banner_id",
    "clickCount": 151
  }
}
```

#### 5. Track Banner Impression
```http
POST /banner/:bannerId/impression
```

**Response:**
```json
{
  "success": true,
  "message": "Impression tracked successfully",
  "data": {
    "bannerId": "banner_id",
    "impressionCount": 1001
  }
}
```

---

### Admin Endpoints (Require Authentication)

#### 6. Create Banner
```http
POST /banner
Headers: Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "Summer Sale Banner",
  "title": "Summer Collection 2024",
  "subtitle": "Up to 50% Off",
  "description": "Get the best deals on summer fashion",
  "platform": "both",
  "page": "home",
  "actionType": "url",
  "actionUrl": "/products?category=summer",
  "displayOrder": 1,
  "isActive": true,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "buttonText": "Shop Now",
  "buttonColor": "#FF6B6B",
  "textColor": "#FFFFFF",
  "tags": ["summer", "sale", "featured"],
  "webDesktopUrl": "https://example.com/banners/summer-desktop.jpg",
  "webTabletUrl": "https://example.com/banners/summer-tablet.jpg",
  "mobileUrl": "https://example.com/banners/summer-mobile.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "new_banner_id",
    "name": "Summer Sale Banner",
    "platform": "both",
    "page": "home",
    "isActive": true
  }
}
```

#### 7. Update Banner
```http
PUT /banner/:bannerId
Headers: Authorization: Bearer {admin_token}
```

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "subtitle": "Updated Subtitle",
  "isActive": false,
  "displayOrder": 5
}
```

#### 8. Delete Banner
```http
DELETE /banner/:bannerId
Headers: Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully",
  "data": {
    "_id": "deleted_banner_id"
  }
}
```

#### 9. Toggle Banner Status
```http
PATCH /banner/:bannerId/toggle
Headers: Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner activated successfully",
  "data": {
    "_id": "banner_id",
    "isActive": true
  }
}
```

#### 10. Reorder Banners
```http
POST /banner/reorder
Headers: Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "banners": [
    { "bannerId": "banner_id_1", "displayOrder": 0 },
    { "bannerId": "banner_id_2", "displayOrder": 1 },
    { "bannerId": "banner_id_3", "displayOrder": 2 }
  ]
}
```

#### 11. Get Banner Analytics
```http
GET /banner/:bannerId/analytics
Headers: Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bannerId": "banner_id",
    "name": "Summer Sale Banner",
    "clickCount": 250,
    "impressionCount": 5000,
    "clickThroughRate": "5.00%",
    "createdDate": "2024-01-15T10:30:00Z"
  }
}
```

---

## Usage Examples

### Example 1: Create Homepage Banner for Mobile App

```bash
curl -X POST "http://localhost:5000/banner" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Mobile App Launch Banner",
    "title": "Welcome to Our App",
    "subtitle": "Shop Fashion on the Go",
    "platform": "mobile",
    "page": "home",
    "actionType": "page",
    "actionValue": "products",
    "displayOrder": 1,
    "isActive": true,
    "buttonText": "Start Shopping",
    "buttonColor": "#4ECDC4",
    "textColor": "#FFFFFF",
    "mobileUrl": "https://cdn.example.com/app-banner.jpg"
  }'
```

### Example 2: Create Product-Linked Banner

```bash
curl -X POST "http://localhost:5000/banner" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Featured Product Banner",
    "title": "Product of the Week",
    "subtitle": "Exclusive Designer Dress",
    "platform": "both",
    "page": "products",
    "actionType": "product",
    "linkedProduct": "product_id_here",
    "displayOrder": 1,
    "isActive": true,
    "buttonText": "Buy Now",
    "webDesktopUrl": "https://cdn.example.com/product-banner-desktop.jpg",
    "mobileUrl": "https://cdn.example.com/product-banner-mobile.jpg"
  }'
```

### Example 3: Create Scheduled Sale Banner

```bash
curl -X POST "http://localhost:5000/banner" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Black Friday Banner",
    "title": "Black Friday Mega Sale",
    "subtitle": "70% Off Everything",
    "platform": "both",
    "page": "home",
    "actionType": "url",
    "actionUrl": "/black-friday-deals",
    "displayOrder": 0,
    "isActive": true,
    "startDate": "2024-11-25T00:00:00Z",
    "endDate": "2024-11-30T23:59:59Z",
    "buttonText": "Shop Deals",
    "tags": ["black-friday", "sale", "limited-time"],
    "webDesktopUrl": "https://cdn.example.com/bf-desktop.jpg",
    "mobileUrl": "https://cdn.example.com/bf-mobile.jpg"
  }'
```

### Example 4: Get Mobile Banners for Home Page

```bash
curl -X GET "http://localhost:5000/banner/page/home?platform=mobile" \
  -H "Content-Type: application/json"
```

### Example 5: Track Banner Analytics

```javascript
// Track impression when banner is viewed
fetch(`/banner/${bannerId}/impression`, { method: 'POST' });

// Track click when banner is clicked
fetch(`/banner/${bannerId}/click`, { method: 'POST' })
  .then(() => {
    // Navigate to banner action URL
    window.location.href = bannerActionUrl;
  });
```

---

## Best Practices

### 1. Image Management
- **Desktop**: Use high-resolution images (1920x600px or larger)
- **Tablet**: Use medium-resolution images (1024x400px)
- **Mobile**: Use optimized images (750x400px or smaller)
- Always compress images before uploading
- Use WebP format for better performance

### 2. Platform Targeting
- Use `platform: "web"` for desktop-specific promotions
- Use `platform: "mobile"` for app-exclusive offers
- Use `platform: "both"` for general campaigns

### 3. Scheduling
- Set `startDate` for future campaigns
- Set `endDate` to auto-deactivate expired banners
- Leave both null for permanent banners
- System automatically filters based on current date

### 4. Display Order
- Lower numbers appear first (0, 1, 2, ...)
- Use intervals of 10 (0, 10, 20) for easier reordering
- Keep most important banners at displayOrder: 0

### 5. Analytics
- Track impressions on banner view
- Track clicks on banner interaction
- Regularly review CTR to optimize banner performance
- A/B test different designs and messages

### 6. Action Types
- Use `product` for direct product sales
- Use `category` for collection promotions
- Use `designer` for brand spotlights
- Use `url` for custom landing pages
- Use `none` for informational banners

### 7. Page Organization
- Keep 2-5 banners per page for optimal UX
- Rotate banners regularly to maintain freshness
- Use scheduling for seasonal content
- Test banner performance per page

### 8. Mobile Optimization
- Keep text minimal on mobile banners
- Use larger fonts and buttons
- Ensure touch targets are at least 44x44px
- Test on various screen sizes

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Banner name is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Banner not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating banner",
  "error": "Detailed error message"
}
```

---

## Integration Guide

### Frontend Integration (React/Next.js)

```javascript
// Fetch banners for a page
const fetchBanners = async (page, platform) => {
  const response = await fetch(
    `/api/banner/page/${page}?platform=${platform}`
  );
  const data = await response.json();
  return data.data;
};

// Track banner impression
const trackImpression = (bannerId) => {
  fetch(`/api/banner/${bannerId}/impression`, { method: 'POST' });
};

// Track banner click
const handleBannerClick = async (banner) => {
  await fetch(`/api/banner/${banner._id}/click`, { method: 'POST' });
  
  // Navigate based on action type
  switch (banner.actionType) {
    case 'product':
      router.push(`/product/${banner.linkedProduct._id}`);
      break;
    case 'category':
      router.push(`/category/${banner.linkedCategory._id}`);
      break;
    case 'url':
      router.push(banner.actionUrl);
      break;
  }
};
```

### Mobile App Integration (React Native)

```javascript
import { useEffect, useState } from 'react';

const BannerCarousel = ({ page }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, [page]);

  const fetchBanners = async () => {
    const response = await fetch(
      `${API_URL}/banner/page/${page}?platform=mobile`
    );
    const data = await response.json();
    setBanners(data.data);
    
    // Track impressions
    data.data.forEach(banner => {
      trackImpression(banner._id);
    });
  };

  return (
    <Carousel>
      {banners.map(banner => (
        <TouchableOpacity
          key={banner._id}
          onPress={() => handleBannerClick(banner)}
        >
          <Image source={{ uri: banner.images.mobile }} />
          <Text>{banner.title}</Text>
          <Button title={banner.buttonText} />
        </TouchableOpacity>
      ))}
    </Carousel>
  );
};
```

---

## Database Indexes

The banner schema includes optimized indexes for common queries:

```javascript
// Composite index for page-based queries
{ page: 1, isActive: 1, displayOrder: 1 }

// Index for platform filtering
{ platform: 1, isActive: 1 }

// Index for date-based queries
{ startDate: 1, endDate: 1 }
```

---

## Support

For issues or questions:
- Check the test file: `test_banner_api.curl`
- Review example requests in this documentation
- Ensure proper authentication for admin endpoints
- Verify banner IDs are valid MongoDB ObjectIds

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Maintained By:** Indigo Rhapsody Development Team

