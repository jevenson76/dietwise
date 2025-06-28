import { Page } from '@playwright/test';

export async function handleOnboarding(page: Page) {
  try {
    // Wait for either the onboarding screen or the main app
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check if Skip button is visible (indicates onboarding is shown)
    const skipButton = page.locator('button:has-text("Skip")');
    const skipVisible = await skipButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (skipVisible) {
      await skipButton.click();
      console.log('✅ Skipped onboarding');
      // Wait for onboarding to disappear
      await page.waitForTimeout(1000);
    } else {
      console.log('ℹ️ No onboarding screen - app ready');
    }
    
    // Ensure we're on the main app
    await page.waitForSelector('nav button', { timeout: 5000 });
  } catch (error) {
    console.error('⚠️ Error handling onboarding:', error.message);
    // Continue anyway - app might be in a different state
  }
}

export async function navigateToTab(page: Page, tabName: string) {
  const tabButton = page.locator(`nav button:has-text("${tabName}")`);
  await tabButton.click();
  await page.waitForTimeout(500); // Brief wait for tab content to load
}