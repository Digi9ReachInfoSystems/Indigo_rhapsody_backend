# Mobile App Integration Guide - Firebase Phone Auth + JWT

## Overview
This guide explains how to integrate the JWT authentication system with Firebase phone authentication in your mobile app. The system uses Firebase for phone verification and then issues JWT tokens for API access.

## Authentication Flow

### 1. Phone Verification Flow
```
Mobile App → Firebase Phone Auth → Get ID Token → Backend Verification → JWT Tokens
```

### 2. Registration Flow
```
1. User enters phone number
2. Firebase sends OTP
3. User enters OTP
4. Firebase verifies OTP and returns ID token
5. App sends ID token to backend for verification
6. Backend verifies token and checks if user exists
7. If new user, app collects additional info and registers
8. Backend creates user and returns JWT tokens
```

### 3. Login Flow
```
1. User enters phone number
2. Firebase sends OTP
3. User enters OTP
4. Firebase verifies OTP and returns ID token
5. App sends ID token to backend for verification
6. Backend verifies token and finds existing user
7. Backend returns JWT tokens
```

## Mobile App Implementation

### 1. Firebase Setup

#### Install Firebase SDK
```bash
# React Native
npm install @react-native-firebase/app @react-native-firebase/auth

# Flutter
flutter pub add firebase_core firebase_auth
```

#### Initialize Firebase
```javascript
// React Native
import auth from '@react-native-firebase/auth';

// Flutter
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
```

### 2. Phone Authentication Implementation

#### React Native Example
```javascript
import auth from '@react-native-firebase/auth';

class AuthService {
  // Request OTP
  async requestOTP(phoneNumber) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error) {
      throw new Error('Failed to send OTP: ' + error.message);
    }
  }

  // Verify OTP
  async verifyOTP(confirmation, otp) {
    try {
      const result = await confirmation.confirm(otp);
      const idToken = await result.user.getIdToken();
      return idToken;
    } catch (error) {
      throw new Error('Invalid OTP: ' + error.message);
    }
  }

  // Verify phone with backend
  async verifyPhoneWithBackend(phoneNumber, idToken) {
    try {
      const response = await fetch('YOUR_API_URL/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          firebaseIdToken: idToken,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Backend verification failed: ' + error.message);
    }
  }

  // Register user
  async registerUser(userData, idToken) {
    try {
      const response = await fetch('YOUR_API_URL/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          firebaseIdToken: idToken,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Registration failed: ' + error.message);
    }
  }

  // Login user
  async loginUser(phoneNumber, idToken) {
    try {
      const response = await fetch('YOUR_API_URL/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          firebaseIdToken: idToken,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  }
}
```

#### Flutter Example
```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Request OTP
  Future<ConfirmationResult> requestOTP(String phoneNumber) async {
    try {
      return await _auth.signInWithPhoneNumber(phoneNumber);
    } catch (e) {
      throw Exception('Failed to send OTP: $e');
    }
  }

  // Verify OTP
  Future<String> verifyOTP(ConfirmationResult confirmation, String otp) async {
    try {
      UserCredential result = await confirmation.confirm(otp);
      String idToken = await result.user!.getIdToken();
      return idToken;
    } catch (e) {
      throw Exception('Invalid OTP: $e');
    }
  }

  // Verify phone with backend
  Future<Map<String, dynamic>> verifyPhoneWithBackend(String phoneNumber, String idToken) async {
    try {
      final response = await http.post(
        Uri.parse('YOUR_API_URL/auth/verify-phone'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phoneNumber': phoneNumber,
          'firebaseIdToken': idToken,
        }),
      );

      return json.decode(response.body);
    } catch (e) {
      throw Exception('Backend verification failed: $e');
    }
  }

  // Register user
  Future<Map<String, dynamic>> registerUser(Map<String, dynamic> userData, String idToken) async {
    try {
      final response = await http.post(
        Uri.parse('YOUR_API_URL/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          ...userData,
          'firebaseIdToken': idToken,
        }),
      );

      return json.decode(response.body);
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  // Login user
  Future<Map<String, dynamic>> loginUser(String phoneNumber, String idToken) async {
    try {
      final response = await http.post(
        Uri.parse('YOUR_API_URL/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phoneNumber': phoneNumber,
          'firebaseIdToken': idToken,
        }),
      );

      return json.decode(response.body);
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }
}
```

### 3. Token Management

#### Secure Token Storage
```javascript
// React Native with react-native-keychain
import * as Keychain from 'react-native-keychain';

class TokenManager {
  // Store tokens securely
  async storeTokens(accessToken, refreshToken) {
    try {
      await Keychain.setInternetCredentials(
        'indigo_rhapsody_tokens',
        'access_token',
        accessToken
      );
      await Keychain.setInternetCredentials(
        'indigo_rhapsody_refresh',
        'refresh_token',
        refreshToken
      );
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  // Get access token
  async getAccessToken() {
    try {
      const credentials = await Keychain.getInternetCredentials('indigo_rhapsody_tokens');
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken() {
    try {
      const credentials = await Keychain.getInternetCredentials('indigo_rhapsody_refresh');
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  // Clear tokens
  async clearTokens() {
    try {
      await Keychain.resetInternetCredentials('indigo_rhapsody_tokens');
      await Keychain.resetInternetCredentials('indigo_rhapsody_refresh');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}
```

### 4. API Client with Automatic Token Refresh

```javascript
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.tokenManager = new TokenManager();
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const accessToken = await this.tokenManager.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Retry request with new token
        return this.makeRequest(endpoint, options);
      } else {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  // Refresh tokens
  async refreshTokens() {
    try {
      const refreshToken = await this.tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.tokenManager.storeTokens(data.accessToken, data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}
```

### 5. Complete Authentication Flow Example

```javascript
class AuthFlow {
  constructor() {
    this.authService = new AuthService();
    this.tokenManager = new TokenManager();
    this.apiClient = new ApiClient('YOUR_API_URL');
  }

  // Complete registration flow
  async registerUser(phoneNumber, displayName) {
    try {
      // Step 1: Request OTP
      const confirmation = await this.authService.requestOTP(phoneNumber);
      
      // Step 2: Get OTP from user (implement UI for this)
      const otp = await this.getOTPFromUser();
      
      // Step 3: Verify OTP with Firebase
      const idToken = await this.authService.verifyOTP(confirmation, otp);
      
      // Step 4: Verify with backend
      const verificationResult = await this.authService.verifyPhoneWithBackend(phoneNumber, idToken);
      
      if (verificationResult.isNewUser) {
        // Step 5: Register new user
        const registrationResult = await this.authService.registerUser({
          displayName,
          phoneNumber,
        }, idToken);
        
        // Step 6: Store tokens
        await this.tokenManager.storeTokens(
          registrationResult.accessToken,
          registrationResult.refreshToken
        );
        
        return registrationResult;
      } else {
        throw new Error('User already exists. Please login instead.');
      }
    } catch (error) {
      throw error;
    }
  }

  // Complete login flow
  async loginUser(phoneNumber) {
    try {
      // Step 1: Request OTP
      const confirmation = await this.authService.requestOTP(phoneNumber);
      
      // Step 2: Get OTP from user (implement UI for this)
      const otp = await this.getOTPFromUser();
      
      // Step 3: Verify OTP with Firebase
      const idToken = await this.authService.verifyOTP(confirmation, otp);
      
      // Step 4: Login with backend
      const loginResult = await this.authService.loginUser(phoneNumber, idToken);
      
      // Step 5: Store tokens
      await this.tokenManager.storeTokens(
        loginResult.accessToken,
        loginResult.refreshToken
      );
      
      return loginResult;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const refreshToken = await this.tokenManager.getRefreshToken();
      
      if (refreshToken) {
        await fetch('YOUR_API_URL/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
      
      await this.tokenManager.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get OTP from user (implement your UI)
  async getOTPFromUser() {
    // Implement your OTP input UI here
    // This is just a placeholder
    return new Promise((resolve) => {
      // Show OTP input dialog/modal
      // When user enters OTP, call resolve(otp)
    });
  }
}
```

## UI Implementation Examples

### React Native Screens

#### Phone Number Input Screen
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const PhoneInputScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      const authFlow = new AuthFlow();
      const confirmation = await authFlow.authService.requestOTP(phoneNumber);
      
      navigation.navigate('OTPVerification', {
        phoneNumber,
        confirmation,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Enter Phone Number
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
        placeholder="+1234567890"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {loading ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### OTP Verification Screen
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { phoneNumber, confirmation } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const authFlow = new AuthFlow();
      const idToken = await authFlow.authService.verifyOTP(confirmation, otp);
      
      // Check if user exists
      const verificationResult = await authFlow.authService.verifyPhoneWithBackend(phoneNumber, idToken);
      
      if (verificationResult.isNewUser) {
        // Navigate to registration
        navigation.navigate('Registration', {
          phoneNumber,
          idToken,
        });
      } else {
        // Login existing user
        const loginResult = await authFlow.authService.loginUser(phoneNumber, idToken);
        await authFlow.tokenManager.storeTokens(
          loginResult.accessToken,
          loginResult.refreshToken
        );
        
        // Navigate to main app
        navigation.navigate('MainApp');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Enter OTP
      </Text>
      
      <Text style={{ marginBottom: 20 }}>
        We've sent a code to {phoneNumber}
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
        placeholder="Enter 6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Error Handling

### Common Error Scenarios

1. **Invalid Phone Number**
   - Check phone number format
   - Show appropriate error message

2. **OTP Expired**
   - Request new OTP
   - Show countdown timer

3. **Invalid OTP**
   - Allow retry
   - Show remaining attempts

4. **Network Errors**
   - Retry mechanism
   - Offline handling

5. **Token Expired**
   - Automatic refresh
   - Redirect to login if refresh fails

### Error Handling Example
```javascript
class ErrorHandler {
  static handleAuthError(error) {
    if (error.code === 'auth/invalid-phone-number') {
      return 'Invalid phone number format';
    } else if (error.code === 'auth/invalid-verification-code') {
      return 'Invalid OTP code';
    } else if (error.code === 'auth/session-expired') {
      return 'OTP expired. Please request a new one.';
    } else if (error.code === 'auth/too-many-requests') {
      return 'Too many attempts. Please try again later.';
    } else {
      return 'Authentication failed. Please try again.';
    }
  }

  static handleApiError(error) {
    if (error.status === 401) {
      return 'Session expired. Please login again.';
    } else if (error.status === 400) {
      return error.message || 'Invalid request';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'Network error. Please check your connection.';
    }
  }
}
```

## Testing

### Test Cases

1. **Phone Number Validation**
   - Valid phone numbers
   - Invalid phone numbers
   - International formats

2. **OTP Flow**
   - Successful OTP sending
   - OTP verification
   - OTP expiration
   - Invalid OTP handling

3. **Registration Flow**
   - New user registration
   - Existing user handling
   - Required field validation

4. **Login Flow**
   - Existing user login
   - Non-existent user handling
   - Token generation

5. **Token Management**
   - Token storage
   - Token refresh
   - Token expiration
   - Logout

### Testing Tools

- **Firebase Emulator**: For local testing
- **Postman**: For API testing
- **Jest**: For unit testing
- **Detox**: For E2E testing

## Security Considerations

1. **Token Storage**
   - Use secure storage (Keychain/Keystore)
   - Never store tokens in plain text
   - Clear tokens on logout

2. **Network Security**
   - Use HTTPS for all API calls
   - Validate server certificates
   - Implement certificate pinning

3. **Input Validation**
   - Validate phone numbers
   - Sanitize user inputs
   - Rate limiting

4. **Error Handling**
   - Don't expose sensitive information
   - Log errors securely
   - Handle edge cases

## Production Checklist

- [ ] Firebase project configured
- [ ] Phone authentication enabled
- [ ] API endpoints tested
- [ ] Token management implemented
- [ ] Error handling complete
- [ ] UI/UX polished
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] Analytics integrated
- [ ] Crash reporting setup

## Support

For issues and questions:
1. Check Firebase documentation
2. Review API documentation
3. Test with Firebase emulator
4. Check server logs
5. Contact development team
