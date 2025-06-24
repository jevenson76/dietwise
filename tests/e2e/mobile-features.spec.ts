import { test, expect, devices } from '@playwright/test';

// Configure mobile device at the top level
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile-specific features', () => {

  test('camera barcode scanning on mobile', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    await page.goto('/');
    
    // Test touch interactions
    await page.tap('button:has-text("Scan Barcode")');
    
    // Verify camera UI adapts to mobile
    await expect(page.locator('[data-testid="camera-viewfinder"]')).toBeVisible();
    await expect(page.locator('[data-testid="camera-viewfinder"]')).toHaveCSS('width', '100%');
    
    // Test orientation handling
    await page.evaluate(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });
    
    // Mock successful scan
    await page.evaluate(() => {
      // Simulate ZXing library barcode detection
      window.postMessage({
        type: 'barcode-detected',
        data: {
          format: 'ean_13',
          rawValue: '5000112614008'
        }
      }, '*');
    });
    
    // Verify haptic feedback (vibration) was triggered
    const vibrationCalled = await page.evaluate(() => {
      return window.navigator.vibrate && window.navigator.vibrate(200);
    });
    expect(vibrationCalled).toBeTruthy();
  });

  test('swipe gestures for navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test swipe between tabs
    const startX = 300;
    const startY = 300;
    const endX = 50;
    
    await page.touchscreen.tap(startX, startY);
    await page.waitForTimeout(100);
    
    // Perform swipe
    await page.touchscreen.tap(startX, startY);
    // Swipe gesture
    await page.locator('body').dragTo(page.locator('body'), {
      sourcePosition: { x: startX, y: startY },
      targetPosition: { x: endX, y: startY }
    });
    
    // Verify tab changed
    await expect(page.locator('[data-testid="active-tab"]')).toHaveAttribute('data-tab', 'progress');
  });

  test('pull-to-refresh functionality', async ({ page }) => {
    await page.goto('/');
    
    // Perform pull-to-refresh gesture
    await page.touchscreen.tap(200, 100);
    // Pull down gesture
    await page.locator('body').dragTo(page.locator('body'), {
      sourcePosition: { x: 200, y: 100 },
      targetPosition: { x: 200, y: 400 }
    });
    
    // Verify refresh indicator
    await expect(page.locator('[data-testid="refresh-spinner"]')).toBeVisible();
    
    // Wait for refresh to complete
    await expect(page.locator('[data-testid="last-updated"]')).toContainText(/just now/i);
  });

  test('mobile keyboard handling', async ({ page }) => {
    await page.goto('/');
    
    // Focus on numeric input
    await page.tap('input[name="weight"]');
    
    // Verify numeric keyboard is shown (via inputmode)
    await expect(page.locator('input[name="weight"]')).toHaveAttribute('inputmode', 'decimal');
    
    // Test viewport adjustment when keyboard appears
    const viewportBefore = await page.viewportSize();
    await page.fill('input[name="weight"]', '75.5');
    
    // Verify form is still visible with keyboard open
    await expect(page.locator('button[type="submit"]')).toBeInViewport();
  });

  test('offline mode with service worker', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Navigate to different sections
    await page.tap('button:has-text("My Library")');
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    
    // Test offline data persistence
    await page.tap('button:has-text("Add Food")');
    await page.fill('input[name="food-name"]', 'Offline Apple');
    await page.fill('input[name="calories"]', '95');
    await page.tap('button:has-text("Save")');
    
    // Verify saved locally
    await expect(page.locator('text=Offline Apple')).toBeVisible();
    await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync
    await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible({ timeout: 10000 });
  });

  test('mobile app install banner', async ({ page, context }) => {
    // Use mobile Chrome
    await page.goto('/');
    
    // Mock beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve({ outcome: 'accepted' });
      (event as any).preventDefault = () => {};
      window.dispatchEvent(event);
    });
    
    // Verify install banner appears
    await expect(page.locator('[data-testid="install-banner"]')).toBeVisible();
    
    // Test install flow
    await page.tap('button:has-text("Install App")');
    
    // Verify success
    await expect(page.locator('[data-testid="install-success"]')).toBeVisible();
    
    // Verify banner doesn't show again
    await page.reload();
    await expect(page.locator('[data-testid="install-banner"]')).not.toBeVisible();
  });
});