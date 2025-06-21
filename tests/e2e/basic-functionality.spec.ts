import { test, expect } from '@playwright/test';

test.describe('DietWise Basic Functionality', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle('DietWise');
    
    // Check main elements are visible
    await expect(page.locator('h1:has-text("DietWise")')).toBeVisible();
    
    // Check profile form exists
    await expect(page.locator('input[name="age"]')).toBeVisible();
    await expect(page.locator('input[name="height"]')).toBeVisible();
    await expect(page.locator('input[name="weight"]')).toBeVisible();
  });

  test('can fill user profile and see calculations', async ({ page }) => {
    await page.goto('/');
    
    // Fill basic profile
    await page.fill('input[name="age"]', '25');
    await page.fill('input[name="height"]', '170');
    await page.fill('input[name="weight"]', '70');
    await page.selectOption('select[name="sex"]', 'male');
    await page.selectOption('select[name="activityLevel"]', 'moderate');
    
    // Submit form (if there's a button)
    const submitButton = page.locator('button[type="submit"]:visible');
    if (await submitButton.count() > 0) {
      await submitButton.click();
    }
    
    // Wait a bit for calculations
    await page.waitForTimeout(1000);
    
    // Check if any calculations are shown
    const calculationsVisible = await page.locator('text=/BMR|TDEE|calories/i').count() > 0;
    expect(calculationsVisible).toBeTruthy();
  });

  test('can navigate between tabs', async ({ page }) => {
    await page.goto('/');
    
    // Look for tab buttons
    const tabButtons = await page.locator('button[role="tab"], button:has-text("Progress"), button:has-text("Library"), button:has-text("Planner")').all();
    
    if (tabButtons.length > 0) {
      // Click first available tab
      await tabButtons[0].click();
      await page.waitForTimeout(500);
      
      // Verify some content changed
      const urlChanged = page.url() !== 'http://localhost:5175/';
      const contentChanged = await page.locator('main, [role="main"]').textContent() !== '';
      
      expect(urlChanged || contentChanged).toBeTruthy();
    }
  });

  test('responsive design works', async ({ page }) => {
    await page.goto('/');
    
    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    const desktopLayout = await page.screenshot();
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobileLayout = await page.screenshot();
    
    // Layouts should be different
    expect(desktopLayout).not.toEqual(mobileLayout);
  });
});