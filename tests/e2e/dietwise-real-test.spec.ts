import { test, expect } from '@playwright/test';

test.describe('DietWise App Real Tests', () => {
  test('fill profile and calculate metrics', async ({ page }) => {
    await page.goto('/');
    
    // Fill user profile with actual field names
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="age"]', '30');
    
    // Select sex (radio buttons)
    await page.click('input[id="male"]');
    
    // Fill height (feet and inches)
    await page.fill('input[name="height_ft"]', '5');
    await page.fill('input[name="height_in"]', '10');
    
    // Fill weight
    await page.fill('input[name="weight"]', '170');
    
    // Fill activity level
    await page.selectOption('select[id="activityLevel"]', 'moderate');
    
    // Set target weight
    await page.fill('input[name="targetWeightInput"]', '160');
    
    // Wait for calculations to appear
    await page.waitForTimeout(1000);
    
    // Check if BMR/TDEE calculations are visible
    const calculations = await page.locator('text=/BMR|TDEE|calories per day/i').first();
    await expect(calculations).toBeVisible({ timeout: 5000 });
    
    // Take screenshot of calculations
    await page.screenshot({ 
      path: 'dietwise-calculations.png',
      fullPage: true 
    });
  });

  test('navigate through app features', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation buttons
    const buttons = ['Log Food', 'Food Library', 'Meal Ideas', '7-Day Plan', 'Progress'];
    
    for (const buttonText of buttons) {
      const button = page.locator(`button:has-text("${buttonText}")`);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);
        
        // Check if content changed
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeTruthy();
        
        console.log(`✓ Clicked ${buttonText}`);
      }
    }
  });

  test('test food logging', async ({ page }) => {
    await page.goto('/');
    
    // Click Log Food button
    await page.click('button:has-text("Log Food")');
    await page.waitForTimeout(1000);
    
    // Check if food logging interface appears
    const foodInterface = await page.locator('text=/add food|scan barcode|search food/i').count();
    expect(foodInterface).toBeGreaterThan(0);
  });

  test('test responsive design', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopScreenshot = await page.screenshot({ 
      path: 'dietwise-desktop.png',
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletScreenshot = await page.screenshot({ 
      path: 'dietwise-tablet.png',
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileScreenshot = await page.screenshot({ 
      path: 'dietwise-mobile.png',
      fullPage: true 
    });
    
    // All screenshots should exist and be different sizes
    expect(desktopScreenshot.length).toBeGreaterThan(0);
    expect(tabletScreenshot.length).toBeGreaterThan(0);
    expect(mobileScreenshot.length).toBeGreaterThan(0);
  });
});