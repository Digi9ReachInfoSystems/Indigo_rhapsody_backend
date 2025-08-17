const request = require('supertest');
const app = require('../../../index');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');

describe('JWT Authentication System', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'test@example.com' });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'test@example.com' });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        phoneNumber: '+1234567890',
        password: 'testPassword123',
        role: 'User',
        is_creator: false
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.displayName).toBe(userData.displayName);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.tokenType).toBe('Bearer');

      // Store tokens for later tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
      testUser = response.body.user;
    });

    it('should fail registration with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Another User',
        password: 'testPassword123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });

    it('should fail registration with missing required fields', async () => {
      const userData = {
        email: 'incomplete@example.com'
        // Missing displayName and password
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email, display name, and password are required');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testPassword123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Update tokens
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should fail login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'testPassword123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify valid access token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.tokenData).toBeDefined();
    });

    it('should fail verification with invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should fail verification without token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Update tokens
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should fail refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_refresh_token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile retrieved successfully');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        displayName: 'Updated Test User',
        phoneNumber: '+0987654321'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.displayName).toBe(updateData.displayName);
      expect(response.body.user.phoneNumber).toBe(updateData.phoneNumber);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'testPassword123',
        newPassword: 'newTestPassword456'
      };

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should fail password change with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newTestPassword456'
      };

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should handle logout without refresh token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain session after token refresh', async () => {
      // First, login to get fresh tokens
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newTestPassword456'
        })
        .expect(200);

      const freshAccessToken = loginResponse.body.accessToken;
      const freshRefreshToken = loginResponse.body.refreshToken;

      // Verify the fresh token works
      const verifyResponse = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // Refresh the token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: freshRefreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;

      // Verify the new token works
      const newVerifyResponse = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(newVerifyResponse.body.success).toBe(true);
      expect(newVerifyResponse.body.user.email).toBe('test@example.com');
    });
  });
});
