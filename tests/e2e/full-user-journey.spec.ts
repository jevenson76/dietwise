import { test, expect } from '@playwright/test';
import { 
  skipOnboarding, 
  completeProfileSetup,
  navigateToTab,
  addFoodItem,
  waitForAppToLoad,
  fillProfileForm
} from './helpers';

test.describe('DietWise Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppToLoad(page);
    await skipOnboarding(page);
  });

  test('complete profile setup and see calculations', async ({ page }) => {
    // Fill comprehensive profile
    await fillProfileForm(page, {
      name: 'John Doe',
      email: 'john@example.com',
      age: '30',
      sex: 'male',
      weight: '70',
      heightFt: '5',
      heightIn: '9',
      activityLevel: 'moderate'
    });
    
    // Wait for calculations
    await page.waitForTimeout(2000);
    
    // Look for calculated values
    const pageContent = await page.locator('body').textContent();
    const hasMetrics = pageContent.includes('BMR') || 
                      pageContent.includes('TDEE') || 
                      pageContent.includes('Target') ||
                      /\d{4}\s*cal/i.test(pageContent);
    
    expect(hasMetrics).toBeTruthy();
    
    // Take screenshot of completed profile
    await page.screenshot({ path: 'test-results/journey-profile-complete.png' });
  });

  test('log food and track calories', async ({ page }) => {
    // Complete profile first
    await completeProfileSetup(page);
    await page.waitForTimeout(1000);
    
    // Navigate to food logging
    await navigateToTab(page, 'food');
    
    // Add breakfast
    await addFoodItem(page, {
      name: 'Oatmeal',
      calories: '150',
      protein: '5',
      carbs: '27',
      fat: '3'
    });
    
    // Add lunch
    await addFoodItem(page, {
      name: 'Chicken Salad',
      calories: '350',
      protein: '30',
      carbs: '15',
      fat: '20'
    });
    
    // Check if total is displayed
    const totalCalories = await page.locator('text=/500|total/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(totalCalories).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/journey-food-logged.png' });
  });

  test('navigate through all major features', async ({ page }) => {
    // Complete profile
    await completeProfileSetup(page);
    await page.waitForTimeout(1000);
    
    // Test Food Library
    await navigateToTab(page, 'food library');
    const libraryContent = await page.locator('text=/library|saved|custom/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(libraryContent).toBeTruthy();
    await page.screenshot({ path: 'test-results/journey-food-library.png' });
    
    // Test Meal Ideas
    await navigateToTab(page, 'meals');
    const mealsContent = await page.locator('text=/meal|recipe|breakfast|lunch|dinner/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(mealsContent).toBeTruthy();
    await page.screenshot({ path: 'test-results/journey-meals.png' });
    
    // Test Progress
    await navigateToTab(page, 'progress');
    const progressContent = await page.locator('text=/progress|weight|chart|history/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(progressContent).toBeTruthy();
    await page.screenshot({ path: 'test-results/journey-progress.png' });
    
    // Test 7-Day Plan
    await navigateToTab(page, 'plan');
    const planContent = await page.locator('text=/plan|week|day/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(planContent).toBeTruthy();
    await page.screenshot({ path: 'test-results/journey-plan.png' });
  });

  test('mobile user journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Complete onboarding on mobile
    await skipOnboarding(page);
    
    // Fill profile on mobile
    await fillProfileForm(page, {
      name: 'Mobile User',
      age: '25',
      sex: 'female',
      weight: '60',
      heightFt: '5',
      heightIn: '5',
      activityLevel: 'light'
    });
    
    await page.waitForTimeout(1000);
    
    // Check mobile navigation
    const mobileNav = await page.locator('nav, header').boundingBox();
    expect(mobileNav?.width).toBeLessThanOrEqual(375);
    
    // Try to log food on mobile
    await navigateToTab(page, 'food');
    
    // Check if food form is usable on mobile
    const foodInput = await page.locator('input[placeholder*="food" i]').first().boundingBox();
    expect(foodInput?.width).toBeLessThanOrEqual(350);
    
    await page.screenshot({ path: 'test-results/journey-mobile-complete.png', fullPage: true });
  });

  test('complete daily routine', async ({ page }) => {
    // Morning: Complete profile
    await completeProfileSetup(page);
    await page.waitForTimeout(1000);
    
    // Log breakfast
    await navigateToTab(page, 'food');
    await addFoodItem(page, {
      name: 'Greek Yogurt',
      calories: '150',
      protein: '15'
    });
    
    // Check meal ideas for lunch
    await navigateToTab(page, 'meals');
    await page.waitForTimeout(1000);
    
    // Log lunch
    await navigateToTab(page, 'food');
    await addFoodItem(page, {
      name: 'Turkey Sandwich',
      calories: '400',
      protein: '25'
    });
    
    // Check progress
    await navigateToTab(page, 'progress');
    await page.waitForTimeout(1000);
    
    // Log dinner
    await navigateToTab(page, 'food');
    await addFoodItem(page, {
      name: 'Grilled Salmon',
      calories: '450',
      protein: '35'
    });
    
    // Verify daily total
    const dailyTotal = await page.locator('text=/1000|total.*cal/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(dailyTotal).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/journey-daily-complete.png' });
  });
});