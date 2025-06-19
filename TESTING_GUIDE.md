# DietWise Testing Guide

## 🚀 Quick Start

```bash
# Install all dependencies including test tools
npm install

# Install Playwright browsers (first time only)
npm run playwright:install

# Run all tests
./test-runner.sh

# Or run specific test suites
npm run test:unit          # Unit tests only
npm run test:e2e           # E2E tests only
npm run test:mobile        # Mobile-specific tests
npm run test:a11y          # Accessibility tests
```

## 📋 Test Coverage

### What We Test

1. **Components** (Unit Tests)
   - ✅ UserProfileForm - Input validation, calculations
   - ✅ BarcodeScanner - Camera permissions, scan results
   - ✅ MealPlanner - AI integration, meal generation
   - ✅ WeightTracker - Chart rendering, progress calculations
   - ✅ FoodLog - CRUD operations, calorie totals

2. **User Journeys** (E2E Tests)
   - ✅ Complete onboarding flow
   - ✅ Scan barcode and log food
   - ✅ Generate 7-day meal plan
   - ✅ Track weight over time
   - ✅ Install as PWA
   - ✅ Work offline

3. **Mobile Features**
   - ✅ Touch gestures (swipe, tap, pull-to-refresh)
   - ✅ Camera barcode scanning
   - ✅ Responsive design adaptation
   - ✅ Mobile keyboard handling
   - ✅ App installation banner

4. **Accessibility**
   - ✅ WCAG 2.1 AA compliance
   - ✅ Keyboard navigation
   - ✅ Screen reader support
   - ✅ Color contrast ratios
   - ✅ Focus management

5. **Performance**
   - ✅ Bundle size limits
   - ✅ Lighthouse scores
   - ✅ First Contentful Paint < 1.5s
   - ✅ Time to Interactive < 3s
   - ✅ Cumulative Layout Shift < 0.1

## 🎯 Test Commands

```bash
# Unit & Integration Tests (Vitest)
npm run test                # Run in watch mode
npm run test:ui             # Open Vitest UI
npm run test:coverage       # Generate coverage report

# E2E Tests (Playwright)
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Open Playwright UI
npm run test:e2e:debug      # Debug mode with inspector

# Specific Test Types
npm run test:mobile         # Mobile viewport tests
npm run test:a11y          # Accessibility tests
npm run test:visual        # Visual regression tests

# Run Everything
npm run test:all           # Run all test suites
./test-runner.sh          # Run with detailed reporting
```

## 🔧 Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@components/MyComponent';

describe('MyComponent', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can complete action', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

## 🐛 Debugging Tests

### Vitest Debugging
```bash
# Use VS Code debugger with launch.json
# Or use console.log debugging
npm run test:ui  # Interactive UI for debugging
```

### Playwright Debugging
```bash
# Debug specific test
npm run test:e2e:debug

# Save trace on failure
PWDEBUG=1 npm run test:e2e

# View trace
npx playwright show-trace trace.zip
```

## 📊 Coverage Requirements

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 70%
- **Statements**: 80%

## 🔄 CI/CD Integration

All tests run automatically on:
- Every push to main/develop
- Every pull request
- Nightly (full regression suite)
- Before deployment

## 🎪 Advanced Testing

### Visual Regression with Percy
```bash
# Set up Percy token
export PERCY_TOKEN=your_token

# Run visual tests
npx percy exec -- npm run test:visual
```

### Load Testing
```bash
# Use k6 for load testing
k6 run tests/load/spike-test.js
```

### Security Testing
```bash
# Run OWASP ZAP scan
npm run test:security
```

## 📱 Mobile App Testing

For native mobile app testing after Capacitor build:

### Android (Espresso)
```bash
cd android
./gradlew connectedAndroidTest
```

### iOS (XCUITest)
```bash
cd ios
xcodebuild test -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 14'
```

## 🚨 Common Issues

1. **Playwright browsers not installed**
   ```bash
   npm run playwright:install
   ```

2. **Port already in use**
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

3. **Flaky tests**
   - Add explicit waits: `await expect(locator).toBeVisible({ timeout: 10000 })`
   - Use test.slow() for complex operations
   - Ensure proper test isolation

4. **Coverage not meeting threshold**
   - Focus on critical paths first
   - Add tests for error scenarios
   - Test edge cases

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Web Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)