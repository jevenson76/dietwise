import { test, expect } from '@playwright/test';

test('capture app screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000); // Wait for app to fully load
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'dietwise-app-screenshot.png',
    fullPage: true 
  });
  
  // Log what inputs are available
  const inputs = await page.locator('input:visible').all();
  console.log(`Found ${inputs.length} visible inputs:`);
  
  for (const input of inputs) {
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`  - name="${name}" id="${id}" placeholder="${placeholder}"`);
  }
  
  // Log what buttons are available
  const buttons = await page.locator('button:visible').all();
  console.log(`\nFound ${buttons.length} visible buttons:`);
  
  for (const button of buttons) {
    const text = await button.textContent();
    console.log(`  - "${text?.trim()}"`);
  }
  
  expect(true).toBe(true); // Just to make test pass
});