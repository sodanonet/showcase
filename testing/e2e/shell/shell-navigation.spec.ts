import { test, expect } from '@playwright/test';

/**
 * Shell Application Navigation Tests
 * Tests the main shell app and micro-frontend integration
 */

test.describe('Shell Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load shell application successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Showcase/);
    
    // Check main navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check header content
    await expect(page.getByText('Micro-Frontend Showcase')).toBeVisible();
    
    // Check that all micro-frontend navigation links are present
    const expectedLinks = [
      'React Remote',
      'Vue Remote', 
      'Angular Remote',
      'TypeScript Remote',
      'JavaScript Remote'
    ];
    
    for (const linkText of expectedLinks) {
      await expect(page.getByRole('link', { name: linkText })).toBeVisible();
    }
  });

  test('should navigate between micro-frontends', async ({ page }) => {
    // Navigate to React remote
    await page.getByRole('link', { name: 'React Remote' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('React 19 Features')).toBeVisible();
    
    // Navigate to Vue remote
    await page.getByRole('link', { name: 'Vue Remote' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Vue 3 Composition API')).toBeVisible();
    
    // Navigate to Angular remote
    await page.getByRole('link', { name: 'Angular Remote' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Angular 17 Features')).toBeVisible();
    
    // Navigate to TypeScript remote
    await page.getByRole('link', { name: 'TypeScript Remote' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('TypeScript Web Components')).toBeVisible();
    
    // Navigate to JavaScript remote
    await page.getByRole('link', { name: 'JavaScript Remote' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Modern JavaScript ES2022+')).toBeVisible();
  });

  test('should handle micro-frontend loading errors gracefully', async ({ page }) => {
    // Simulate network error by blocking remote requests
    await page.route('**/remoteEntry.js', route => route.abort());
    
    // Navigate to a remote that should fail to load
    await page.getByRole('link', { name: 'React Remote' }).click();
    
    // Should show error boundary or fallback content
    await expect(page.getByText(/Error loading/i)).toBeVisible();
  });

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    const mobileNavToggle = page.getByRole('button', { name: /menu/i });
    if (await mobileNavToggle.isVisible()) {
      await mobileNavToggle.click();
    }
    
    // Check navigation links are accessible
    await expect(page.getByRole('link', { name: 'React Remote' })).toBeVisible();
    
    // Test touch interactions
    await page.getByRole('link', { name: 'Vue Remote' }).tap();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Vue 3 Composition API')).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme/i });
    
    if (await themeToggle.isVisible()) {
      // Test light/dark theme toggle
      await themeToggle.click();
      
      // Check if theme class is applied
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark|light/);
      
      // Toggle again
      await themeToggle.click();
      await expect(body).not.toHaveClass(/dark/);
    }
  });

  test('should persist state across navigation', async ({ page }) => {
    // Interact with a component that should maintain state
    const counter = page.getByRole('button', { name: /increment/i });
    
    if (await counter.isVisible()) {
      // Click counter multiple times
      await counter.click();
      await counter.click();
      await counter.click();
      
      const counterValue = await page.getByText(/Count: 3/i).textContent();
      
      // Navigate away and back
      await page.getByRole('link', { name: 'Vue Remote' }).click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('link', { name: 'Home' }).click();
      await page.waitForLoadState('networkidle');
      
      // Check if state persisted (depending on implementation)
      // This would test Redux state persistence
      await expect(page.getByText(/Count: 3/i)).toBeVisible();
    }
  });
});