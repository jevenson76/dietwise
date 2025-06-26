import { test, expect } from '@playwright/test';

test.describe('DietWise Simple Tests', () => {
  test('navigate through onboarding and tabs', async ({ page }) => {
    // Go to app
    await page.goto('/');
    
    // Handle onboarding if present
    try {
      const skipButton = page.locator('button:has-text("Skip")');
      const isVisible = await skipButton.isVisible({ timeout: 5000 });
      if (isVisible) {
        await skipButton.click();
        console.log('Skipped onboarding');
      } else {
        console.log('No onboarding screen found');
      }
    } catch (e) {
      console.log('No onboarding screen found, continuing...');
    }
    
    // Wait a bit for the app to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/simple-1-after-skip.png', fullPage: true });
    
    // Check what's visible
    const profileTab = await page.locator('button:has-text("Profile")').isVisible();
    const foodTab = await page.locator('button:has-text("Log Food")').isVisible();
    console.log('Profile tab visible:', profileTab);
    console.log('Food tab visible:', foodTab);
    
    // Check if we're already on profile page
    const nameInput = await page.locator('input#name').isVisible();
    console.log('Name input visible:', nameInput);
    
    if (nameInput) {
      // Fill basic info
      await page.fill('input#name', 'Test User');
      await page.fill('input#age', '30');
      await page.click('label[for="male"]');
      await page.fill('input#weight', '75');
      await page.fill('input#height_ft', '5');
      await page.fill('input#height_in', '10');
      await page.selectOption('select#activityLevel', 'moderate');
      
      console.log('Filled profile form');
      await page.screenshot({ path: 'test-results/simple-2-profile-filled.png', fullPage: true });
      
      // Scroll down to see if calculations appear
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(2000);
      
      // Check for any metric values
      const metrics = await page.locator('.text-2xl, .text-xl').allTextContents();
      console.log('Metric values found:', metrics);
    }
    
    // Try to navigate to Food tab
    if (foodTab) {
      await page.click('button:has-text("Log Food")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/simple-3-food-tab.png', fullPage: true });
      
      // Check what's on the food page
      const foodInputs = await page.locator('input[type="text"], input[type="number"]').count();
      console.log('Number of inputs on food page:', foodInputs);
    }
    
    // Try Progress tab
    const progressTab = await page.locator('button:has-text("Progress")').isVisible();
    if (progressTab) {
      await page.click('button:has-text("Progress")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/simple-4-progress-tab.png', fullPage: true });
    }
    
    // Try Meals tab
    const mealsTab = await page.locator('button:has-text("Meal Ideas")').isVisible();
    if (mealsTab) {
      await page.click('button:has-text("Meal Ideas")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/simple-5-meals-tab.png', fullPage: true });
    }
  });
  
  test('check mobile view', async ({ page }) => {
    // Set mobile viewport first
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Go to app
    await page.goto('/');
    
    // Handle onboarding if present
    try {
      const skipButton = page.locator('button:has-text("Skip")');
      const isVisible = await skipButton.isVisible({ timeout: 5000 });
      if (isVisible) {
        await skipButton.click();
        console.log('Skipped onboarding');
      }
    } catch (e) {
      console.log('No onboarding screen found');
    }
    
    await page.waitForTimeout(3000);
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/simple-6-mobile.png', fullPage: true });
    
    // Check for mobile menu
    const hamburger = await page.locator('button i.fa-bars').isVisible();
    console.log('Hamburger menu visible:', hamburger);
    
    if (hamburger) {
      await page.click('button:has(i.fa-bars)');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/simple-7-mobile-menu.png', fullPage: true });
    }
  });
});