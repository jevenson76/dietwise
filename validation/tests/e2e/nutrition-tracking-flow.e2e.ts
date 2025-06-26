import { test, expect, Page } from '@playwright/test';
import { setupUser, loginUser, clearUserData } from './helpers/userHelpers';
import { addFoodItem, scanBarcode, logMeal } from './helpers/nutritionHelpers';

test.describe('Complete Nutrition Tracking Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    
    // Setup fresh user for each test
    await clearUserData(page);
    await setupUser(page, {
      name: 'Test User',
      age: 30,
      gender: 'male',
      height: { ft: 5, in: 10 },
      weight: 180,
      activityLevel: 'moderately_active',
      dietGoal: 'lose_weight',
      targetWeight: 170
    });
  });

  test('User can complete full onboarding and start tracking', async () => {
    // Should start with splash screen
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible();
    
    // Click through onboarding
    await page.click('[data-testid="start-onboarding"]');
    
    // Fill out profile form
    await page.fill('[data-testid="user-name"]', 'John Doe');
    await page.fill('[data-testid="user-age"]', '30');
    await page.selectOption('[data-testid="user-gender"]', 'male');
    await page.fill('[data-testid="height-feet"]', '5');
    await page.fill('[data-testid="height-inches"]', '10');
    await page.fill('[data-testid="current-weight"]', '180');
    await page.selectOption('[data-testid="activity-level"]', 'moderately_active');
    await page.selectOption('[data-testid="diet-goal"]', 'lose_weight');
    await page.fill('[data-testid="target-weight"]', '170');
    
    // Submit profile
    await page.click('[data-testid="save-profile"]');
    
    // Should navigate to main app
    await expect(page.locator('[data-testid="food-log-tab"]')).toBeVisible();
    
    // Check that calculations are displayed
    await expect(page.locator('[data-testid="bmi-display"]')).toContainText('25.8');
    await expect(page.locator('[data-testid="target-calories"]')).toContainText('2,100');
  });

  test('User can add food items manually', async () => {
    await loginUser(page);
    
    // Navigate to food log
    await page.click('[data-testid="food-log-tab"]');
    
    // Add food item
    await page.click('[data-testid="add-food-button"]');
    
    // Fill food details
    await page.fill('[data-testid="food-name"]', 'Banana');
    await page.fill('[data-testid="food-calories"]', '105');
    await page.fill('[data-testid="food-protein"]', '1.3');
    await page.fill('[data-testid="food-carbs"]', '27');
    await page.fill('[data-testid="food-fat"]', '0.4');
    await page.selectOption('[data-testid="meal-type"]', 'breakfast');
    
    // Save food item
    await page.click('[data-testid="save-food"]');
    
    // Verify food appears in log
    await expect(page.locator('[data-testid="food-log-item"]')).toContainText('Banana');
    await expect(page.locator('[data-testid="daily-calories"]')).toContainText('105');
    
    // Check nutritional progress
    await expect(page.locator('[data-testid="calories-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="protein-progress"]')).toBeVisible();
  });

  test('User can scan barcodes to add foods', async () => {
    await loginUser(page);
    
    // Mock camera permissions
    await page.context().grantPermissions(['camera']);
    
    // Navigate to scanner
    await page.click('[data-testid="barcode-scanner-button"]');
    
    // Mock successful barcode scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcodeScanned', {
        detail: { code: '123456789012', foodData: {
          name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3
        }}
      }));
    });
    
    // Should auto-fill food form
    await expect(page.locator('[data-testid="food-name"]')).toHaveValue('Apple');
    await expect(page.locator('[data-testid="food-calories"]')).toHaveValue('95');
    
    // Save the scanned food
    await page.click('[data-testid="save-food"]');
    
    // Verify it's added to log
    await expect(page.locator('[data-testid="food-log-item"]')).toContainText('Apple');
  });

  test('User can track weight progress', async () => {
    await loginUser(page);
    
    // Navigate to progress tab
    await page.click('[data-testid="progress-tab"]');
    
    // Add weight entry
    await page.click('[data-testid="add-weight-button"]');
    await page.fill('[data-testid="weight-input"]', '179');
    await page.click('[data-testid="save-weight"]');
    
    // Should show in weight chart
    await expect(page.locator('[data-testid="weight-chart"]')).toBeVisible();
    
    // Add another weight entry to show progress
    await page.click('[data-testid="add-weight-button"]');
    await page.fill('[data-testid="weight-input"]', '178');
    await page.click('[data-testid="save-weight"]');
    
    // Should show weight loss trend
    await expect(page.locator('[data-testid="weight-trend"]')).toContainText('↓');
  });

  test('User can set and receive meal reminders', async () => {
    await loginUser(page);
    
    // Navigate to settings
    await page.click('[data-testid="settings-tab"]');
    
    // Enable meal reminders
    await page.check('[data-testid="enable-reminders"]');
    
    // Set breakfast reminder
    await page.fill('[data-testid="breakfast-time"]', '08:00');
    await page.check('[data-testid="breakfast-enabled"]');
    
    // Save settings
    await page.click('[data-testid="save-settings"]');
    
    // Mock notification permission
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'granted' });
    });
    
    // Should confirm reminders are set
    await expect(page.locator('[data-testid="reminders-status"]')).toContainText('Active');
  });

  test('User can view nutrition analytics', async () => {
    await loginUser(page);
    
    // Add some food data first
    await addFoodItem(page, {
      name: 'Oatmeal',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      mealType: 'breakfast'
    });
    
    await addFoodItem(page, {
      name: 'Chicken Salad',
      calories: 300,
      protein: 35,
      carbs: 10,
      fat: 12,
      mealType: 'lunch'
    });
    
    // Navigate to analytics
    await page.click('[data-testid="analytics-tab"]');
    
    // Should show daily summary
    await expect(page.locator('[data-testid="daily-calories"]')).toContainText('450');
    
    // Should show macro breakdown chart
    await expect(page.locator('[data-testid="macro-chart"]')).toBeVisible();
    
    // Should show weekly trends
    await expect(page.locator('[data-testid="weekly-trend"]')).toBeVisible();
  });

  test('User can create and save custom meals', async () => {
    await loginUser(page);
    
    // Navigate to meal planner
    await page.click('[data-testid="meal-planner-tab"]');
    
    // Create custom meal
    await page.click('[data-testid="create-custom-meal"]');
    await page.fill('[data-testid="meal-name"]', 'My Protein Bowl');
    
    // Add ingredients
    await page.click('[data-testid="add-ingredient"]');
    await page.fill('[data-testid="ingredient-name"]', 'Chicken Breast');
    await page.fill('[data-testid="ingredient-amount"]', '150g');
    
    await page.click('[data-testid="add-ingredient"]');
    await page.fill('[data-testid="ingredient-name-1"]', 'Rice');
    await page.fill('[data-testid="ingredient-amount-1"]', '100g');
    
    // Save custom meal
    await page.click('[data-testid="save-custom-meal"]');
    
    // Should appear in meal library
    await page.click('[data-testid="meal-library-tab"]');
    await expect(page.locator('[data-testid="custom-meal"]')).toContainText('My Protein Bowl');
  });

  test('User can export nutrition data', async () => {
    await loginUser(page);
    
    // Add some tracking data
    await addFoodItem(page, {
      name: 'Test Food',
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 5,
      mealType: 'lunch'
    });
    
    // Navigate to profile/settings
    await page.click('[data-testid="profile-tab"]');
    
    // Export data
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-data"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('nutrition-data');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('User can use offline mode', async () => {
    await loginUser(page);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Try to add food while offline
    await page.click('[data-testid="add-food-button"]');
    await page.fill('[data-testid="food-name"]', 'Offline Apple');
    await page.fill('[data-testid="food-calories"]', '80');
    await page.click('[data-testid="save-food"]');
    
    // Should show in offline queue
    await expect(page.locator('[data-testid="offline-queue"]')).toContainText('1 item');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should sync offline data
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Synced');
    await expect(page.locator('[data-testid="food-log-item"]')).toContainText('Offline Apple');
  });

  test('User can upgrade to premium and access advanced features', async () => {
    await loginUser(page);
    
    // Try to access premium feature
    await page.click('[data-testid="advanced-analytics-tab"]');
    
    // Should show upgrade prompt
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    
    // Click upgrade
    await page.click('[data-testid="upgrade-button"]');
    
    // Should navigate to checkout
    await expect(page.locator('[data-testid="stripe-checkout"]')).toBeVisible();
    
    // Mock successful payment
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('paymentSuccess', {
        detail: { subscriptionId: 'sub_test123' }
      }));
    });
    
    // Should now have premium access
    await expect(page.locator('[data-testid="premium-badge"]')).toBeVisible();
    
    // Should be able to access advanced features
    await page.click('[data-testid="advanced-analytics-tab"]');
    await expect(page.locator('[data-testid="advanced-charts"]')).toBeVisible();
  });

  test('User receives AI-powered meal suggestions', async () => {
    await loginUser(page);
    
    // Navigate to meal suggestions
    await page.click('[data-testid="meal-ideas-tab"]');
    
    // Set dietary preferences
    await page.click('[data-testid="dietary-preferences"]');
    await page.check('[data-testid="vegetarian"]');
    await page.fill('[data-testid="calorie-target"]', '2000');
    
    // Get AI suggestions
    await page.click('[data-testid="get-suggestions"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="ai-loading"]')).toBeVisible();
    
    // Should show AI-generated suggestions
    await expect(page.locator('[data-testid="meal-suggestion"]')).toBeVisible();
    await expect(page.locator('[data-testid="meal-suggestion"]')).toContainText('vegetarian');
    
    // User can add suggested meal
    await page.click('[data-testid="add-suggested-meal"]');
    await expect(page.locator('[data-testid="food-log-item"]')).toBeVisible();
  });

  test('User can share progress on social media', async () => {
    await loginUser(page);
    
    // Navigate to progress
    await page.click('[data-testid="progress-tab"]');
    
    // Mock some progress data
    await page.evaluate(() => {
      localStorage.setItem('weightProgress', JSON.stringify([
        { date: '2024-06-20', weight: 185 },
        { date: '2024-06-26', weight: 180 }
      ]));
    });
    
    // Refresh to load progress
    await page.reload();
    await page.click('[data-testid="progress-tab"]');
    
    // Share progress
    await page.click('[data-testid="share-progress"]');
    
    // Should show share options
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    
    // Mock successful share
    await page.click('[data-testid="share-twitter"]');
    await expect(page.locator('[data-testid="share-success"]')).toContainText('Shared successfully!');
  });
});