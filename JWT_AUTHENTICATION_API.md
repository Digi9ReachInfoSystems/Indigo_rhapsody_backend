# JWT Authentication API Documentation

## Overview
This document describes the JWT-based authentication system for the Indigo Rhapsody mobile application. The system provides secure user authentication with Firebase phone verification, access tokens and refresh tokens, while maintaining backward compatibility with existing Firebase authentication.

## Features
- **Firebase Phone Authentication**: Secure phone number verification via Firebase
- **JWT-based Authentication**: Secure token-based authentication after phone verification
- **Refresh Token Support**: Automatic token refresh mechanism
- **Firebase Compatibility**: Seamless integration with Firebase phone auth
- **Role-based Access Control**: Support for different user roles
- **Phone-based Security**: No password required, secure phone verification
- **Profile Management**: User profile CRUD operations

## API Endpoints

### 1. Phone Verification
**POST** `/auth/verify-phone`

Verify phone number with Firebase before registration or login.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "firebaseIdToken": "firebase_id_token_from_mobile_app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verification successful",
  "isNewUser": true,
  "phoneNumber": "+1234567890",
  "firebaseUid": "firebase_user_uid"
}
```

### 2. User Registration
**POST** `/auth/register`

Register a new user account after phone verification.

**Request Body:**
```json
{
  "displayName": "John Doe",
  "phoneNumber": "+1234567890",
  "firebaseIdToken": "firebase_id_token_from_mobile_app",
  "role": "User",
  "is_creator": false,
  "address": [
    {
      "nick_name": "Home",
      "city": "New York",
      "pincode": 10001,
      "state": "NY",
      "street_details": "123 Main St"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "User",
    "is_creator": false,
    "address": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

### 3. User Login
**POST** `/auth/login`

Authenticate user with phone verification and receive access tokens.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "firebaseIdToken": "firebase_id_token_from_mobile_app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "User",
    "is_creator": false,
    "address": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

### 3. Token Refresh
**POST** `/auth/refresh`

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

### 4. Token Verification
**GET** `/auth/verify`

Verify the validity of an access token.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "User",
    "is_creator": false,
    "address": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokenData": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "User",
    "is_creator": false,
    "iat": 1640995200,
    "exp": 1640996100
  }
}
```

### 5. User Logout
**POST** `/auth/logout`

Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 6. Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "User",
    "is_creator": false,
    "address": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Update User Profile
**PUT** `/auth/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "displayName": "John Smith",
  "phoneNumber": "+1234567890",
  "address": [
    {
      "nick_name": "Work",
      "city": "Los Angeles",
      "pincode": 90210,
      "state": "CA",
      "street_details": "456 Business Ave"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "displayName": "John Smith",
    "phoneNumber": "+1234567890",
    "role": "User",
    "is_creator": false,
    "address": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. Change Password
**POST** `/auth/change-password`

Change user's password.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Authentication Flow

### 1. Registration Flow
1. User submits registration data
2. System validates input and checks for existing users
3. Password is hashed using bcrypt
4. User is created in database
5. JWT access and refresh tokens are generated
6. Welcome email is sent
7. Tokens are returned to client

### 2. Login Flow
1. User submits email and password
2. System finds user by email
3. Password is verified using bcrypt
4. JWT access and refresh tokens are generated
5. Tokens are returned to client

### 3. Token Refresh Flow
1. Client detects access token expiration
2. Client sends refresh token to `/auth/refresh`
3. System validates refresh token
4. New access and refresh tokens are generated
5. Old refresh token is invalidated
6. New tokens are returned to client

### 4. API Request Flow
1. Client includes access token in Authorization header
2. Server middleware validates token (JWT or Firebase)
3. If valid, request proceeds
4. If invalid, 401 error is returned

## Token Configuration

### Environment Variables
```env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Token Structure
**Access Token Payload:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "User",
  "is_creator": false,
  "iat": 1640995200,
  "exp": 1640996100
}
```

**Refresh Token Payload:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "User",
  "is_creator": false,
  "iat": 1640995200,
  "exp": 1641590400
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Email, display name, and password are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**401 Token Expired:**
```json
{
  "success": false,
  "message": "Token expired"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Registration failed",
  "error": "Error details"
}
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Password comparison is done securely
- Password change requires current password verification

### Token Security
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Refresh tokens are stored server-side and can be invalidated
- Tokens are signed with secure secrets

### Authentication Fallback
- JWT authentication is tried first
- If JWT fails, Firebase authentication is attempted
- Provides seamless migration from Firebase to JWT

## Mobile App Integration

### Token Storage
Store tokens securely in the mobile app:
- Access token: Use secure storage (Keychain for iOS, Keystore for Android)
- Refresh token: Use secure storage
- Token expiration: Track expiration time

### Automatic Token Refresh
Implement automatic token refresh:
1. Check token expiration before API calls
2. If expired, use refresh token to get new tokens
3. Update stored tokens
4. Retry original API call

### API Call Example
```javascript
// Example API call with automatic token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
  const accessToken = await getStoredAccessToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    const newTokens = await refreshTokens();
    if (newTokens) {
      // Retry request with new token
      return makeAuthenticatedRequest(url, options);
    }
  }
  
  return response;
};
```

## Production Considerations

### Security
1. Use strong, unique JWT secrets
2. Enable HTTPS in production
3. Implement rate limiting
4. Use secure cookie settings
5. Implement token blacklisting for logout

### Performance
1. Use Redis for refresh token storage
2. Implement token caching
3. Optimize database queries
4. Use connection pooling

### Monitoring
1. Log authentication events
2. Monitor token usage
3. Track failed authentication attempts
4. Set up alerts for security events

## Testing

### Test Cases
1. User registration with valid data
2. User registration with existing email
3. User login with valid credentials
4. User login with invalid credentials
5. Token refresh with valid refresh token
6. Token refresh with expired refresh token
7. Protected route access with valid token
8. Protected route access without token
9. User logout
10. Profile update
11. Password change

### Test Environment
Set up test environment with:
- Test database
- Test email service
- Mock Firebase service
- Test JWT secrets

## Migration from Firebase

### Gradual Migration
1. Implement JWT authentication alongside Firebase
2. Update mobile app to use JWT tokens
3. Monitor authentication success rates
4. Gradually phase out Firebase authentication

### Data Migration
1. Export user data from Firebase
2. Import users to new system
3. Hash passwords for existing users
4. Verify data integrity

### Rollback Plan
1. Keep Firebase authentication as fallback
2. Monitor system performance
3. Have rollback procedures ready
4. Test rollback scenarios
