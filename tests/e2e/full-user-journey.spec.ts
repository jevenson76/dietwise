import { test, expect } from '@playwright/test';

test.describe('DietWise Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete onboarding and setup goals', async ({ page }) => {
    // Test initial load
    await expect(page).toHaveTitle(/DietWise/);
    
    // Fill user profile
    await page.fill('input[name="age"]', '30');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '70');
    await page.selectOption('select[name="sex"]', 'male');
    await page.selectOption('select[name="activity_level"]', 'moderate');
    
    // Set weight goal
    await page.fill('input[name="goal_weight"]', '65');
    await page.selectOption('select[name="goal_pace"]', 'moderate');
    
    // Submit profile
    await page.click('button[type="submit"]');
    
    // Verify calculations display
    await expect(page.locator('[data-testid="bmr-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="tdee-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="daily-calories"]')).toBeVisible();
  });

  test('scan barcode and log food', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    // Navigate to scanner
    await page.click('button:has-text("Scan Barcode")');
    
    // Mock successful barcode scan
    await page.evaluate(() => {
      window.postMessage({
        type: 'barcode-scanned',
        data: { barcode: '1234567890' }
      }, '*');
    });
    
    // Verify food details loaded
    await expect(page.locator('[data-testid="food-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="calories-per-serving"]')).toBeVisible();
    
    // Add to food log
    await page.fill('input[name="servings"]', '1.5');
    await page.click('button:has-text("Add to Log")');
    
    // Verify food added to log
    await expect(page.locator('[data-testid="food-log-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="daily-total-calories"]')).not.toHaveText('0');
  });

  test('generate meal plan and shopping list', async ({ page }) => {
    // Navigate to meal planner
    await page.click('button:has-text("Meal Planner")');
    
    // Set preferences
    await page.click('input[value="vegetarian"]');
    await page.click('input[value="gluten-free"]');
    
    // Generate meal plan
    await page.click('button:has-text("Generate 7-Day Plan")');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="meal-plan-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="meal-plan-day-1"]')).toBeVisible({ timeout: 30000 });
    
    // Verify all 7 days generated
    for (let i = 1; i <= 7; i++) {
      await expect(page.locator(`[data-testid="meal-plan-day-${i}"]`)).toBeVisible();
    }
    
    // Generate shopping list
    await page.click('button:has-text("Generate Shopping List")');
    await expect(page.locator('[data-testid="shopping-list"]')).toBeVisible();
    
    // Test print functionality
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button:has-text("Print List")')
    ]);
    await expect(newPage).toHaveURL(/print/);
  });

  test('track weight progress over time', async ({ page }) => {
    // Add weight entries
    const weights = [
      { date: '2024-01-01', weight: 70 },
      { date: '2024-01-08', weight: 69.5 },
      { date: '2024-01-15', weight: 69 },
    ];
    
    for (const entry of weights) {
      await page.fill('input[name="weight-date"]', entry.date);
      await page.fill('input[name="weight-value"]', entry.weight.toString());
      await page.click('button:has-text("Log Weight")');
    }
    
    // Verify chart updates
    await expect(page.locator('canvas[data-testid="weight-chart"]')).toBeVisible();
    
    // Check progress indicators
    await expect(page.locator('[data-testid="weight-lost"]')).toContainText('1 kg');
    await expect(page.locator('[data-testid="days-remaining"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-percentage"]')).toBeVisible();
  });

  test('PWA installation flow', async ({ page, context }) => {
    // Trigger install prompt
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
    
    // Verify install button appears
    await expect(page.locator('button:has-text("Install DietWise")')).toBeVisible();
    
    // Click install
    await page.click('button:has-text("Install DietWise")');
    
    // Verify success message
    await expect(page.locator('[data-testid="install-success"]')).toBeVisible();
  });

  test('offline functionality', async ({ page, context }) => {
    // Load app and cache data
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Verify app still works
    await page.reload();
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Test cached data access
    await page.click('button:has-text("My Library")');
    await expect(page.locator('[data-testid="saved-foods"]')).toBeVisible();
    
    // Verify sync when back online
    await context.setOffline(false);
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible({ timeout: 5000 });
  });
});