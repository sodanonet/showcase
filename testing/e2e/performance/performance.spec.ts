import { test, expect, chromium } from '@playwright/test';
import { lighthouse } from 'lighthouse';
import { desktopConfig, mobileConfig } from 'lighthouse/core/config/default-config.js';

/**
 * Performance Testing Suite
 * Tests Core Web Vitals, Lighthouse scores, and performance metrics
 * @performance tag for running performance tests separately
 */

test.describe('Performance Tests @performance', () => {
  
  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds on homepage', async ({ page }) => {
      await page.goto('/');
      
      // Measure Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};
          
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
            });
          });
          fcpObserver.observe({ entryTypes: ['paint'] });
          
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              metrics.lcp = entry.startTime;
            });
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let cls = 0;
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            });
            metrics.cls = cls;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          // First Input Delay (simulated)
          let fidResolved = false;
          const fidObserver = new PerformanceObserver((list) => {
            if (fidResolved) return;
            const entries = list.getEntries();
            entries.forEach((entry) => {
              metrics.fid = entry.processingStart - entry.startTime;
              fidResolved = true;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
          
          // Resolve after a timeout to collect metrics
          setTimeout(() => resolve(metrics), 3000);
        });
      });
      
      // Assert Core Web Vitals thresholds
      if (webVitals.fcp) {
        expect(webVitals.fcp).toBeLessThan(1800); // Good FCP < 1.8s
      }
      if (webVitals.lcp) {
        expect(webVitals.lcp).toBeLessThan(2500); // Good LCP < 2.5s
      }
      if (webVitals.cls) {
        expect(webVitals.cls).toBeLessThan(0.1); // Good CLS < 0.1
      }
      if (webVitals.fid) {
        expect(webVitals.fid).toBeLessThan(100); // Good FID < 100ms
      }
    });

    test('should have fast Time to Interactive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test interactivity
      const button = page.getByRole('button').first();
      if (await button.isVisible()) {
        await button.click();
        const interactiveTime = Date.now() - startTime;
        
        // TTI should be under 5 seconds for good user experience
        expect(interactiveTime).toBeLessThan(5000);
      }
    });
  });

  test.describe('Lighthouse Performance Audits', () => {
    test('should achieve good Lighthouse performance score on desktop', async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000');
      
      // Run Lighthouse audit
      const { lhr } = await lighthouse('http://localhost:3000', {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'info',
        config: desktopConfig
      });
      
      // Performance score should be >= 90 for good performance
      expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.9);
      
      // Check specific metrics
      const metrics = lhr.audits;
      expect(metrics['first-contentful-paint'].score).toBeGreaterThanOrEqual(0.8);
      expect(metrics['largest-contentful-paint'].score).toBeGreaterThanOrEqual(0.8);
      expect(metrics['cumulative-layout-shift'].score).toBeGreaterThanOrEqual(0.8);
      
      await browser.close();
    });

    test('should achieve acceptable performance on mobile', async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000');
      
      // Run mobile Lighthouse audit
      const { lhr } = await lighthouse('http://localhost:3000', {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'info',
        config: mobileConfig
      });
      
      // Mobile performance can be slightly lower
      expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.75);
      
      await browser.close();
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load CSS and JS resources efficiently', async ({ page }) => {
      // Monitor network requests
      const responses = [];
      page.on('response', (response) => {
        responses.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type'],
          size: response.headers()['content-length']
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that critical resources loaded successfully
      const cssResponses = responses.filter(r => 
        r.contentType?.includes('text/css') && r.status === 200
      );
      const jsResponses = responses.filter(r => 
        r.contentType?.includes('javascript') && r.status === 200
      );
      
      expect(cssResponses.length).toBeGreaterThan(0);
      expect(jsResponses.length).toBeGreaterThan(0);
      
      // No failed requests for critical resources
      const failedCritical = responses.filter(r => 
        (r.contentType?.includes('text/css') || r.contentType?.includes('javascript')) &&
        r.status >= 400
      );
      expect(failedCritical).toHaveLength(0);
    });

    test('should optimize image loading', async ({ page }) => {
      const imageRequests = [];
      
      page.on('response', (response) => {
        if (response.url().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          imageRequests.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length']
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // All images should load successfully
      imageRequests.forEach(img => {
        expect(img.status).toBe(200);
      });
    });

    test('should implement efficient caching', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const cachedRequests = [];
      page.on('response', (response) => {
        const cacheControl = response.headers()['cache-control'];
        if (cacheControl) {
          cachedRequests.push({
            url: response.url(),
            cacheControl
          });
        }
      });
      
      // Second visit (should use cache)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that static assets have proper cache headers
      const staticAssets = cachedRequests.filter(r => 
        r.url.match(/\.(css|js|png|jpg|gif|svg)$/)
      );
      
      staticAssets.forEach(asset => {
        expect(asset.cacheControl).toMatch(/(max-age|public|immutable)/);
      });
    });
  });

  test.describe('Micro-Frontend Performance', () => {
    const remotes = [
      { name: 'React', port: 3001 },
      { name: 'Vue', port: 3002 },
      { name: 'Angular', port: 3004 },
      { name: 'TypeScript', port: 3005 },
      { name: 'JavaScript', port: 3006 }
    ];

    remotes.forEach(remote => {
      test(`should load ${remote.name} remote efficiently`, async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto(`http://localhost:${remote.port}`);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Each micro-frontend should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
        
        // Check that the main content is visible
        await expect(page.locator('main, #root, .app')).toBeVisible();
      });
    });

    test('should load micro-frontends in shell efficiently', async ({ page }) => {
      const loadTimes = {};
      
      await page.goto('/');
      
      // Navigate to each micro-frontend and measure load time
      const routes = [
        { name: 'React', path: '/react' },
        { name: 'Vue', path: '/vue' },
        { name: 'Angular', path: '/angular' }
      ];
      
      for (const route of routes) {
        const startTime = Date.now();
        
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        loadTimes[route.name] = Date.now() - startTime;
      }
      
      // All micro-frontend transitions should be fast
      Object.values(loadTimes).forEach(time => {
        expect(time).toBeLessThan(2000);
      });
    });
  });

  test.describe('API Performance', () => {
    test('should have fast API response times', async ({ page }) => {
      const apiTimes = {};
      
      // Monitor API requests
      page.on('response', async (response) => {
        if (response.url().includes('/api/')) {
          const timing = await response.timing();
          apiTimes[response.url()] = timing.responseEnd - timing.requestStart;
        }
      });
      
      await page.goto('/');
      
      // Trigger API calls
      const loadDataButton = page.getByRole('button', { name: /load|fetch/i }).first();
      if (await loadDataButton.isVisible()) {
        await loadDataButton.click();
        await page.waitForTimeout(2000);
      }
      
      // API responses should be fast
      Object.values(apiTimes).forEach(time => {
        expect(time).toBeLessThan(1000); // API calls should be under 1 second
      });
    });

    test('should handle concurrent API requests efficiently', async ({ page }) => {
      await page.goto('/');
      
      const startTime = Date.now();
      
      // Trigger multiple concurrent API calls
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      
      const clickPromises = [];
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        clickPromises.push(buttons.nth(i).click());
      }
      
      await Promise.all(clickPromises);
      await page.waitForLoadState('networkidle');
      
      const totalTime = Date.now() - startTime;
      
      // Concurrent requests should complete efficiently
      expect(totalTime).toBeLessThan(3000);
    });
  });

  test.describe('Bundle Size Analysis', () => {
    test('should have reasonable bundle sizes', async ({ page }) => {
      const bundleSizes = {};
      
      page.on('response', async (response) => {
        if (response.url().match(/\.(js|css)$/) && response.status() === 200) {
          const contentLength = response.headers()['content-length'];
          if (contentLength) {
            bundleSizes[response.url()] = parseInt(contentLength);
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check bundle sizes
      const jsBundles = Object.entries(bundleSizes)
        .filter(([url]) => url.endsWith('.js'))
        .map(([url, size]) => ({ url, size }));
      
      // Main bundle should not be too large
      jsBundles.forEach(({ url, size }) => {
        // Individual JS bundles should be under 500KB
        expect(size).toBeLessThan(500 * 1024);
      });
      
      // Total JS size should be reasonable
      const totalJSSize = jsBundles.reduce((total, { size }) => total + size, 0);
      expect(totalJSSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB total
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      await page.goto('/');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Navigate through different routes multiple times
      const routes = ['/', '/react', '/vue', '/angular'];
      
      for (let i = 0; i < 3; i++) {
        for (const route of routes) {
          await page.goto(route);
          await page.waitForTimeout(1000);
        }
      }
      
      // Force garbage collection if possible
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      await page.waitForTimeout(2000);
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory usage should not increase dramatically
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercentage = (memoryIncrease / initialMemory) * 100;
      
      // Memory increase should be reasonable (less than 50% increase)
      expect(increasePercentage).toBeLessThan(50);
    });
  });
});