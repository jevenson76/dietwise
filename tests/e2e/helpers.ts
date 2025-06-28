import { Page, expect } from '@playwright/test';

export async function skipOnboarding(page: Page) {
  // Wait for and click skip button if visible
  const skipButton = page.getByRole('button', { name: 'Skip' });
  if (await skipButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skipButton.click();
    console.log('Skipped onboarding');
    // Wait for navigation to complete
    await page.waitForTimeout(2000);
  }
}

export async function fillProfileForm(page: Page, data: {
  name?: string;
  email?: string;
  age?: string;
  sex?: 'male' | 'female';
  weight?: string;
  heightFt?: string;
  heightIn?: string;
  activityLevel?: string;
}) {
  // Fill name - try multiple selectors and wait longer
  if (data.name) {
    try {
      const nameInput = page.locator('input#name, input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.waitFor({ timeout: 10000 });
      await nameInput.fill(data.name);
    } catch (error) {
      console.log('Name input not found, skipping...');
    }
  }
  
  // Fill email
  if (data.email) {
    const emailInput = page.locator('input#email, input[name="email"]').first();
    await emailInput.fill(data.email);
  }
  
  // Fill age
  if (data.age) {
    const ageInput = page.locator('input#age, input[name="age"]').first();
    await ageInput.fill(data.age);
  }
  
  // Select sex
  if (data.sex) {
    const sexOption = page.locator(`label[for="${data.sex}"]`);
    await sexOption.click();
  }
  
  // Fill weight
  if (data.weight) {
    const weightInput = page.locator('input#weight, input[name="weight"]').first();
    await weightInput.fill(data.weight);
  }
  
  // Fill height
  if (data.heightFt && data.heightIn) {
    const heightFtInput = page.locator('input#height_ft, input[name="height_ft"]').first();
    const heightInInput = page.locator('input#height_in, input[name="height_in"]').first();
    await heightFtInput.fill(data.heightFt);
    await heightInInput.fill(data.heightIn);
  }
  
  // Select activity level
  if (data.activityLevel) {
    const activitySelect = page.locator('select#activityLevel, select[name="activityLevel"]').first();
    await activitySelect.selectOption(data.activityLevel);
  }
  
  // Wait for calculations to potentially appear
  await page.waitForTimeout(1000);
}

export async function completeProfileSetup(page: Page) {
  await fillProfileForm(page, {
    name: 'Test User',
    age: '30',
    sex: 'male',
    weight: '75',
    heightFt: '5',
    heightIn: '10',
    activityLevel: 'moderate'
  });
}

export async function navigateToTab(page: Page, tabName: string) {
  // Handle different tab variations
  let selector = '';
  switch(tabName.toLowerCase()) {
    case 'food':
      selector = 'button:has-text("Log Food")';
      break;
    case 'food library':
      selector = 'button:has-text("Food Library")';
      break;
    case 'meals':
      selector = 'button:has-text("Meal Ideas")';
      break;
    case 'progress':
      selector = 'button:has-text("Progress")';
      break;
    case 'plan':
      selector = 'button:has-text("7-Day Plan")';
      break;
    case 'profile':
      selector = 'button:has-text("Profile")';
      break;
    default:
      selector = `button:has-text("${tabName}")`;
  }
  
  const tab = page.locator(selector).first();
  await tab.click();
  await page.waitForTimeout(1000);
}

export async function addFoodItem(page: Page, food: {
  name: string;
  calories: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}) {
  // Find food input fields
  const foodNameInput = page.locator('input[placeholder*="food" i], input[placeholder*="name" i]').filter({ hasText: '' }).first();
  const caloriesInput = page.locator('input[placeholder*="calorie" i], input[type="number"]').filter({ hasText: '' }).first();
  
  await foodNameInput.fill(food.name);
  await caloriesInput.fill(food.calories);
  
  if (food.protein) {
    const proteinInput = page.locator('input[placeholder*="protein" i]').first();
    if (await proteinInput.isVisible()) {
      await proteinInput.fill(food.protein);
    }
  }
  
  if (food.carbs) {
    const carbsInput = page.locator('input[placeholder*="carb" i]').first();
    if (await carbsInput.isVisible()) {
      await carbsInput.fill(food.carbs);
    }
  }
  
  if (food.fat) {
    const fatInput = page.locator('input[placeholder*="fat" i]').first();
    if (await fatInput.isVisible()) {
      await fatInput.fill(food.fat);
    }
  }
  
  // Click add button
  const addButton = page.getByRole('button', { name: /add|log/i }).filter({ hasNotText: 'Suggestion' }).first();
  await addButton.click();
  
  // Wait for food to be added
  await page.waitForTimeout(1000);
}

export async function checkProfileCompletion(page: Page) {
  // Check if profile completion message is shown
  const profileMessage = page.locator('text=/complete your profile/i');
  return await profileMessage.isVisible({ timeout: 1000 }).catch(() => false);
}

export async function ensureProfileIsComplete(page: Page) {
  if (await checkProfileCompletion(page)) {
    await navigateToTab(page, 'profile');
    await completeProfileSetup(page);
  }
}

export async function waitForAppToLoad(page: Page) {
  // Wait for either the onboarding or main app to be visible
  await page.waitForSelector('button:has-text("Skip"), header', { timeout: 10000 });
}