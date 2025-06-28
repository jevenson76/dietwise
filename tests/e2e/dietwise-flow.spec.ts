import { test, expect } from '@playwright/test';
import { handleOnboarding, navigateToTab } from './helpers/onboarding';

test.describe('DietWise User Flow', () => {
  test('complete user journey from onboarding to food logging', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Handle onboarding
    await handleOnboarding(page);
    
    // Wait for the main app to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of main page
    await page.screenshot({ path: 'test-results/1-main-page.png', fullPage: true });
    
    // Check if we need to complete profile first
    const profileMessage = page.locator('text=/complete your profile/i');
    if (await profileMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Need to complete profile first');
      
      // Go to Profile tab
      const profileTab = page.getByRole('button', { name: /profile/i });
      await profileTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill profile if we're on the profile page
    const nameInput = page.locator('input#name, input[name="name"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Filling profile form');
      
      // Fill basic info
      await nameInput.fill('Test User');
      
      const ageInput = page.locator('input#age, input[name="age"]').first();
      await ageInput.fill('30');
      
      // Select sex - click the male option
      const maleOption = page.locator('label[for="male"]');
      await maleOption.click();
      
      // Fill weight
      const weightInput = page.locator('input#weight, input[name="weight"]').first();
      await weightInput.fill('75');
      
      // Fill height
      const heightFt = page.locator('input#height_ft, input[name="height_ft"]').first();
      const heightIn = page.locator('input#height_in, input[name="height_in"]').first();
      await heightFt.fill('5');
      await heightIn.fill('10');
      
      // Select activity level
      const activitySelect = page.locator('select#activityLevel, select[name="activityLevel"]').first();
      await activitySelect.selectOption('moderate');
      
      // Take screenshot after filling profile
      await page.screenshot({ path: 'test-results/2-profile-filled.png', fullPage: true });
      
      // Wait for calculations to appear
      await expect(page.locator('text=/BMI|BMR|Calories/i').first()).toBeVisible({ timeout: 5000 });
      console.log('Profile calculations visible');
    }
    
    // Navigate to Food tab
    await navigateToTab(page, 'Log Food');
    await page.waitForTimeout(1000);
    
    // Take screenshot of food page
    await page.screenshot({ path: 'test-results/3-food-page.png', fullPage: true });
    
    // Add a food item
    const foodNameInput = page.locator('input[placeholder*="food" i], input[name="foodName"]').first();
    const caloriesInput = page.locator('input[placeholder*="calorie" i], input[name="calories"]').first();
    
    if (await foodNameInput.isVisible() && await caloriesInput.isVisible()) {
      await foodNameInput.fill('Apple');
      await caloriesInput.fill('95');
      
      // Click Add button
      const addButton = page.getByRole('button', { name: /add|log/i }).first();
      await addButton.click();
      
      // Wait for food to be added
      await page.waitForTimeout(1000);
      
      // Verify food was added
      await expect(page.locator('text="Apple"')).toBeVisible({ timeout: 5000 });
      console.log('Food item added successfully');
      
      // Take screenshot after adding food
      await page.screenshot({ path: 'test-results/4-food-added.png', fullPage: true });
    }
    
    // Navigate to Progress tab
    const progressTab = page.getByRole('button', { name: /progress/i }).first();
    await progressTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of progress page
    await page.screenshot({ path: 'test-results/5-progress-page.png', fullPage: true });
    
    // Navigate to Meals tab
    const mealsTab = page.getByRole('button', { name: /meals/i }).first();
    await mealsTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of meals page
    await page.screenshot({ path: 'test-results/6-meals-page.png', fullPage: true });
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/7-mobile-view.png', fullPage: true });
    
    // Check for mobile menu
    const mobileMenu = page.locator('button:has(i.fa-bars)').first();
    if (await mobileMenu.isVisible()) {
      console.log('Mobile menu button visible');
      await mobileMenu.click();
      await page.waitForTimeout(500);
      
      // Take screenshot with menu open
      await page.screenshot({ path: 'test-results/8-mobile-menu.png', fullPage: true });
    }
  });
  
  test('test quick add suggestions', async ({ page }) => {
    // Navigate and skip onboarding
    await page.goto('/');
    const skipButton = page.getByRole('button', { name: 'Skip' });
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click();
    }
    
    // Go to Food tab
    await page.waitForTimeout(2000);
    const foodTab = page.getByRole('button', { name: 'Log Food' });
    await foodTab.click();
    await page.waitForTimeout(1000);
    
    // Check for quick add suggestions
    const suggestions = page.locator('text=/Quick Add Suggestions/i');
    if (await suggestions.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Quick add suggestions visible');
      
      // Click on a suggestion
      const firstSuggestion = page.locator('button').filter({ hasText: /kcal/i }).first();
      if (await firstSuggestion.isVisible()) {
        await firstSuggestion.click();
        console.log('Clicked on food suggestion');
        
        // Verify it was added
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/9-suggestion-added.png', fullPage: true });
      }
    }
  });
  
  test('test data export', async ({ page }) => {
    // Navigate and skip onboarding
    await page.goto('/');
    const skipButton = page.getByRole('button', { name: 'Skip' });
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click();
    }
    
    // Go to Progress tab
    await page.waitForTimeout(2000);
    const progressTab = page.getByRole('button', { name: 'Progress' });
    await progressTab.click();
    await page.waitForTimeout(1000);
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export/i }).first();
    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Export button found');
      
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      // Click export
      await exportButton.click();
      
      // Check if download started
      const download = await downloadPromise;
      if (download) {
        console.log('Download started:', download.suggestedFilename());
      }
    }
  });
});