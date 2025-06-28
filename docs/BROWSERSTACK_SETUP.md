# BrowserStack Setup Guide for DietWise

## Overview
This guide explains how to configure BrowserStack for cross-device testing in the DietWise application.

## Prerequisites
- BrowserStack account with valid credentials
- GitHub repository with Actions enabled
- Node.js and npm installed locally

## Step 1: Local Development Setup

### 1. Install BrowserStack Dependencies
```bash
npm install -D @playwright/test browserstack-local
```

### 2. Create Local Environment File
Create a `.env.local` file (not committed to Git):
```bash
# .env.local
BROWSERSTACK_USERNAME=jasonevenson_4icqQp
BROWSERSTACK_ACCESS_KEY=xJPz7rSNtBurqz5K6G5c
```

### 3. Update .gitignore
Ensure your credentials are never committed:
```bash
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

## Step 2: GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:

| Secret Name | Value |
|-------------|-------|
| `BROWSERSTACK_USERNAME` | `jasonevenson_4icqQp` |
| `BROWSERSTACK_ACCESS_KEY` | `xJPz7rSNtBurqz5K6G5c` |

## Step 3: Test Configuration

### Local Testing
```bash
# Run BrowserStack tests locally
npm run build
npx playwright test --config=browserstack.config.ts
```

### CI/CD Testing
The BrowserStack workflow will automatically run when:
- Pushing to `main` branch
- Creating pull requests with `browserstack` label
- Manual workflow dispatch

## Step 4: Device Coverage

The configuration includes testing on:

### Desktop Browsers
- Chrome (latest) on Windows 11
- Firefox (latest) on Windows 11
- Safari (latest) on macOS Ventura
- Edge (latest) on Windows 11

### Mobile Devices (Real Devices)
- iPhone 14 Pro (iOS 16)
- iPhone 13 (iOS 15)
- iPhone 12 (iOS 14) - Compatibility
- iPad Pro 12.9 (iPadOS 16)
- Samsung Galaxy S23 (Android 13)
- Samsung Galaxy S21 (Android 11) - Compatibility
- Google Pixel 7 (Android 13)
- Samsung Galaxy Tab S8 (Android 12)

## Step 5: Test Execution Commands

```bash
# Run all BrowserStack tests
npx playwright test --config=browserstack.config.ts

# Run specific device tests
npx playwright test --config=browserstack.config.ts --grep "iPhone-14-Pro"

# Run with debug mode
npx playwright test --config=browserstack.config.ts --debug

# Run specific test suite
npx playwright test --config=browserstack.config.ts tests/e2e/basic-functionality.spec.ts
```

## Step 6: Monitoring and Results

### BrowserStack Dashboard
- View real-time test execution: https://app.browserstack.com/dashboard
- Access detailed logs, screenshots, and videos
- Debug test failures with session recordings

### GitHub Actions
- Test results appear in GitHub Actions summary
- Failed tests upload artifacts (screenshots, videos)
- PR comments show device-specific pass/fail status

## Step 7: Best Practices

### Test Organization
```typescript
// Tag tests for specific devices
test('Food logging @iPhone-14-Pro @Samsung-Galaxy-S23', async ({ page }) => {
  // Test implementation
});

// Visual regression tests
test('Homepage layout @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Performance Considerations
- Limit parallel workers to 4 for BrowserStack
- Use appropriate timeouts (90s default)
- Test critical user journeys first
- Group related tests to minimize setup time

### Cost Optimization
- Focus on key user journeys
- Use device matrix strategically
- Schedule runs for non-peak hours
- Monitor usage in BrowserStack dashboard

## Step 8: Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Increase timeout values
   - Check BrowserStack service status
   - Verify network connectivity

2. **Authentication Errors**
   - Verify credentials in GitHub secrets
   - Check BrowserStack account status
   - Ensure sufficient parallel test allowance

3. **Test Failures on Specific Devices**
   - Check device-specific capabilities
   - Review session recordings in BrowserStack
   - Adjust test selectors for different viewports

### Debug Commands
```bash
# Test with verbose logging
DEBUG=pw:api npx playwright test --config=browserstack.config.ts

# Test single browser
npx playwright test --config=browserstack.config.ts --project="iPhone-14-Pro"

# Run with UI mode
npx playwright test --config=browserstack.config.ts --ui
```

## Step 9: Integration with Existing Tests

The BrowserStack configuration is designed to work alongside your existing Playwright tests:

```bash
# Local Playwright tests
npm run test:e2e

# BrowserStack cross-device tests
npx playwright test --config=browserstack.config.ts

# Both local and BrowserStack (CI)
npm run test:all
```

## Cost and Usage Monitoring

### BrowserStack Plan Considerations
- **Parallel tests**: Current config uses 4 workers
- **Test minutes**: Monitor usage in dashboard
- **Real device hours**: Track mobile device usage
- **Screenshot/video storage**: Automated cleanup after 30 days

### Usage Optimization
```typescript
// Run BrowserStack tests only for critical paths
test.describe('Critical User Journey @browserstack', () => {
  // High-priority tests only
});

// Local tests for development
test.describe('Development Tests', () => {
  // Comprehensive test suite
});
```

## Security Notes
- Never commit credentials to version control
- Use GitHub secrets for CI/CD
- Rotate access keys periodically
- Monitor access logs in BrowserStack dashboard

## Next Steps
1. ✅ Credentials configured
2. ⏳ Run first BrowserStack test
3. ⏳ Verify device coverage
4. ⏳ Integrate with existing CI/CD
5. ⏳ Monitor usage and costs

Your BrowserStack setup is now ready for cross-device testing!