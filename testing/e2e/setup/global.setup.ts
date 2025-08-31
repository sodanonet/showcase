import { test as setup, expect } from '@playwright/test';

const ADMIN_AUTH_FILE = 'playwright/.auth/admin.json';
const USER_AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Global setup for all E2E tests
 * Handles authentication, data seeding, and environment preparation
 */
setup('authenticate admin user', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Perform admin authentication
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for successful login redirect
  await page.waitForURL('/dashboard');
  
  // Verify admin privileges
  await expect(page.getByText('Admin Dashboard')).toBeVisible();
  
  // Save authenticated state
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('authenticate regular user', async ({ page }) => {
  // Navigate to login page  
  await page.goto('/login');
  
  // Perform user authentication
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('user123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for successful login redirect
  await page.waitForURL('/dashboard');
  
  // Verify user access
  await expect(page.getByText('Welcome')).toBeVisible();
  
  // Save authenticated state
  await page.context().storageState({ path: USER_AUTH_FILE });
});

setup('verify all services are running', async ({ page }) => {
  // Test shell application
  await page.goto('/');
  await expect(page).toHaveTitle(/Showcase/);
  
  // Test React remote
  await page.goto('http://localhost:3001');
  await expect(page.getByText('React Remote')).toBeVisible();
  
  // Test Vue remote  
  await page.goto('http://localhost:3002');
  await expect(page.getByText('Vue Remote')).toBeVisible();
  
  // Test Angular remote
  await page.goto('http://localhost:3004');
  await expect(page.getByText('Angular Remote')).toBeVisible();
  
  // Test TypeScript remote
  await page.goto('http://localhost:3005');
  await expect(page.getByText('TypeScript Remote')).toBeVisible();
  
  // Test JavaScript remote
  await page.goto('http://localhost:3006');
  await expect(page.getByText('JavaScript Remote')).toBeVisible();
  
  // Test API health check
  const response = await page.request.get('http://localhost:5000/health');
  expect(response.status()).toBe(200);
});

setup('seed test data', async ({ request }) => {
  // Seed initial test data via API
  const userData = {
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User'
  };
  
  // Create test user if not exists
  await request.post('http://localhost:5000/api/auth/register', {
    data: userData
  });
  
  // Create test tasks
  const taskData = {
    title: 'Test Task',
    description: 'Test task for E2E testing',
    status: 'todo',
    priority: 'medium'
  };
  
  await request.post('http://localhost:5000/api/tasks', {
    data: taskData
  });
});