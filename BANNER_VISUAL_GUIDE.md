# Banner System - Visual Guide

## 🎨 Banner System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BANNER SYSTEM                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     WEB      │  │    MOBILE    │  │     BOTH     │     │
│  │   PLATFORM   │  │   PLATFORM   │  │  PLATFORMS   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│              ┌────────────▼──────────────┐                 │
│              │     PAGE ASSIGNMENT       │                 │
│              │  home | products | cart   │                 │
│              │  designers | categories   │                 │
│              └────────────┬──────────────┘                 │
│                           │                                │
│              ┌────────────▼──────────────┐                 │
│              │   ACTION TYPES            │                 │
│              │  url | product | category │                 │
│              │  designer | page | none   │                 │
│              └────────────┬──────────────┘                 │
│                           │                                │
│              ┌────────────▼──────────────┐                 │
│              │   ANALYTICS TRACKING      │                 │
│              │  clicks | impressions     │                 │
│              │  CTR calculation          │                 │
│              └───────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Platform-Specific Banner Flow

### Web Platform Flow
```
User visits webpage
       │
       ▼
GET /banner/page/home?platform=web
       │
       ▼
Returns banners with:
  - images.web.desktop (1920x600)
  - images.web.tablet (1024x400)
       │
       ▼
Display banner carousel
       │
       ▼
POST /banner/:id/impression
       │
       ▼
User clicks banner
       │
       ▼
POST /banner/:id/click
       │
       ▼
Navigate to action URL
```

### Mobile Platform Flow
```
User opens app
       │
       ▼
GET /banner/page/home?platform=mobile
       │
       ▼
Returns banners with:
  - images.mobile (750x400)
       │
       ▼
Display banner carousel
       │
       ▼
POST /banner/:id/impression
       │
       ▼
User taps banner
       │
       ▼
POST /banner/:id/click
       │
       ▼
Navigate based on actionType
```

---

## 🗂️ File Structure

```
Indigorhapsody/Backend/
│
├── src/
│   ├── models/
│   │   └── bannerModel.js ✨ (Enhanced)
│   │
│   ├── controllers/
│   │   └── bannerController.js ✨ (New)
│   │
│   └── routes/
│       └── bannerRoutes.js ✨ (Updated)
│
├── Documentation/
│   ├── BANNER_API_DOCUMENTATION.md ✨ (New)
│   ├── BANNER_QUICK_START.md ✨ (New)
│   ├── BANNER_SYSTEM_SUMMARY.md ✨ (New)
│   └── BANNER_VISUAL_GUIDE.md ✨ (New - This file)
│
└── Testing/
    └── test_banner_api.curl ✨ (New)
```

---

## 🎯 Page-Banner Relationship

```
┌─────────────────────────────────────────────────────┐
│                    PAGES                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  HOME PAGE              ┌──────────────────┐       │
│  ├─ Hero Banner         │  displayOrder: 0 │       │
│  ├─ Sale Banner         │  displayOrder: 1 │       │
│  └─ New Arrival         │  displayOrder: 2 │       │
│                         └──────────────────┘       │
│  PRODUCTS PAGE          ┌──────────────────┐       │
│  ├─ Category Banner     │  displayOrder: 0 │       │
│  └─ Filter Banner       │  displayOrder: 1 │       │
│                         └──────────────────┘       │
│  DESIGNERS PAGE         ┌──────────────────┐       │
│  ├─ Featured Designer   │  displayOrder: 0 │       │
│  └─ Collection Banner   │  displayOrder: 1 │       │
│                         └──────────────────┘       │
│  CHECKOUT PAGE          ┌──────────────────┐       │
│  ├─ Free Shipping       │  displayOrder: 0 │       │
│  └─ Discount Code       │  displayOrder: 1 │       │
│                         └──────────────────┘       │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Action Type Examples

### 1. URL Action
```
┌──────────────────────────────┐
│   SUMMER SALE BANNER         │
│   "Up to 50% Off"            │
│                              │
│   [Shop Now] ──────────────► /summer-collection
│                              │
└──────────────────────────────┘
```

### 2. Product Action
```
┌──────────────────────────────┐
│   FEATURED PRODUCT           │
│   "Designer Dress"           │
│                              │
│   [Buy Now] ────────────────► Product Detail Page
│                              │  (linkedProduct populated)
└──────────────────────────────┘
```

### 3. Category Action
```
┌──────────────────────────────┐
│   NEW COLLECTION             │
│   "Spring Collection"        │
│                              │
│   [Explore] ────────────────► Category Page
│                              │  (linkedCategory populated)
└──────────────────────────────┘
```

### 4. Designer Action
```
┌──────────────────────────────┐
│   DESIGNER SPOTLIGHT         │
│   "Featured Designer"        │
│                              │
│   [View] ───────────────────► Designer Profile
│                              │  (linkedDesigner populated)
└──────────────────────────────┘
```

---

## 📊 Analytics Dashboard View

```
┌─────────────────────────────────────────────────────────┐
│              BANNER ANALYTICS DASHBOARD                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Banner: "Summer Sale 2024"                            │
│  Page: home                                            │
│  Platform: both                                        │
│  Status: ● Active                                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  IMPRESSIONS │  │    CLICKS    │  │     CTR      │ │
│  │              │  │              │  │              │ │
│  │    5,000     │  │     250      │  │    5.00%     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  Created: Jan 15, 2024                                 │
│  Schedule: Jun 1 - Aug 31, 2024                        │
│                                                         │
│  [Edit]  [Toggle Status]  [Delete]  [View Details]    │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ Responsive Image Mapping

```
BANNER IMAGES STRUCTURE

┌─────────────────────────────────────────────┐
│            images: {                        │
│              web: {                         │
│                desktop: "url_1920x600.jpg" ─┼──► Desktop Display
│                tablet: "url_1024x400.jpg"  ─┼──► Tablet Display
│              },                             │
│              mobile: "url_750x400.jpg"     ─┼──► Mobile Display
│            }                                │
└─────────────────────────────────────────────┘

PLATFORM SELECTION:

platform: "web"    ──► Use images.web.desktop/tablet
platform: "mobile" ──► Use images.mobile
platform: "both"   ──► Use appropriate image based on device
```

---

## 🔄 Banner Lifecycle

```
CREATE                ACTIVE              INACTIVE             DELETE
  │                     │                    │                   │
  ▼                     ▼                    ▼                   ▼
┌─────┐             ┌─────┐              ┌─────┐             ┌─────┐
│ NEW │─────────────│ ON  │──────────────│ OFF │─────────────│ DEL │
└─────┘             └─────┘              └─────┘             └─────┘
  │                     │                    │
  │                     │                    │
  ├── Set properties    ├── Display on app  ├── Hidden from app
  ├── Upload images     ├── Track analytics ├── Preserved in DB
  ├── Assign page       ├── User clicks     ├── Can reactivate
  └── Schedule dates    └── Generate CTR    └── Analytics retained

SCHEDULED BANNERS:
  startDate ──► Auto-activate when date arrives
  endDate   ──► Auto-deactivate when date passes
```

---

## 🎨 Banner Display Patterns

### Carousel Pattern
```
┌───────────────────────────────────────────┐
│  ◄  [Banner 1]  [Banner 2]  [Banner 3]  ► │
│                                           │
│      ●        ○        ○                  │ ← Indicators
└───────────────────────────────────────────┘
```

### Grid Pattern
```
┌─────────────────┐  ┌─────────────────┐
│   Banner 1      │  │   Banner 2      │
│  displayOrder:0 │  │  displayOrder:1 │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│   Banner 3      │  │   Banner 4      │
│  displayOrder:2 │  │  displayOrder:3 │
└─────────────────┘  └─────────────────┘
```

### Stack Pattern
```
┌─────────────────────────────────────┐
│        Banner 1 (displayOrder: 0)   │
├─────────────────────────────────────┤
│        Banner 2 (displayOrder: 1)   │
├─────────────────────────────────────┤
│        Banner 3 (displayOrder: 2)   │
└─────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
PUBLIC ACCESS               ADMIN ACCESS
     │                           │
     ▼                           ▼
┌─────────┐                 ┌─────────┐
│  VIEW   │                 │  JWT    │
│ BANNERS │                 │  TOKEN  │
└─────────┘                 └─────────┘
     │                           │
     ▼                           ▼
┌─────────┐                 ┌─────────┐
│  TRACK  │                 │  CRUD   │
│ANALYTICS│                 │  OPS    │
└─────────┘                 └─────────┘
     │                           │
     ▼                           ▼
No auth required            Admin role required

PUBLIC ENDPOINTS:           ADMIN ENDPOINTS:
• GET /banner              • POST /banner
• GET /banner/page/:id     • PUT /banner/:id
• GET /banner/:id          • DELETE /banner/:id
• POST /banner/:id/click   • PATCH /banner/:id/toggle
• POST /banner/:id/impression  • POST /banner/reorder
                           • GET /banner/:id/analytics
```

---

## 📈 CTR Calculation Flow

```
Banner Viewed
     │
     ▼
POST /banner/:id/impression
     │
     ▼
impressionCount++
     │
     ▼
Display to user
     │
     ▼
User clicks?
     │
     ├──NO──► End
     │
     ▼ YES
POST /banner/:id/click
     │
     ▼
clickCount++
     │
     ▼
Calculate CTR:
CTR = (clickCount / impressionCount) × 100%
     │
     ▼
Example: (250 / 5000) × 100% = 5.00%
```

---

## 🗓️ Scheduling System

```
Banner Scheduling Timeline

─────────────────────────────────────────────────────►
                                                  Time

    startDate              NOW                endDate
        │                   │                    │
        ▼                   ▼                    ▼
    ┌───────────────────────────────────────────┐
    │                                           │
    │         BANNER IS ACTIVE                  │
    │                                           │
    └───────────────────────────────────────────┘

BEFORE startDate:  isActive = false (scheduled)
BETWEEN dates:     isActive = true (active)
AFTER endDate:     isActive = false (expired)

NULL dates:        Always active (if isActive = true)
```

---

## 🎯 Use Case Scenarios

### Scenario 1: Mobile App Homepage
```
USER: Opens mobile app
  │
  ▼
APP: Calls GET /banner/page/home?platform=mobile
  │
  ▼
API: Returns 3 active banners
  │
  ├─► Banner 1: Welcome offer (displayOrder: 0)
  ├─► Banner 2: New arrivals (displayOrder: 1)
  └─► Banner 3: App exclusive (displayOrder: 2)
  │
  ▼
APP: Displays in carousel format
  │
  ▼
APP: Tracks impressions for each banner
  │
  ▼
USER: Swipes and clicks Banner 2
  │
  ▼
APP: Tracks click + navigates to new arrivals
```

### Scenario 2: Web Desktop Homepage
```
USER: Visits website homepage
  │
  ▼
WEB: Calls GET /banner/page/home?platform=web
  │
  ▼
API: Returns 2 active banners
  │
  ├─► Banner 1: Summer sale (images.web.desktop)
  └─► Banner 2: Free shipping (images.web.desktop)
  │
  ▼
WEB: Displays hero carousel
  │
  ▼
WEB: Auto-tracks impressions
  │
  ▼
USER: Clicks Banner 1
  │
  ▼
WEB: Tracks click + redirects to /summer-sale
```

---

## 📱 Platform Detection

```
Request Headers Analysis
         │
         ▼
    User-Agent?
         │
    ├────┴────┐
    ▼         ▼
  Mobile     Web
    │         │
    ▼         ▼
platform=   platform=
 mobile      web
    │         │
    └────┬────┘
         ▼
Filter banners:
platform === requested
  OR
platform === "both"
```

---

## 🎨 Color Customization

```
Banner Styling Options

┌─────────────────────────────────────┐
│  SUMMER SALE                        │
│  Up to 50% Off                      │
│                                     │
│  ┌──────────────────────┐           │
│  │    [Shop Now]        │ ← buttonText
│  │                      │
│  │  Background: #FF6B6B │ ← buttonColor
│  │  Text: #FFFFFF       │ ← textColor
│  └──────────────────────┘           │
└─────────────────────────────────────┘

Customization Fields:
• buttonText: "Shop Now"
• buttonColor: "#FF6B6B" (red)
• textColor: "#FFFFFF" (white)
```

---

## 📊 Admin Dashboard Layout

```
┌───────────────────────────────────────────────────────────┐
│  BANNER MANAGEMENT                        [+ New Banner]  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Filter: [All Pages ▼] [All Platforms ▼] [Active ▼]     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Banner Name         │ Page    │ Platform │ Status   │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ Summer Sale 2024    │ home    │ both     │ ● Active │ │
│  │ New Arrivals        │ products│ mobile   │ ● Active │ │
│  │ Designer Spotlight  │ designer│ web      │ ○ Inactive│ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Actions: [Reorder] [Bulk Edit] [Export Analytics]       │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Command Reference

```bash
# CREATE BANNER
curl -X POST /banner \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "name": "...", "page": "home", ... }'

# GET BANNERS BY PAGE
curl /banner/page/home?platform=mobile

# UPDATE BANNER
curl -X PUT /banner/BANNER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "title": "New Title" }'

# DELETE BANNER
curl -X DELETE /banner/BANNER_ID \
  -H "Authorization: Bearer TOKEN"

# TOGGLE STATUS
curl -X PATCH /banner/BANNER_ID/toggle \
  -H "Authorization: Bearer TOKEN"

# TRACK CLICK
curl -X POST /banner/BANNER_ID/click

# GET ANALYTICS
curl /banner/BANNER_ID/analytics \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Implementation Checklist

```
┌─── DATABASE ─────────────────────────────────┐
│ ✅ Schema created with all fields           │
│ ✅ Indexes added for performance            │
│ ✅ Virtual fields for computed properties   │
└──────────────────────────────────────────────┘

┌─── BACKEND ──────────────────────────────────┐
│ ✅ Controller functions (11 total)          │
│ ✅ Routes configured (11 endpoints)         │
│ ✅ Authentication middleware applied        │
│ ✅ Validation implemented                   │
└──────────────────────────────────────────────┘

┌─── FEATURES ─────────────────────────────────┐
│ ✅ Multi-platform support                   │
│ ✅ Page-based organization                  │
│ ✅ Responsive images                        │
│ ✅ Action linking                           │
│ ✅ Scheduling system                        │
│ ✅ Analytics tracking                       │
│ ✅ Display ordering                         │
└──────────────────────────────────────────────┘

┌─── DOCUMENTATION ────────────────────────────┐
│ ✅ API documentation                        │
│ ✅ Quick start guide                        │
│ ✅ Visual guide                             │
│ ✅ Test suite                               │
└──────────────────────────────────────────────┘
```

---

**System Status: ✅ Production Ready**

All components are implemented, tested, and documented!

