import { test, expect } from '@playwright/test';

test.describe('DietWise Granular Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('complete onboarding flow', async ({ page }) => {
    // Check if we're on the onboarding screen
    const onboardingTitle = page.locator('h1:has-text("Welcome to DietWise")');
    if (await onboardingTitle.isVisible()) {
      console.log('Onboarding screen detected');
      
      // Skip or go through onboarding
      const skipButton = page.locator('button:has-text("Skip")');
      const nextButton = page.locator('button:has-text("Next")');
      
      if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('Clicked Skip button');
      } else if (await nextButton.isVisible()) {
        // Go through onboarding screens
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Continue clicking Next until we reach the main app
        while (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
        
        // Check for Get Started button
        const getStartedButton = page.locator('button:has-text("Get Started")');
        if (await getStartedButton.isVisible()) {
          await getStartedButton.click();
          console.log('Clicked Get Started button');
        }
      }
    }
    
    // Wait for main app to load
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of main app
    await page.screenshot({ path: 'test-results/main-app-after-onboarding.png', fullPage: true });
  });

  test('navigate to profile and fill form', async ({ page }) => {
    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Wait for main app
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    
    // Navigate to Profile tab
    const profileTab = page.locator('[data-testid="tab-profile"], button:has-text("Profile")').first();
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of profile page
    await page.screenshot({ path: 'test-results/profile-page.png', fullPage: true });
    
    // Fill profile form
    const nameInput = page.locator('input[name="name"], input#name').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      console.log('Filled name');
    }
    
    const ageInput = page.locator('input[name="age"], input#age').first();
    if (await ageInput.isVisible()) {
      await ageInput.fill('30');
      console.log('Filled age');
    }
    
    // Select sex
    const maleRadio = page.locator('input[value="male"], input#male').first();
    if (await maleRadio.isVisible()) {
      await maleRadio.click();
      console.log('Selected male');
    }
    
    // Fill weight
    const weightInput = page.locator('input[name="weight"], input#weight').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill('75');
      console.log('Filled weight');
    }
    
    // Fill height
    const heightFtInput = page.locator('input[name="height_ft"], input#height_ft').first();
    const heightInInput = page.locator('input[name="height_in"], input#height_in').first();
    
    if (await heightFtInput.isVisible() && await heightInInput.isVisible()) {
      await heightFtInput.fill('5');
      await heightInInput.fill('10');
      console.log('Filled height');
    }
    
    // Select activity level
    const activitySelect = page.locator('select[name="activityLevel"], select#activityLevel').first();
    if (await activitySelect.isVisible()) {
      await activitySelect.selectOption('moderate');
      console.log('Selected activity level');
    }
    
    // Take screenshot after filling
    await page.screenshot({ path: 'test-results/profile-filled.png', fullPage: true });
    
    // Check if calculations are shown
    await expect(page.locator('text=/BMI|Calories|BMR/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('test food logging', async ({ page }) => {
    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Wait for main app
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    
    // Navigate to Food tab
    const foodTab = page.locator('[data-testid="tab-food"], button:has-text("Food")').first();
    await foodTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of food page
    await page.screenshot({ path: 'test-results/food-page.png', fullPage: true });
    
    // Try to add food
    const foodNameInput = page.locator('input[placeholder*="food name"], input[name="foodName"]').first();
    const caloriesInput = page.locator('input[placeholder*="calories"], input[name="calories"]').first();
    
    if (await foodNameInput.isVisible() && await caloriesInput.isVisible()) {
      await foodNameInput.fill('Apple');
      await caloriesInput.fill('100');
      
      // Find and click add button
      const addButton = page.locator('button:has-text("Add"), button:has-text("Log")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        console.log('Added food item');
        
        // Wait for food to be added
        await page.waitForTimeout(1000);
        
        // Check if food was added
        await expect(page.locator('text="Apple"')).toBeVisible({ timeout: 5000 });
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/food-added.png', fullPage: true });
  });

  test('test all navigation tabs', async ({ page }) => {
    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Wait for main app
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    
    // Test each tab
    const tabs = ['Food', 'Progress', 'Meals', 'Profile'];
    
    for (const tabName of tabs) {
      const tab = page.locator(`[data-testid="tab-${tabName.toLowerCase()}"], button:has-text("${tabName}")`).first();
      if (await tab.isVisible()) {
        await tab.click();
        console.log(`Clicked ${tabName} tab`);
        await page.waitForTimeout(500);
        
        // Take screenshot of each tab
        await page.screenshot({ 
          path: `test-results/tab-${tabName.toLowerCase()}.png`, 
          fullPage: true 
        });
        
        // Verify we're on the correct tab
        const activeTab = page.locator('.bg-teal-600, .text-teal-600').first();
        await expect(activeTab).toContainText(tabName, { ignoreCase: true });
      }
    }
  });

  test('test responsive design', async ({ page }) => {
    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Wait for main app
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568, name: 'iphone-se' },
      { width: 768, height: 1024, name: 'ipad' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name}.png`, 
        fullPage: true 
      });
      
      // Check if navigation is visible or in hamburger menu
      const desktopNav = page.locator('.hidden.sm\\:flex, .md\\:flex').first();
      const mobileMenuButton = page.locator('button:has(i.fa-bars)').first();
      
      if (viewport.width < 768) {
        await expect(mobileMenuButton).toBeVisible();
        console.log(`Mobile menu visible at ${viewport.width}px`);
      } else {
        await expect(desktopNav).toBeVisible();
        console.log(`Desktop nav visible at ${viewport.width}px`);
      }
    }
  });
});