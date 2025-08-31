import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing
 * Captures and compares screenshots across different viewports and states
 * @visual tag for running visual tests separately
 */

test.describe('Visual Regression Tests @visual', () => {
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  test.describe('Shell Application Screenshots', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should match shell homepage - ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        
        // Wait for all content to load
        await page.waitForLoadState('networkidle');
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`shell-homepage-${name}.png`, {
          fullPage: true
        });
      });

      test(`should match navigation menu - ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        
        // Open mobile menu if on mobile
        if (name === 'mobile') {
          const menuToggle = page.getByRole('button', { name: /menu/i });
          if (await menuToggle.isVisible()) {
            await menuToggle.click();
          }
        }
        
        // Screenshot navigation area
        await expect(page.getByRole('navigation')).toHaveScreenshot(
          `navigation-${name}.png`
        );
      });
    });
  });

  test.describe('Micro-Frontend Screenshots', () => {
    const remotes = [
      { name: 'react', port: 3001, path: '/' },
      { name: 'vue', port: 3002, path: '/' },
      { name: 'angular', port: 3004, path: '/' },
      { name: 'typescript', port: 3005, path: '/' },
      { name: 'javascript', port: 3006, path: '/' }
    ];

    remotes.forEach(remote => {
      viewports.forEach(({ name: viewport, width, height }) => {
        test(`should match ${remote.name} remote - ${viewport}`, async ({ page }) => {
          await page.setViewportSize({ width, height });
          await page.goto(`http://localhost:${remote.port}${remote.path}`);
          
          await page.waitForLoadState('networkidle');
          
          await expect(page).toHaveScreenshot(
            `${remote.name}-remote-${viewport}.png`,
            { fullPage: true }
          );
        });
      });
    });
  });

  test.describe('Storybook Components Screenshots', () => {
    test('should match UI components in Storybook', async ({ page }) => {
      // Start Storybook (assuming it's running)
      await page.goto('http://localhost:6006'); // Default Storybook port
      
      await page.waitForLoadState('networkidle');
      
      // Navigate to each component and take screenshots
      const components = ['Button', 'Card', 'Input', 'Modal'];
      
      for (const component of components) {
        // Click on component in sidebar
        await page.getByRole('link', { name: component }).click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of component preview
        await expect(
          page.locator('#storybook-preview-iframe')
        ).toHaveScreenshot(`storybook-${component.toLowerCase()}.png`);
      }
    });
  });

  test.describe('Theme Variations', () => {
    test('should match dark theme', async ({ page }) => {
      await page.goto('/');
      
      // Toggle to dark theme
      const themeToggle = page.getByRole('button', { name: /theme/i });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500); // Wait for theme transition
      }
      
      await expect(page).toHaveScreenshot('dark-theme.png', {
        fullPage: true
      });
    });

    test('should match light theme', async ({ page }) => {
      await page.goto('/');
      
      // Ensure light theme is active
      const themeToggle = page.getByRole('button', { name: /theme/i });
      if (await themeToggle.isVisible()) {
        // Click twice to ensure light theme
        await themeToggle.click();
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
      
      await expect(page).toHaveScreenshot('light-theme.png', {
        fullPage: true
      });
    });
  });

  test.describe('Interactive States', () => {
    test('should match form validation states', async ({ page }) => {
      await page.goto('/contact'); // Assuming there's a contact form
      
      // Submit empty form to trigger validation
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Screenshot form with validation errors
      await expect(
        page.getByRole('form')
      ).toHaveScreenshot('form-validation-errors.png');
    });

    test('should match loading states', async ({ page }) => {
      await page.goto('/');
      
      // Trigger a loading action
      await page.getByRole('button', { name: /load data/i }).click();
      
      // Quickly capture loading state
      await expect(
        page.getByRole('main')
      ).toHaveScreenshot('loading-state.png');
    });

    test('should match error states', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/');
      
      // Trigger API call that will fail
      await page.getByRole('button', { name: /fetch/i }).click();
      await page.waitForTimeout(1000);
      
      // Screenshot error message
      await expect(
        page.getByRole('alert')
      ).toHaveScreenshot('error-state.png');
    });
  });

  test.describe('Component Library Visual Tests', () => {
    test('should match button variants', async ({ page }) => {
      await page.goto('/components/button'); // Assuming component demo page
      
      // Screenshot all button variants
      const buttonContainer = page.locator('.button-variants');
      if (await buttonContainer.isVisible()) {
        await expect(buttonContainer).toHaveScreenshot('button-variants.png');
      }
    });

    test('should match card layouts', async ({ page }) => {
      await page.goto('/components/card');
      
      const cardContainer = page.locator('.card-examples');
      if (await cardContainer.isVisible()) {
        await expect(cardContainer).toHaveScreenshot('card-layouts.png');
      }
    });

    test('should match form inputs', async ({ page }) => {
      await page.goto('/components/input');
      
      const inputContainer = page.locator('.input-examples');
      if (await inputContainer.isVisible()) {
        await expect(inputContainer).toHaveScreenshot('input-variants.png');
      }
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    // These tests will run across all browsers defined in playwright.config.ts
    
    test('should render consistently across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Browser-specific screenshots
      await expect(page).toHaveScreenshot(`cross-browser-${browserName}.png`, {
        fullPage: true
      });
    });
  });

  test.describe('Responsive Design', () => {
    const breakpoints = [
      { name: 'xs', width: 320 },
      { name: 'sm', width: 640 },
      { name: 'md', width: 768 },
      { name: 'lg', width: 1024 },
      { name: 'xl', width: 1280 },
      { name: '2xl', width: 1536 }
    ];

    breakpoints.forEach(({ name, width }) => {
      test(`should be responsive at ${name} breakpoint (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1024 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`responsive-${name}-${width}px.png`, {
          fullPage: true
        });
      });
    });
  });
});