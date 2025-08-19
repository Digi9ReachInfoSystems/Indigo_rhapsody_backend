# Return API Documentation

## Overview

The Return API implements a comprehensive return flow for the Indigo Rhapsody e-commerce platform. This system handles the complete return process from customer request to refund processing, including logistics coordination and fulfillment staff workflows.

## Return Flow

### 1. Customer Return Request
- **Eligibility Check**: Validates if the item is within the 7-day return window and marked as returnable
- **Request Creation**: Creates return request with unique return ID
- **Pickup Scheduling**: Automatically creates pickup request for logistics partner
- **Notifications**: Sends email and in-app notifications to customer

### 2. Logistics & Pickup
- **Pickup Request**: System creates pickup request sent to logistics partner
- **Product Delivery**: Returned product is delivered to original dealer's location

### 3. Fulfillment Staff Inspection
- **SKU Verification**: Staff checks if SKU matches the original order
- **Condition Assessment**: Staff inspects product condition
- **Decision**: Approve or reject based on inspection results

### 4. Refund Processing
- **Admin Review**: Fulfillment admin processes approved returns
- **Payment Integration**: Integrates with payment gateway for refund processing
- **Customer Notification**: Sends confirmation emails and notifications

## API Endpoints

### Base URL
```
http://localhost:5000/return
```

### Authentication
All endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Customer Endpoints

### 1. Request Return
**POST** `/request`

Creates a new return request for a product in an order.

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "productId": "product_id_here",
  "reason": "Product doesn't fit as expected",
  "images": ["image_url_1", "image_url_2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "productName": "Designer Dress",
    "returnStatus": "requested",
    "pickupRequestId": "PICKUP-1703123456789",
    "estimatedPickupDate": "2023-12-22T10:00:00.000Z"
  }
}
```

**Validation Rules:**
- Order must be delivered
- Product must be within 7-day return window
- Product must be marked as returnable
- Return request must not already exist for this product

---

### 2. Get Return Details
**GET** `/details/:returnId`

Retrieves detailed information about a specific return request.

**Response:**
```json
{
  "success": true,
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "productName": "Designer Dress",
    "returnStatus": "approved",
    "returnReason": "Product doesn't fit as expected",
    "returnRequestDate": "2023-12-20T10:00:00.000Z",
    "returnWindowExpiry": "2023-12-27T10:00:00.000Z",
    "inspectionResult": "approved",
    "rejectionReason": null,
    "refundAmount": 150.00,
    "refundMethod": "credit_card",
    "refundDate": "2023-12-22T15:30:00.000Z",
    "returnImages": ["image_url_1", "image_url_2"],
    "inspectionImages": ["inspection_image_1"]
  }
}
```

---

### 3. Get Customer Returns
**GET** `/customer?page=1&limit=10&status=approved`

Retrieves all return requests for the authenticated customer.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by return status

**Response:**
```json
{
  "success": true,
  "data": {
    "returns": [
      {
        "returnId": "RET-1703123456789-abc123def",
        "orderId": "ORD-12345",
        "productName": "Designer Dress",
        "returnStatus": "approved",
        "returnRequestDate": "2023-12-20T10:00:00.000Z",
        "refundAmount": 150.00
      }
    ],
    "totalPages": 2,
    "currentPage": 1,
    "totalReturns": 15
  }
}
```

---

## Staff Endpoints

### 4. Inspect Returned Item
**POST** `/inspect`

**Required Role:** Staff or Admin

Fulfillment staff inspects the returned item and approves or rejects the return.

**Request Body:**
```json
{
  "returnId": "RET-1703123456789-abc123def",
  "inspectionResult": "approved",
  "rejectionReason": null,
  "inspectionImages": ["inspection_image_1", "inspection_image_2"]
}
```

**Inspection Results:**
- `approved`: Item meets return criteria
- `rejected`: Item doesn't meet return criteria

**Response:**
```json
{
  "success": true,
  "message": "Return approved successfully",
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "inspectionResult": "approved",
    "returnStatus": "approved"
  }
}
```

**Workflow:**
- If approved: Creates notification for admin to process refund
- If rejected: Sends rejection notification and email to customer

---

## Admin Endpoints

### 5. Process Refund
**POST** `/process-refund`

**Required Role:** Admin

Fulfillment admin processes the refund for approved returns.

**Request Body:**
```json
{
  "returnId": "RET-1703123456789-abc123def",
  "refundAmount": 150.00,
  "refundMethod": "credit_card",
  "adminNotes": "Refund processed as requested"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "refundAmount": 150.00,
    "refundMethod": "credit_card",
    "refundTransactionId": "REFUND-1703123456789"
  }
}
```

**Workflow:**
- Integrates with payment gateway
- Updates return status to "refunded"
- Sends confirmation email to customer
- Updates order status if all products returned

---

### 6. Get All Returns
**GET** `/all?page=1&limit=10&status=approved&designerRef=designer_id`

**Required Role:** Admin or Staff

Retrieves all return requests for administrative purposes.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by return status
- `designerRef` (optional): Filter by designer reference

**Response:**
```json
{
  "success": true,
  "data": {
    "returns": [
      {
        "returnId": "RET-1703123456789-abc123def",
        "orderId": "ORD-12345",
        "customerName": "John Doe",
        "customerEmail": "john@example.com",
        "productName": "Designer Dress",
        "designerRef": "designer_id_here",
        "returnStatus": "approved",
        "returnRequestDate": "2023-12-20T10:00:00.000Z",
        "inspectionResult": "approved",
        "refundAmount": 150.00
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalReturns": 50
  }
}
```

---

## Return Status Flow

```
requested → approved → refunded
     ↓
  rejected
```

**Status Descriptions:**
- `requested`: Customer has submitted return request
- `approved`: Fulfillment staff has approved the return
- `rejected`: Fulfillment staff has rejected the return
- `refunded`: Admin has processed the refund

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Order ID, Product ID, and reason are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Return request not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Integration Points

### 1. Payment Gateway Integration
The refund processing integrates with payment gateways (Stripe, Razorpay, etc.) to process actual refunds.

### 2. Logistics Partner Integration
Pickup requests are sent to logistics partners for scheduling and tracking.

### 3. Email Notifications
Automated emails are sent for:
- Return request confirmation
- Return rejection
- Refund confirmation

### 4. In-App Notifications
Real-time notifications are sent to users for status updates.

---

## Database Schema Updates

### Product Model
Added `returnable` field:
```javascript
returnable: {
  type: Boolean,
  default: true,
}
```

### Order Model (Products Array)
Added return-related fields:
```javascript
returnReason: String,
returnImages: [String],
returnRequestDate: Date,
returnWindowExpiry: Date,
inspectionResult: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending",
},
inspectionDate: Date,
inspectedBy: ObjectId,
inspectionImages: [String],
rejectionReason: String,
approvedForRefund: Boolean,
refundProcessed: Boolean,
refundAmount: Number,
refundMethod: String,
refundDate: Date,
processedBy: ObjectId,
adminNotes: String,
```

---

## Testing

### Test Cases

1. **Valid Return Request**
   - Order is delivered
   - Within return window
   - Product is returnable

2. **Invalid Return Request**
   - Order not delivered
   - Outside return window
   - Product not returnable

3. **Staff Inspection**
   - Approve valid return
   - Reject invalid return

4. **Admin Refund Processing**
   - Process approved return
   - Handle payment gateway errors

### Sample Test Data

```javascript
// Valid return request
{
  "orderId": "507f1f77bcf86cd799439011",
  "productId": "507f1f77bcf86cd799439012",
  "reason": "Product doesn't fit as expected",
  "images": ["https://example.com/image1.jpg"]
}

// Staff inspection
{
  "returnId": "RET-1703123456789-abc123def",
  "inspectionResult": "approved",
  "inspectionImages": ["https://example.com/inspection1.jpg"]
}

// Admin refund processing
{
  "returnId": "RET-1703123456789-abc123def",
  "refundAmount": 150.00,
  "refundMethod": "credit_card",
  "adminNotes": "Refund processed as requested"
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control for staff and admin functions
3. **Input Validation**: Comprehensive validation of all input parameters
4. **Data Sanitization**: Proper sanitization of user inputs
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Audit Trail**: All return actions are logged with user information

---

## Monitoring and Analytics

### Key Metrics
- Return request volume
- Approval/rejection rates
- Average processing time
- Refund processing success rate
- Customer satisfaction scores

### Logging
- All return actions are logged with timestamps
- Error tracking and alerting
- Performance monitoring

---

## Future Enhancements

1. **Advanced Analytics**: Return pattern analysis
2. **Automated Inspection**: AI-powered product condition assessment
3. **Multi-language Support**: Internationalization
4. **Mobile App Integration**: Push notifications
5. **Advanced Logistics**: Real-time tracking integration
6. **Customer Feedback**: Return experience surveys
