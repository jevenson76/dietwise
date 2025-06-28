import { defineConfig, devices } from '@playwright/test';

/**
 * BrowserStack configuration for cross-device testing
 * Requires BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000, // Increased timeout for BrowserStack
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 4, // Limited workers for BrowserStack
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/browserstack-results.json' }],
    ['junit', { outputFile: 'test-results/browserstack-junit.xml' }],
  ],
  
  use: {
    baseURL: process.env.BROWSERSTACK_LOCAL_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // BrowserStack capabilities
    'browserstack:options': {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'DietWise',
      buildName: `Build ${process.env.GITHUB_RUN_NUMBER || 'local'}`,
      local: true,
      localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER || `local-${Date.now()}`,
    },
  },

  projects: [
    // Desktop Browsers
    {
      name: 'Chrome@latest-Windows',
      use: {
        ...devices['Desktop Chrome'],
        'browserstack:options': {
          os: 'Windows',
          osVersion: '11',
          browserName: 'chrome',
          browserVersion: 'latest',
        },
      },
    },
    {
      name: 'Firefox@latest-Windows',
      use: {
        ...devices['Desktop Firefox'],
        'browserstack:options': {
          os: 'Windows',
          osVersion: '11',
          browserName: 'firefox',
          browserVersion: 'latest',
        },
      },
    },
    {
      name: 'Safari@latest-MacOS',
      use: {
        ...devices['Desktop Safari'],
        'browserstack:options': {
          os: 'OS X',
          osVersion: 'Ventura',
          browserName: 'safari',
          browserVersion: 'latest',
        },
      },
    },
    {
      name: 'Edge@latest-Windows',
      use: {
        ...devices['Desktop Edge'],
        'browserstack:options': {
          os: 'Windows',
          osVersion: '11',
          browserName: 'edge',
          browserVersion: 'latest',
        },
      },
    },

    // Mobile Devices - Real Devices
    {
      name: 'iPhone-14-Pro',
      use: {
        ...devices['iPhone 14 Pro'],
        'browserstack:options': {
          deviceName: 'iPhone 14 Pro',
          osVersion: '16',
          realMobile: true,
          browserName: 'safari',
        },
      },
    },
    {
      name: 'iPhone-13',
      use: {
        ...devices['iPhone 13'],
        'browserstack:options': {
          deviceName: 'iPhone 13',
          osVersion: '15',
          realMobile: true,
          browserName: 'safari',
        },
      },
    },
    {
      name: 'iPad-Pro-12.9',
      use: {
        ...devices['iPad Pro'],
        'browserstack:options': {
          deviceName: 'iPad Pro 12.9 2022',
          osVersion: '16',
          realMobile: true,
          browserName: 'safari',
        },
      },
    },
    {
      name: 'Samsung-Galaxy-S23',
      use: {
        ...devices['Galaxy S23'],
        'browserstack:options': {
          deviceName: 'Samsung Galaxy S23',
          osVersion: '13.0',
          realMobile: true,
          browserName: 'chrome',
        },
      },
    },
    {
      name: 'Google-Pixel-7',
      use: {
        ...devices['Pixel 7'],
        'browserstack:options': {
          deviceName: 'Google Pixel 7',
          osVersion: '13.0',
          realMobile: true,
          browserName: 'chrome',
        },
      },
    },
    {
      name: 'Samsung-Galaxy-Tab-S8',
      use: {
        ...devices['Galaxy Tab S8'],
        'browserstack:options': {
          deviceName: 'Samsung Galaxy Tab S8',
          osVersion: '12.0',
          realMobile: true,
          browserName: 'chrome',
        },
      },
    },

    // Older Devices for Compatibility
    {
      name: 'iPhone-12-iOS14',
      use: {
        ...devices['iPhone 12'],
        'browserstack:options': {
          deviceName: 'iPhone 12',
          osVersion: '14',
          realMobile: true,
          browserName: 'safari',
        },
      },
    },
    {
      name: 'Samsung-Galaxy-S21-Android11',
      use: {
        ...devices['Galaxy S21'],
        'browserstack:options': {
          deviceName: 'Samsung Galaxy S21',
          osVersion: '11.0',
          realMobile: true,
          browserName: 'chrome',
        },
      },
    },
  ],

  // Configure web server
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});