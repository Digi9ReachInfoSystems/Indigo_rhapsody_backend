# Stylist Application Workflow Documentation

## Overview
The Stylist Application Workflow is a comprehensive system that requires stylists to submit applications, complete payment, and receive admin approval before their accounts are created. This ensures quality control and payment verification.

## Workflow Process

### 1. Application Submission
- Stylist submits application with all required information
- Application is stored with status: `submitted`
- No user account is created yet

### 2. Payment Initiation
- Stylist initiates payment for registration fee (₹500)
- Payment is processed through PhonePe gateway
- Application status changes to: `payment_pending`

### 3. Payment Completion
- Payment is completed via PhonePe
- Application status changes to: `under_review`
- Admin is notified of new application

### 4. Admin Review
- Admin reviews the application
- Admin can approve or reject the application
- Application status changes to: `approved` or `rejected`

### 5. Account Creation
- Only after approval, user account is created
- JWT tokens are generated for immediate login
- Stylist profile becomes active

## API Endpoints

### Application Submission
**POST** `/api/stylist-application/submit`

**Request Body:**
```json
{
  "displayName": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123!",
  "stylistName": "Sarah Johnson Styling",
  "stylistEmail": "sarah.styling@example.com",
  "stylistPhone": "+1234567891",
  "stylistAddress": "123 Fashion Street, Apt 4B",
  "stylistCity": "New York",
  "stylistState": "NY",
  "stylistPincode": "10001",
  "stylistCountry": "USA",
  "stylistImage": "https://example.com/sarah-profile.jpg",
  "stylistBio": "Professional stylist with 5+ years of experience...",
  "stylistPortfolio": ["https://example.com/portfolio1.jpg"],
  "stylistExperience": "5+ years in fashion styling...",
  "stylistEducation": "Fashion Design Degree from FIT",
  "stylistSkills": ["Personal Styling", "Wardrobe Consulting"],
  "stylistAvailability": "Monday-Friday: 9AM-6PM",
  "stylistPrice": 150
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stylist application submitted successfully. Please complete payment to proceed.",
  "data": {
    "applicationId": "application_mongodb_id",
    "registrationFee": 500,
    "applicationStatus": "submitted",
    "nextStep": "payment"
  }
}
```

### Payment Initiation
**POST** `/api/stylist-application/payment/initiate/:applicationId`

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "applicationId": "application_id",
    "paymentUrl": "https://mercury.phonepe.com/transact/...",
    "paymentReferenceId": "STYLIST_APP_ID_TIMESTAMP",
    "amount": 500,
    "currency": "INR",
    "expiresIn": 1800
  }
}
```

### Payment Status Check
**GET** `/api/stylist-application/payment/status/:applicationId`

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "applicationId": "application_id",
    "applicationStatus": "under_review",
    "paymentStatus": "completed",
    "paymentAmount": 500,
    "paymentReferenceId": "STYLIST_APP_ID_TIMESTAMP",
    "paymentCompletedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Payment Callback (PhonePe)
**POST** `/api/stylist-application/payment/callback`

**Request Body:**
```json
{
  "response": "base64_encoded_payment_response"
}
```

### Admin Review Applications
**GET** `/api/stylist-application/applications?status=under_review&page=1&limit=10`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalApplications": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Approve Application (Admin)
**POST** `/api/stylist-application/approve/:applicationId`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Request Body:**
```json
{
  "adminNotes": "Profile looks excellent! Great portfolio and experience. Approved for platform."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stylist application approved successfully. User account created.",
  "data": {
    "applicationId": "application_id",
    "userId": "user_mongodb_id",
    "stylistName": "Sarah Johnson Styling",
    "applicationStatus": "approved",
    "approvedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Reject Application (Admin)
**POST** `/api/stylist-application/reject/:applicationId`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Request Body:**
```json
{
  "rejectionReason": "Incomplete portfolio images and insufficient experience documentation",
  "adminNotes": "Please provide higher quality portfolio images and more detailed experience documentation."
}
```

## Application Status Flow

```
draft → submitted → payment_pending → payment_completed → under_review → approved/rejected
```

### Status Descriptions:
- **draft**: Application is being prepared (not used in current flow)
- **submitted**: Application submitted, awaiting payment
- **payment_pending**: Payment initiated, awaiting completion
- **payment_completed**: Payment completed, awaiting admin review
- **under_review**: Admin is reviewing the application
- **approved**: Application approved, user account created
- **rejected**: Application rejected

## Payment Integration

### PhonePe Configuration
The system integrates with PhonePe payment gateway with the following configuration:

**Environment Variables:**
```env
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=https://your-app.com/payment/callback
PHONEPE_CALLBACK_URL=https://your-app.com/api/stylist-application/payment/callback
```

### Payment Details:
- **Registration Fee**: ₹500 (configurable)
- **Currency**: INR
- **Payment Methods**: All PhonePe supported methods
- **Payment Expiry**: 30 minutes
- **Payment Status**: Tracked and verified

## Security Features

### Data Protection:
- Passwords are hashed with bcrypt (12 salt rounds)
- Temporary user data is stored securely during application process
- Payment information is handled securely through PhonePe

### Validation:
- Email format validation
- Password strength requirements (minimum 8 characters)
- Duplicate email/phone prevention
- Required field validation
- Array validation for portfolio and skills

### Authentication:
- Admin routes require JWT authentication with Admin role
- Payment callbacks are verified through PhonePe
- Secure token generation after approval

## Database Schema Updates

### StylistProfile Model:
```javascript
{
  userId: ObjectId, // Not required during application phase
  tempUserData: {
    displayName: String,
    email: String,
    phoneNumber: String,
    password: String // Will be hashed after approval
  },
  applicationStatus: {
    type: String,
    enum: ['draft', 'submitted', 'payment_pending', 'payment_completed', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  registrationFee: {
    type: Number,
    default: 500
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String, // PhonePe transaction ID
  paymentReferenceId: String, // Our internal reference ID
  paymentAmount: Number,
  paymentCurrency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    default: 'phonepe'
  },
  paymentCompletedAt: Date
}
```

## Error Handling

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Display name, email, phone number, and password are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Stylist application not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to submit stylist application",
  "error": "Detailed error message"
}
```

## Usage Examples

### Complete Workflow Example:

1. **Submit Application:**
```bash
curl -X POST "http://localhost:3000/api/stylist-application/submit" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Sarah Johnson", "email": "sarah@example.com", ...}'
```

2. **Initiate Payment:**
```bash
curl -X POST "http://localhost:3000/api/stylist-application/payment/initiate/APP_ID" \
  -H "Content-Type: application/json"
```

3. **Check Payment Status:**
```bash
curl -X GET "http://localhost:3000/api/stylist-application/payment/status/APP_ID" \
  -H "Content-Type: application/json"
```

4. **Admin Approve:**
```bash
curl -X POST "http://localhost:3000/api/stylist-application/approve/APP_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"adminNotes": "Approved for platform"}'
```

## Benefits of New Workflow

1. **Quality Control**: Admin approval ensures only qualified stylists join
2. **Payment Verification**: Registration fee payment is verified before approval
3. **Security**: User accounts are only created after approval
4. **Audit Trail**: Complete tracking of application and payment status
5. **Flexibility**: Easy to modify approval criteria and payment amounts
6. **Scalability**: Can handle high volume of applications efficiently

## Migration from Old System

The old `/api/auth/stylist-signup` endpoint now redirects users to the new application process:

```json
{
  "success": true,
  "message": "Please use the new stylist application process",
  "data": {
    "redirectTo": "/api/stylist-application/submit",
    "note": "Stylist signup now requires application submission, payment, and approval before account creation"
  }
}
```

This ensures backward compatibility while guiding users to the new workflow.
