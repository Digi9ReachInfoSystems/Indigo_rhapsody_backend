# Stylist Signup API Documentation

## Overview
The Stylist Signup API provides a comprehensive endpoint for creating stylist accounts with complete profile setup, JWT token generation, and secure authentication handling.

## Endpoint
**POST** `/api/auth/stylist-signup`

## Authentication
- **Required**: None (Public endpoint)
- **Response**: Returns JWT tokens for immediate authentication

## Request Body

### Required Fields

#### User Account Fields
```json
{
  "displayName": "String (required)",
  "email": "String (required, valid email format)",
  "phoneNumber": "String (required)",
  "password": "String (required, minimum 8 characters)"
}
```

#### Stylist Profile Fields
```json
{
  "stylistName": "String (required)",
  "stylistEmail": "String (required, valid email format)",
  "stylistPhone": "String (required)",
  "stylistAddress": "String (required)",
  "stylistCity": "String (required)",
  "stylistState": "String (required)",
  "stylistPincode": "String (required)",
  "stylistCountry": "String (required)",
  "stylistImage": "String (required, image URL)",
  "stylistBio": "String (required)",
  "stylistPortfolio": ["Array of Strings (required, non-empty)"],
  "stylistExperience": "String (required)",
  "stylistEducation": "String (required)",
  "stylistSkills": ["Array of Strings (required, non-empty)"],
  "stylistAvailability": "String (required)"
}
```

#### Optional Fields
```json
{
  "stylistPrice": "Number (optional, default: 0)"
}
```

## Complete Request Example

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
  "stylistBio": "Professional stylist with 5+ years of experience in fashion and personal styling. Specializing in wardrobe consulting and personal image transformation.",
  "stylistPortfolio": [
    "https://example.com/portfolio1.jpg",
    "https://example.com/portfolio2.jpg",
    "https://example.com/portfolio3.jpg",
    "https://example.com/portfolio4.jpg"
  ],
  "stylistExperience": "5+ years in fashion styling, worked with celebrities and fashion brands",
  "stylistEducation": "Fashion Design Degree from Fashion Institute of Technology (FIT)",
  "stylistSkills": [
    "Personal Styling",
    "Wardrobe Consulting",
    "Color Analysis",
    "Body Type Analysis",
    "Event Styling",
    "Celebrity Styling",
    "Fashion Photography Styling"
  ],
  "stylistAvailability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM, Sunday: Closed",
  "stylistPrice": 150
}
```

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Stylist account created successfully. Profile is pending approval.",
  "data": {
    "user": {
      "_id": "user_mongodb_id",
      "displayName": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "phoneNumber": "+1234567890",
      "role": "Stylist",
      "is_creator": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "stylistProfile": {
      "_id": "stylist_profile_mongodb_id",
      "stylistName": "Sarah Johnson Styling",
      "stylistEmail": "sarah.styling@example.com",
      "stylistCity": "New York",
      "stylistState": "NY",
      "approvalStatus": "pending",
      "isApproved": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Display name, email, phone number, and password are required"
}
```

### Error Response (400 Bad Request - Validation)
```json
{
  "success": false,
  "message": "stylistPortfolio must be a non-empty array"
}
```

### Error Response (400 Bad Request - Duplicate)
```json
{
  "success": false,
  "message": "User already exists with this email or phone number"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to create stylist account",
  "error": "Detailed error message"
}
```

## Security Features

### Password Security
- **Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **Strength Validation**: Minimum 8 characters required
- **Storage**: Passwords are never returned in responses

### JWT Token Security
- **Access Token**: Short-lived (15 minutes default)
- **Refresh Token**: Long-lived (7 days default)
- **Token Storage**: Refresh tokens are stored securely
- **Payload**: Contains user ID, email, role, and display name

### Input Validation
- **Email Format**: Validates both user and stylist email formats
- **Required Fields**: Validates all required fields are present
- **Array Validation**: Ensures portfolio and skills arrays are non-empty
- **Duplicate Prevention**: Checks for existing users and stylist emails

## Validation Rules

### User Account Validation
- `displayName`: Required, non-empty string
- `email`: Required, valid email format, unique
- `phoneNumber`: Required, non-empty string, unique
- `password`: Required, minimum 8 characters

### Stylist Profile Validation
- `stylistName`: Required, non-empty string
- `stylistEmail`: Required, valid email format, unique
- `stylistPhone`: Required, non-empty string
- `stylistAddress`: Required, non-empty string
- `stylistCity`: Required, non-empty string
- `stylistState`: Required, non-empty string
- `stylistPincode`: Required, non-empty string
- `stylistCountry`: Required, non-empty string
- `stylistImage`: Required, non-empty string (should be valid URL)
- `stylistBio`: Required, non-empty string
- `stylistPortfolio`: Required, non-empty array of strings
- `stylistExperience`: Required, non-empty string
- `stylistEducation`: Required, non-empty string
- `stylistSkills`: Required, non-empty array of strings
- `stylistAvailability`: Required, non-empty string
- `stylistPrice`: Optional, number (defaults to 0)

## Process Flow

1. **Input Validation**: Validates all required fields and formats
2. **Duplicate Check**: Checks for existing users and stylist emails
3. **Password Hashing**: Securely hashes the password
4. **User Creation**: Creates user account with "Stylist" role
5. **Profile Creation**: Creates stylist profile with pending approval
6. **Token Generation**: Generates JWT access and refresh tokens
7. **Email Notification**: Sends welcome email (non-blocking)
8. **Response**: Returns user data, profile summary, and tokens

## Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Missing required fields, invalid formats, validation errors |
| 500 | Internal Server Error | Database errors, server issues |

## Usage Examples

### cURL Example
```bash
curl -X POST "http://localhost:3000/api/auth/stylist-signup" \
  -H "Content-Type: application/json" \
  -d '{
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
    "stylistBio": "Professional stylist with 5+ years of experience",
    "stylistPortfolio": ["https://example.com/portfolio1.jpg"],
    "stylistExperience": "5+ years in fashion styling",
    "stylistEducation": "Fashion Design Degree from FIT",
    "stylistSkills": ["Personal Styling", "Wardrobe Consulting"],
    "stylistAvailability": "Monday-Friday: 9AM-6PM",
    "stylistPrice": 150
  }'
```

### JavaScript Example
```javascript
const response = await fetch('/api/auth/stylist-signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    displayName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phoneNumber: '+1234567890',
    password: 'SecurePassword123!',
    stylistName: 'Sarah Johnson Styling',
    stylistEmail: 'sarah.styling@example.com',
    stylistPhone: '+1234567891',
    stylistAddress: '123 Fashion Street, Apt 4B',
    stylistCity: 'New York',
    stylistState: 'NY',
    stylistPincode: '10001',
    stylistCountry: 'USA',
    stylistImage: 'https://example.com/sarah-profile.jpg',
    stylistBio: 'Professional stylist with 5+ years of experience',
    stylistPortfolio: ['https://example.com/portfolio1.jpg'],
    stylistExperience: '5+ years in fashion styling',
    stylistEducation: 'Fashion Design Degree from FIT',
    stylistSkills: ['Personal Styling', 'Wardrobe Consulting'],
    stylistAvailability: 'Monday-Friday: 9AM-6PM',
    stylistPrice: 150
  })
});

const data = await response.json();
if (data.success) {
  // Store tokens for authentication
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  console.log('Stylist account created successfully!');
}
```

## Post-Signup Process

### Immediate Actions
1. **Authentication**: User is automatically logged in with JWT tokens
2. **Profile Status**: Stylist profile is created with "pending" approval status
3. **Email Notification**: Welcome email is sent to the user

### Next Steps
1. **Admin Review**: Admin reviews the stylist profile
2. **Approval/Rejection**: Admin approves or rejects the profile
3. **Notification**: User receives notification about approval status
4. **Public Visibility**: Approved profiles become visible to the public

## Notes
- The endpoint creates both a user account and stylist profile in a single request
- All stylist profiles start with "pending" approval status
- JWT tokens are immediately available for authentication
- Email notifications are sent asynchronously (won't fail signup if email fails)
- The user role is automatically set to "Stylist"
- Profile approval is required before the stylist becomes publicly visible
