# Return API Test Examples

This document provides practical examples for testing the Return API endpoints using tools like Postman, cURL, or any HTTP client.

## Prerequisites

1. **Server Running**: Ensure the backend server is running on `http://localhost:5000`
2. **Authentication**: Obtain a valid JWT token by logging in through the auth endpoints
3. **Test Data**: Have some orders and products in the database for testing

## Authentication Setup

First, get a JWT token:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

Save the returned token for use in subsequent requests.

---

## 1. Customer Return Request

### Request Return
```bash
curl -X POST http://localhost:5000/return/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439012",
    "reason": "Product doesn\'t fit as expected",
    "images": [
      "https://example.com/return-image1.jpg",
      "https://example.com/return-image2.jpg"
    ]
  }'
```

**Expected Response:**
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

### Get Return Details
```bash
curl -X GET http://localhost:5000/return/details/RET-1703123456789-abc123def \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "productName": "Designer Dress",
    "returnStatus": "requested",
    "returnReason": "Product doesn't fit as expected",
    "returnRequestDate": "2023-12-20T10:00:00.000Z",
    "returnWindowExpiry": "2023-12-27T10:00:00.000Z",
    "inspectionResult": "pending",
    "rejectionReason": null,
    "refundAmount": null,
    "refundMethod": null,
    "refundDate": null,
    "returnImages": [
      "https://example.com/return-image1.jpg",
      "https://example.com/return-image2.jpg"
    ],
    "inspectionImages": []
  }
}
```

### Get Customer Returns
```bash
curl -X GET "http://localhost:5000/return/customer?page=1&limit=5&status=requested" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "returns": [
      {
        "returnId": "RET-1703123456789-abc123def",
        "orderId": "ORD-12345",
        "productName": "Designer Dress",
        "returnStatus": "requested",
        "returnRequestDate": "2023-12-20T10:00:00.000Z",
        "refundAmount": null
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "totalReturns": 1
  }
}
```

---

## 2. Staff Inspection

### Approve Return
```bash
curl -X POST http://localhost:5000/return/inspect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -d '{
    "returnId": "RET-1703123456789-abc123def",
    "inspectionResult": "approved",
    "inspectionImages": [
      "https://example.com/inspection1.jpg",
      "https://example.com/inspection2.jpg"
    ]
  }'
```

**Expected Response:**
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

### Reject Return
```bash
curl -X POST http://localhost:5000/return/inspect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -d '{
    "returnId": "RET-1703123456789-abc123def",
    "inspectionResult": "rejected",
    "rejectionReason": "Product shows signs of wear and tear beyond normal use",
    "inspectionImages": [
      "https://example.com/inspection1.jpg"
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Return rejected successfully",
  "data": {
    "returnId": "RET-1703123456789-abc123def",
    "inspectionResult": "rejected",
    "returnStatus": "rejected"
  }
}
```

---

## 3. Admin Refund Processing

### Process Refund
```bash
curl -X POST http://localhost:5000/return/process-refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "returnId": "RET-1703123456789-abc123def",
    "refundAmount": 150.00,
    "refundMethod": "credit_card",
    "adminNotes": "Refund processed as requested. Customer was satisfied with the resolution."
  }'
```

**Expected Response:**
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

### Get All Returns (Admin View)
```bash
curl -X GET "http://localhost:5000/return/all?page=1&limit=10&status=approved" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
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
    "totalPages": 1,
    "currentPage": 1,
    "totalReturns": 1
  }
}
```

---

## 4. Error Handling Examples

### Invalid Return Request (Outside Return Window)
```bash
curl -X POST http://localhost:5000/return/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439012",
    "reason": "Product doesn\'t fit as expected"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Return window has expired. Returns must be requested within 7 days of delivery."
}
```

### Unauthorized Access
```bash
curl -X POST http://localhost:5000/return/inspect \
  -H "Content-Type: application/json" \
  -d '{
    "returnId": "RET-1703123456789-abc123def",
    "inspectionResult": "approved"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Insufficient Permissions
```bash
curl -X POST http://localhost:5000/return/process-refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -d '{
    "returnId": "RET-1703123456789-abc123def",
    "refundAmount": 150.00,
    "refundMethod": "credit_card"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## 5. Postman Collection

### Environment Variables
Set up these environment variables in Postman:
- `base_url`: `http://localhost:5000`
- `customer_token`: JWT token for customer
- `staff_token`: JWT token for staff
- `admin_token`: JWT token for admin

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {{customer_token}}
```

### Test Scripts

#### Test Return Request Success
```javascript
pm.test("Return request created successfully", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.returnId).to.not.be.null;
    pm.expect(response.data.returnStatus).to.eql("requested");
    
    // Save return ID for subsequent tests
    pm.environment.set("return_id", response.data.returnId);
});
```

#### Test Return Details
```javascript
pm.test("Return details retrieved successfully", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.returnId).to.eql(pm.environment.get("return_id"));
});
```

---

## 6. Database Validation Queries

### Check Return Request in Database
```javascript
// MongoDB query to verify return request
db.orders.findOne(
  { "products.returnId": "RET-1703123456789-abc123def" },
  { "products.$": 1, orderId: 1, userId: 1 }
)
```

### Check Product Returnable Status
```javascript
// MongoDB query to check if product is returnable
db.products.findOne(
  { _id: ObjectId("507f1f77bcf86cd799439012") },
  { productName: 1, returnable: 1 }
)
```

### Get All Returns for a Customer
```javascript
// MongoDB aggregation to get all returns for a customer
db.orders.aggregate([
  { $match: { userId: ObjectId("customer_user_id") } },
  { $unwind: "$products" },
  { $match: { "products.returnRequest": true } },
  { $project: {
    returnId: "$products.returnId",
    productName: "$products.productName",
    returnStatus: "$products.returnStatus",
    returnRequestDate: "$products.returnRequestDate"
  }}
])
```

---

## 7. Integration Testing Scenarios

### Complete Return Flow Test
1. **Create Order**: Create a test order with delivered status
2. **Request Return**: Submit return request
3. **Staff Inspection**: Approve the return
4. **Admin Refund**: Process the refund
5. **Verify Status**: Check final status is "refunded"

### Edge Cases
1. **Multiple Returns**: Test multiple products in same order
2. **Rejection Flow**: Test rejection and customer notification
3. **Expired Window**: Test return request outside 7-day window
4. **Non-returnable Product**: Test return request for non-returnable product

### Performance Testing
1. **Bulk Returns**: Test with multiple simultaneous return requests
2. **Large Dataset**: Test with thousands of return records
3. **Concurrent Access**: Test multiple users accessing same return

---

## 8. Monitoring and Logs

### Check Application Logs
```bash
# Monitor server logs for return-related activities
tail -f server.log | grep -i return
```

### Database Performance
```javascript
// MongoDB query to check return processing performance
db.orders.find(
  { "products.returnRequest": true },
  { "products.returnRequestDate": 1, "products.returnStatus": 1 }
).explain("executionStats")
```

### Error Tracking
```javascript
// MongoDB query to find failed return requests
db.orders.find({
  "products.returnRequest": true,
  "products.returnStatus": { $in: ["rejected", "failed"] }
})
```

---

## 9. Security Testing

### Token Validation
```bash
# Test with invalid token
curl -X GET http://localhost:5000/return/customer \
  -H "Authorization: Bearer invalid_token"
```

### Role-based Access
```bash
# Test staff endpoint with customer token
curl -X POST http://localhost:5000/return/inspect \
  -H "Authorization: Bearer customer_token" \
  -H "Content-Type: application/json" \
  -d '{"returnId": "test", "inspectionResult": "approved"}'
```

### Input Validation
```bash
# Test with malformed data
curl -X POST http://localhost:5000/return/request \
  -H "Authorization: Bearer customer_token" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

---

## 10. Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Check token format: `Bearer <token>`
   - Ensure user has appropriate role permissions

2. **Validation Errors**
   - Check all required fields are provided
   - Verify order and product IDs exist
   - Ensure return window hasn't expired

3. **Database Errors**
   - Check MongoDB connection
   - Verify indexes are created
   - Check for data consistency issues

4. **Email Delivery Issues**
   - Verify SMTP configuration
   - Check email service credentials
   - Monitor email delivery logs

### Debug Mode
Enable debug logging by setting environment variable:
```bash
export DEBUG=return:*
```

### Health Check
```bash
curl -X GET http://localhost:5000/health
```
