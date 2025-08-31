import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Comprehensive Playwright configuration for cross-browser E2E testing
 * Covers desktop, mobile, and accessibility testing scenarios
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL for all tests */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot configuration */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
    
    /* Global timeout for actions */
    actionTimeout: 15000,
    
    /* Navigation timeout */
    navigationTimeout: 30000
  },

  /* Test timeout configuration */
  timeout: 60000,
  expect: {
    /* Timeout for assertions */
    timeout: 10000,
    
    /* Visual comparison threshold */
    threshold: 0.2,
    
    /* Screenshot comparison mode */
    toMatchSnapshot: {
      mode: 'force-no-fonts'
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    
    /* Desktop Browsers */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup']
    },
    
    /* Mobile Testing */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
      dependencies: ['setup']
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true
      },
      dependencies: ['setup']
    },
    
    /* Tablet Testing */
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true
      },
      dependencies: ['setup']
    },
    
    /* Accessibility Testing */
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Force reduced motion for accessibility tests
        reducedMotion: 'reduce'
      },
      testMatch: '**/*accessibility*.spec.ts',
      dependencies: ['setup']
    }
  ],

  /* Web Server Configuration */
  webServer: [
    {
      command: 'cd shell-vue && npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd react-remote && npm start',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd vue-remote && npm run dev',
      port: 3002,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd angular-remote && npm start',
      port: 3004,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd ts-remote && npm run dev',
      port: 3005,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd js-remote && npm run dev',
      port: 3006,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd express && npm run dev',
      port: 5000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
});