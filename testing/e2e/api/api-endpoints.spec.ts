import { test, expect } from '@playwright/test';

/**
 * API Endpoints E2E Testing
 * Tests all Express.js API endpoints with realistic scenarios
 */

const API_BASE = 'http://localhost:5000';

test.describe('API Endpoints', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
    
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    authToken = loginData.token;
    userId = loginData.user.id;
  });

  test.describe('Health & System', () => {
    test('should return health check', async ({ request }) => {
      const response = await request.get(`${API_BASE}/health`);
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
    });

    test('should serve API documentation', async ({ page }) => {
      await page.goto(`${API_BASE}/api-docs`);
      await expect(page).toHaveTitle(/API Documentation/);
      await expect(page.getByText('Swagger')).toBeVisible();
    });
  });

  test.describe('Authentication', () => {
    test('should register new user', async ({ request }) => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request.post(`${API_BASE}/api/auth/register`, {
        data: userData
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(userData.email);
    });

    test('should login with valid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should refresh token', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/auth/refresh`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
    });
  });

  test.describe('Tasks API', () => {
    let taskId: string;

    test('should create new task', async ({ request }) => {
      const taskData = {
        title: 'E2E Test Task',
        description: 'Task created during E2E testing',
        status: 'todo',
        priority: 'high'
      };

      const response = await request.post(`${API_BASE}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: taskData
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.title).toBe(taskData.title);
      taskId = data.id;
    });

    test('should get all tasks', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.tasks)).toBeTruthy();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
    });

    test('should get task by ID', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(taskId);
    });

    test('should update task', async ({ request }) => {
      const updateData = {
        title: 'Updated E2E Test Task',
        status: 'in-progress'
      };

      const response = await request.put(`${API_BASE}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: updateData
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.title).toBe(updateData.title);
      expect(data.status).toBe(updateData.status);
    });

    test('should delete task', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
    });

    test('should filter tasks by status', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/tasks?status=todo`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      data.tasks.forEach(task => {
        expect(task.status).toBe('todo');
      });
    });
  });

  test.describe('Users API', () => {
    test('should get user profile', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
    });

    test('should update user profile', async ({ request }) => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request.put(`${API_BASE}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: updateData
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.firstName).toBe(updateData.firstName);
      expect(data.lastName).toBe(updateData.lastName);
    });
  });

  test.describe('Analytics API', () => {
    test('should get task analytics', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/analytics/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('totalTasks');
      expect(data).toHaveProperty('tasksByStatus');
      expect(data).toHaveProperty('tasksByPriority');
    });

    test('should get user analytics', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/analytics/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('activeUsers');
    });
  });

  test.describe('Rate Limiting', () => {
    test('should enforce rate limits', async ({ request }) => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 100; i++) {
        requests.push(
          request.get(`${API_BASE}/api/tasks`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // Should have at least one rate limited response
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/nonexistent`);
      expect(response.status()).toBe(404);
    });

    test('should require authentication for protected routes', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/tasks`);
      expect(response.status()).toBe(401);
    });

    test('should validate request data', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          // Missing required fields
          description: 'Task without title'
        }
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('message');
    });
  });
});