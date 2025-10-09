# Designer Store Banner Guide

## 📋 Overview
The `store_banner_web` field has been added to the Designer model to display a custom banner on the designer's store page.

---

## 🗂️ Database Schema

### Designer Model - store_banner_web Field

```javascript
{
  userId: ObjectId,
  status: Boolean,
  logoUrl: String,
  backGroundImage: String,
  store_banner_web: String,  // ← Store banner for web
  is_approved: Boolean,
  shortDescription: String,
  about: String,
  product_sample_images: [String],
  pickup_location_name: String,
  createdTime: Date,
  updatedTime: Date
}
```

**Field Details:**
- **Type**: String
- **Required**: No (optional)
- **Purpose**: Store the URL of the banner image to display on the designer's store page
- **Usage**: Designer store page at `/designer/:designerId`

---

## 🔌 API Endpoints

### 1. Update Designer with Store Banner

**Endpoint**: `PUT /designer/:id`

**Request Body**:
```json
{
  "store_banner_web": "https://cdn.example.com/designer-store-banner.jpg"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:5000/designer/6852b2e1fed2f6b70899884d" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "store_banner_web": "https://cdn.example.com/designer-store-banner.jpg"
  }'
```

**Response**:
```json
{
  "message": "Designer updated successfully",
  "designer": {
    "_id": "6852b2e1fed2f6b70899884d",
    "userId": "user_id",
    "logoUrl": "logo_url",
    "backGroundImage": "bg_url",
    "store_banner_web": "https://cdn.example.com/designer-store-banner.jpg",
    "is_approved": true,
    "shortDescription": "Designer description",
    "about": "About the designer",
    "createdTime": "2024-01-15T10:00:00.000Z",
    "updatedTime": "2024-01-20T15:30:00.000Z"
  }
}
```

---

### 2. Get Designer Details (including store banner)

**Endpoint**: `GET /designer/:id`

**cURL Example**:
```bash
curl "http://localhost:5000/designer/6852b2e1fed2f6b70899884d"
```

**Response**:
```json
{
  "designer": {
    "_id": "6852b2e1fed2f6b70899884d",
    "userId": {
      "displayName": "Designer Name",
      "email": "designer@example.com"
    },
    "logoUrl": "https://cdn.example.com/logo.png",
    "backGroundImage": "https://cdn.example.com/bg.jpg",
    "store_banner_web": "https://cdn.example.com/store-banner.jpg",
    "is_approved": true,
    "shortDescription": "Premium Designer",
    "about": "Crafting unique fashion pieces",
    "product_sample_images": [
      "https://cdn.example.com/sample1.jpg",
      "https://cdn.example.com/sample2.jpg"
    ]
  }
}
```

---

## 🎨 Frontend Integration

### React/Next.js Example

```javascript
// Fetch designer details including store banner
const fetchDesignerDetails = async (designerId) => {
  const response = await fetch(`/api/designer/${designerId}`);
  const data = await response.json();
  return data.designer;
};

// Designer Store Page Component
const DesignerStorePage = ({ designerId }) => {
  const [designer, setDesigner] = useState(null);

  useEffect(() => {
    fetchDesignerDetails(designerId).then(setDesigner);
  }, [designerId]);

  if (!designer) return <div>Loading...</div>;

  return (
    <div className="designer-store">
      {/* Store Banner */}
      {designer.store_banner_web && (
        <div className="store-banner">
          <img 
            src={designer.store_banner_web} 
            alt="Store Banner"
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Designer Info */}
      <div className="designer-info">
        <img src={designer.logoUrl} alt="Logo" />
        <h1>{designer.userId.displayName}</h1>
        <p>{designer.shortDescription}</p>
      </div>

      {/* Products */}
      <div className="products-grid">
        {/* Product listings */}
      </div>
    </div>
  );
};
```

### HTML/JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Designer Store</title>
  <style>
    .store-banner {
      width: 100%;
      height: 300px;
      overflow: hidden;
    }
    .store-banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div id="designer-store"></div>

  <script>
    const designerId = '6852b2e1fed2f6b70899884d';
    
    async function loadDesignerStore() {
      const response = await fetch(`http://localhost:5000/designer/${designerId}`);
      const data = await response.json();
      const designer = data.designer;

      const storeHTML = `
        ${designer.store_banner_web ? `
          <div class="store-banner">
            <img src="${designer.store_banner_web}" alt="Store Banner">
          </div>
        ` : ''}
        
        <div class="designer-info">
          <h1>${designer.userId.displayName}</h1>
          <p>${designer.shortDescription}</p>
        </div>
      `;

      document.getElementById('designer-store').innerHTML = storeHTML;
    }

    loadDesignerStore();
  </script>
</body>
</html>
```

---

## 📝 Update Store Banner Examples

### Example 1: Update with Image URL

```bash
curl -X PUT "http://localhost:5000/designer/6852b2e1fed2f6b70899884d" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store_banner_web": "https://storage.googleapis.com/designer-banners/banner-1920x400.jpg"
  }'
```

### Example 2: Update Multiple Fields Including Banner

```bash
curl -X PUT "http://localhost:5000/designer/6852b2e1fed2f6b70899884d" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "shortDescription": "Premium Fashion Designer",
    "about": "Creating timeless pieces since 2010",
    "store_banner_web": "https://cdn.example.com/new-store-banner.jpg"
  }'
```

### Example 3: Remove Store Banner (set to empty)

```bash
curl -X PUT "http://localhost:5000/designer/6852b2e1fed2f6b70899884d" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store_banner_web": ""
  }'
```

---

## 🖼️ Image Specifications

### Recommended Banner Dimensions

**Desktop/Web:**
- **Width**: 1920px
- **Height**: 400px - 600px
- **Aspect Ratio**: 16:9 or 3:1
- **Format**: JPG, PNG, or WebP
- **File Size**: < 500KB (optimized)

**Responsive Considerations:**
- Use high-resolution images
- Ensure text/logos are readable at all sizes
- Consider mobile viewing (banner will scale down)

---

## 🎯 Use Cases

### 1. Seasonal Promotions
```json
{
  "store_banner_web": "https://cdn.example.com/banners/diwali-sale-2024.jpg"
}
```

### 2. New Collection Launch
```json
{
  "store_banner_web": "https://cdn.example.com/banners/spring-collection.jpg"
}
```

### 3. Designer Branding
```json
{
  "store_banner_web": "https://cdn.example.com/banners/designer-signature.jpg"
}
```

### 4. Special Announcements
```json
{
  "store_banner_web": "https://cdn.example.com/banners/free-shipping.jpg"
}
```

---

## 🔐 Security & Permissions

### Who Can Update Store Banner?

1. **Admin**: Can update any designer's banner
2. **Designer**: Can update their own store banner
3. **Authorization Required**: JWT token must be provided

### Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Implementation Steps

### Step 1: Get Designer ID
Visit the designer page: `http://localhost:3001/designer/6852b2e1fed2f6b70899884d`

### Step 2: Prepare Banner Image
- Create/upload banner image to CDN or Firebase Storage
- Get the image URL

### Step 3: Update Designer
```bash
curl -X PUT "http://localhost:5000/designer/6852b2e1fed2f6b70899884d" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store_banner_web": "YOUR_BANNER_URL"
  }'
```

### Step 4: Verify on Frontend
- Refresh the designer page
- Banner should display at the top

---

## 🎨 CSS Styling Example

```css
/* Store Banner Container */
.designer-store-banner {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
}

.designer-store-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Responsive */
@media (max-width: 768px) {
  .designer-store-banner {
    height: 200px;
  }
}

/* With Overlay Text */
.designer-store-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.3) 100%
  );
}

.designer-store-banner .overlay-text {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  z-index: 1;
}
```

---

## 📊 Complete Designer Store Page Example

```javascript
import React, { useState, useEffect } from 'react';

const DesignerStorePage = ({ match }) => {
  const [designer, setDesigner] = useState(null);
  const [products, setProducts] = useState([]);
  const designerId = match.params.designerId;

  useEffect(() => {
    // Fetch designer details
    fetch(`http://localhost:5000/designer/${designerId}`)
      .then(res => res.json())
      .then(data => setDesigner(data.designer));

    // Fetch designer products
    fetch(`http://localhost:5000/products?designerRef=${designerId}`)
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, [designerId]);

  if (!designer) return <div>Loading...</div>;

  return (
    <div className="designer-store-page">
      {/* Store Banner */}
      {designer.store_banner_web && (
        <div className="store-banner">
          <img src={designer.store_banner_web} alt="Store Banner" />
        </div>
      )}

      {/* Designer Header */}
      <div className="designer-header">
        <div className="designer-logo">
          <img src={designer.logoUrl} alt={designer.userId.displayName} />
        </div>
        <div className="designer-info">
          <h1>{designer.userId.displayName}</h1>
          <p className="short-desc">{designer.shortDescription}</p>
          <p className="about">{designer.about}</p>
        </div>
      </div>

      {/* Background Image */}
      {designer.backGroundImage && (
        <div className="background-section">
          <img src={designer.backGroundImage} alt="Background" />
        </div>
      )}

      {/* Product Samples */}
      {designer.product_sample_images?.length > 0 && (
        <div className="sample-images">
          <h2>Product Showcase</h2>
          <div className="samples-grid">
            {designer.product_sample_images.map((img, idx) => (
              <img key={idx} src={img} alt={`Sample ${idx + 1}`} />
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-section">
        <h2>All Products</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.coverImage} alt={product.productName} />
              <h3>{product.productName}</h3>
              <p>₹{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignerStorePage;
```

---

## ✅ Summary

### What We Have:
- ✅ `store_banner_web` field in Designer model
- ✅ Update endpoint available at `PUT /designer/:id`
- ✅ Get endpoint returns the banner URL
- ✅ Field is optional (can be null/empty)

### How to Use:
1. Upload banner image to CDN/Firebase Storage
2. Get the image URL
3. Update designer with `PUT /designer/:id` including `store_banner_web` field
4. Frontend fetches designer details and displays banner

### Designer Page URL:
`http://localhost:3001/designer/6852b2e1fed2f6b70899884d`

The banner will appear at the top of this page once the `store_banner_web` field is set!

---

**Ready to add beautiful store banners to designer pages!** 🎨

