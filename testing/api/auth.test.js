const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock Express app (would import actual app in real implementation)
const createMockApp = () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Mock user data
  const users = [
    {
      id: '1',
      email: 'admin@example.com',
      password: '$2b$12$hashed_admin_password', // bcrypt hash
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      id: '2', 
      email: 'user@example.com',
      password: '$2b$12$hashed_user_password',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user'
    }
  ];
  
  // Auth routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Mock password verification (in real app would use bcrypt)
    const validPassword = (email === 'admin@example.com' && password === 'admin123') ||
                          (email === 'user@example.com' && password === 'user123');
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'test-secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  });
  
  app.post('/api/auth/register', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User already exists' 
      });
    }
    
    const newUser = {
      id: String(users.length + 1),
      email,
      password: `$2b$12$hashed_${password}`, // Mock hash
      firstName,
      lastName,
      role: 'user'
    };
    
    users.push(newUser);
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      'test-secret',
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  });
  
  app.post('/api/auth/refresh', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, 'test-secret');
      
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });
  
  return app;
};

/**
 * Authentication API Testing Suite
 * Comprehensive tests for auth endpoints
 */

describe('Authentication API', () => {
  let app;
  
  beforeEach(() => {
    app = createMockApp();
  });
  
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    test('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'admin123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    test('should reject invalid password', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password required');
    });
    
    test('should validate email field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'admin123' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password required');
    });
    
    test('should validate password field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password required');
    });
    
    test('should return valid JWT token', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      
      const { token } = response.body;
      expect(token).toBeTruthy();
      
      // Verify token structure
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', loginData.email);
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('exp');
    });
    
    test('should include user role in response', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('admin');
    });
  });
  
  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('user');
    });
    
    test('should reject duplicate email', async () => {
      const userData = {
        email: 'admin@example.com', // Already exists
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User already exists');
    });
    
    test('should validate all required fields', async () => {
      const testCases = [
        { email: 'test@example.com', password: 'pass', firstName: 'Test' }, // Missing lastName
        { email: 'test@example.com', password: 'pass', lastName: 'User' }, // Missing firstName
        { email: 'test@example.com', firstName: 'Test', lastName: 'User' }, // Missing password
        { password: 'pass', firstName: 'Test', lastName: 'User' }, // Missing email
      ];
      
      for (const testData of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
      }
    });
    
    test('should return valid JWT token for new user', async () => {
      const userData = {
        email: 'tokentest@example.com',
        password: 'password123',
        firstName: 'Token',
        lastName: 'Test'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      
      const { token } = response.body;
      const decoded = jwt.decode(token);
      
      expect(decoded.email).toBe(userData.email);
      expect(decoded.role).toBe('user');
    });
  });
  
  describe('POST /api/auth/refresh', () => {
    let validToken;
    
    beforeEach(async () => {
      // Get a valid token first
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });
      
      validToken = loginResponse.body.token;
    });
    
    test('should refresh valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      const newToken = response.body.token;
      expect(newToken).not.toBe(validToken);
      
      const decoded = jwt.decode(newToken);
      expect(decoded).toHaveProperty('email', 'admin@example.com');
    });
    
    test('should reject request without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });
    
    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
    
    test('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: '1', email: 'admin@example.com', role: 'admin' },
        'test-secret',
        { expiresIn: '-1h' } // Already expired
      );
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });
  
  describe('Security Tests', () => {
    test('should not expose sensitive data in responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(response.status).toBe(400);
    });
    
    test('should sanitize input data', async () => {
      const maliciousData = {
        email: 'test@example.com<script>alert("xss")</script>',
        password: 'password123',
        firstName: 'Test<script>',
        lastName: 'User</script>'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData);
      
      if (response.status === 201) {
        expect(response.body.user.firstName).not.toContain('<script>');
        expect(response.body.user.lastName).not.toContain('<script>');
      }
    });
  });
  
  describe('Rate Limiting', () => {
    test('should handle multiple rapid requests', async () => {
      const requests = Array(5).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@example.com',
            password: 'admin123'
          })
      );
      
      const responses = await Promise.all(requests);
      
      // All should succeed if no rate limiting implemented
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});