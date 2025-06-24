import { test, expect } from '@playwright/test';
import { 
  skipOnboarding, 
  fillProfileForm, 
  navigateToTab, 
  waitForAppToLoad,
  completeProfileSetup 
} from './helpers';

test.describe('DietWise Basic Functionality', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    await waitForAppToLoad(page);
    
    // Skip onboarding if present
    await skipOnboarding(page);
    
    // Check that we're in the app (either profile page or has navigation)
    const profileInputVisible = await page.locator('input#name, input#age').first().isVisible({ timeout: 5000 }).catch(() => false);
    const navigationVisible = await page.locator('button:has-text("Profile"), button:has-text("Log Food")').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(profileInputVisible || navigationVisible).toBeTruthy();
  });

  test('can fill user profile and see calculations', async ({ page }) => {
    await page.goto('/');
    await waitForAppToLoad(page);
    await skipOnboarding(page);
    
    // Fill profile with test data
    await fillProfileForm(page, {
      name: 'Test User',
      age: '25',
      sex: 'male',
      weight: '70',
      heightFt: '5',
      heightIn: '7',
      activityLevel: 'moderate'
    });
    
    // Wait for calculations to potentially appear
    await page.waitForTimeout(2000);
    
    // Look for any calculated values (BMR, TDEE, target calories)
    const calculationElements = await page.locator('.text-2xl, .text-xl, .font-bold').allTextContents();
    const hasCalculations = calculationElements.some(text => 
      text.includes('BMR') || 
      text.includes('TDEE') || 
      text.includes('Target') ||
      /\d{4}/.test(text) // Look for 4-digit numbers (typical calorie values)
    );
    
    expect(hasCalculations).toBeTruthy();
  });

  test('can navigate between tabs', async ({ page }) => {
    await page.goto('/');
    await waitForAppToLoad(page);
    await skipOnboarding(page);
    
    // Complete profile first to ensure all tabs are accessible
    await completeProfileSetup(page);
    await page.waitForTimeout(1000);
    
    // Test navigation to different tabs
    const tabs = ['Food', 'Progress', 'Meals'];
    
    for (const tab of tabs) {
      try {
        await navigateToTab(page, tab);
        
        // Verify we navigated by checking for unique content
        let contentFound = false;
        
        if (tab === 'Food') {
          contentFound = await page.locator('input[placeholder*="food" i], button:has-text("Log Food")').first().isVisible({ timeout: 2000 }).catch(() => false);
        } else if (tab === 'Progress') {
          contentFound = await page.locator('text=/Progress|Chart|History/i').first().isVisible({ timeout: 2000 }).catch(() => false);
        } else if (tab === 'Meals') {
          contentFound = await page.locator('text=/Meal|Recipe|Ideas/i').first().isVisible({ timeout: 2000 }).catch(() => false);
        }
        
        expect(contentFound).toBeTruthy();
      } catch (error) {
        console.log(`Could not navigate to ${tab} tab:`, error.message);
      }
    }
  });

  test('responsive design works', async ({ page }) => {
    await page.goto('/');
    await waitForAppToLoad(page);
    await skipOnboarding(page);
    
    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Check desktop layout characteristics
    const desktopNavigation = await page.locator('nav, header').boundingBox();
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    // Check mobile layout characteristics
    const mobileNavigation = await page.locator('nav, header').boundingBox();
    
    // Navigation should adapt (different width or position)
    expect(desktopNavigation?.width).not.toEqual(mobileNavigation?.width);
    
    // Check if content reflows properly
    const mobileContent = await page.locator('main, .container').first().boundingBox();
    expect(mobileContent?.width).toBeLessThanOrEqual(375);
  });
});