import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * Accessibility Testing Suite
 * Comprehensive WCAG 2.1 AA compliance testing across all applications
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core into every page
    await injectAxe(page);
  });

  test.describe('Shell Application Accessibility', () => {
    test('should have no accessibility violations on homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Run full accessibility audit
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });

    test('should have accessible navigation', async ({ page }) => {
      await page.goto('/');
      
      const navigation = page.getByRole('navigation');
      await expect(navigation).toBeVisible();
      
      // Check navigation has proper ARIA labels
      await checkA11y(page, 'nav', {
        rules: {
          'landmark-unique': { enabled: true },
          'navigation-landmark': { enabled: true }
        }
      });
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading structure (h1, h2, h3, etc.)
      await checkA11y(page, undefined, {
        rules: {
          'heading-order': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      });
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation through interactive elements
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
      
      // Continue tabbing through elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        
        // Ensure focus is visible
        const focusedEl = page.locator(':focus');
        if (await focusedEl.count() > 0) {
          await expect(focusedEl).toBeVisible();
        }
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      
      // Check color contrast ratios
      await checkA11y(page, undefined, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });
  });

  test.describe('Micro-Frontend Accessibility', () => {
    const remotes = [
      { name: 'React', url: 'http://localhost:3001' },
      { name: 'Vue', url: 'http://localhost:3002' },
      { name: 'Angular', url: 'http://localhost:3004' },
      { name: 'TypeScript', url: 'http://localhost:3005' },
      { name: 'JavaScript', url: 'http://localhost:3006' }
    ];

    remotes.forEach(remote => {
      test(`should have no accessibility violations in ${remote.name} remote`, async ({ page }) => {
        await page.goto(remote.url);
        await page.waitForLoadState('networkidle');
        
        // Run comprehensive accessibility check
        await checkA11y(page, undefined, {
          detailedReport: true,
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
        });
      });

      test(`should support screen readers in ${remote.name} remote`, async ({ page }) => {
        await page.goto(remote.url);
        
        // Check for proper ARIA labels and descriptions
        await checkA11y(page, undefined, {
          rules: {
            'aria-allowed-attr': { enabled: true },
            'aria-required-attr': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'label': { enabled: true },
            'aria-label': { enabled: true }
          }
        });
      });
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have accessible form controls', async ({ page }) => {
      await page.goto('/contact'); // Assuming contact form exists
      
      // Check form accessibility
      await checkA11y(page, 'form', {
        rules: {
          'label': { enabled: true },
          'label-title-only': { enabled: true },
          'form-field-multiple-labels': { enabled: true }
        }
      });
    });

    test('should have proper form validation messages', async ({ page }) => {
      await page.goto('/contact');
      
      // Submit form to trigger validation
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Check that validation messages are accessible
      await checkA11y(page, '[aria-invalid="true"]', {
        rules: {
          'aria-describedby': { enabled: true },
          'aria-invalid-value': { enabled: true }
        }
      });
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      await page.goto('/contact');
      
      // Check for live regions for error announcements
      const liveRegions = page.locator('[aria-live]');
      const count = await liveRegions.count();
      
      if (count > 0) {
        await checkA11y(page, '[aria-live]', {
          rules: {
            'aria-live': { enabled: true }
          }
        });
      }
    });
  });

  test.describe('UI Components Accessibility', () => {
    test('should have accessible buttons', async ({ page }) => {
      // Test button components
      await page.goto('/components/button');
      
      // Check button accessibility
      await checkA11y(page, 'button, [role="button"]', {
        rules: {
          'button-name': { enabled: true },
          'color-contrast': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
    });

    test('should have accessible cards', async ({ page }) => {
      await page.goto('/components/card');
      
      // Check card component accessibility
      await checkA11y(page, '[role="article"], .card', {
        rules: {
          'landmark-unique': { enabled: true },
          'region': { enabled: true }
        }
      });
    });

    test('should have accessible modals', async ({ page }) => {
      await page.goto('/components/modal');
      
      // Open modal
      await page.getByRole('button', { name: /open modal/i }).click();
      
      // Check modal accessibility
      await checkA11y(page, '[role="dialog"], .modal', {
        rules: {
          'aria-dialog-name': { enabled: true },
          'focus-trap': { enabled: true },
          'aria-modal': { enabled: true }
        }
      });
    });

    test('should trap focus in modals', async ({ page }) => {
      await page.goto('/components/modal');
      
      // Open modal
      await page.getByRole('button', { name: /open modal/i }).click();
      
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Test focus trap
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement);
      const modalElement = await modal.elementHandle();
      
      // Focus should be within modal
      const isWithinModal = await page.evaluate(
        (modal, focused) => modal.contains(focused),
        modalElement,
        focusedElement
      );
      expect(isWithinModal).toBe(true);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check mobile-specific accessibility
      await checkA11y(page, undefined, {
        rules: {
          'target-size': { enabled: true }, // Touch target size
          'color-contrast': { enabled: true }
        }
      });
    });

    test('should have proper touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check that interactive elements are large enough for touch
      const interactiveElements = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();
        
        if (box) {
          // WCAG recommends minimum 44px touch targets
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Dark Mode Accessibility', () => {
    test('should maintain accessibility in dark mode', async ({ page }) => {
      await page.goto('/');
      
      // Toggle dark mode
      const themeToggle = page.getByRole('button', { name: /theme/i });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
      
      // Check accessibility with dark theme
      await checkA11y(page, undefined, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });
  });

  test.describe('Screen Reader Testing', () => {
    test('should have proper landmarks', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper landmark roles
      await checkA11y(page, undefined, {
        rules: {
          'landmark-one-main': { enabled: true },
          'landmark-complementary-is-top-level': { enabled: true },
          'landmark-no-duplicate-banner': { enabled: true },
          'landmark-no-duplicate-contentinfo': { enabled: true }
        }
      });
    });

    test('should have descriptive page titles', async ({ page }) => {
      const pages = ['/', '/about', '/contact'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
        
        // Title should be descriptive (more than just site name)
        expect(title.split(' ').length).toBeGreaterThan(1);
      }
    });

    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/');
      
      await checkA11y(page, undefined, {
        rules: {
          'image-alt': { enabled: true },
          'image-redundant-alt': { enabled: true }
        }
      });
    });
  });

  test.describe('Custom Accessibility Checks', () => {
    test('should not have accessibility violations in critical user paths', async ({ page }) => {
      // Test complete user journey for accessibility
      const userJourney = [
        '/',
        '/react-remote',
        '/vue-remote',
        '/angular-remote'
      ];
      
      for (const path of userJourney) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        const violations = await getViolations(page);
        
        // Log violations for debugging
        if (violations.length > 0) {
          console.log(`Accessibility violations on ${path}:`, violations);
        }
        
        // Critical violations should be 0
        const criticalViolations = violations.filter(v => 
          v.impact === 'critical' || v.impact === 'serious'
        );
        expect(criticalViolations).toHaveLength(0);
      }
    });
  });
});