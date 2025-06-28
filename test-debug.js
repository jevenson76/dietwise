import { chromium } from 'playwright';

async function debugTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions
  });
  
  const page = await browser.newPage();
  
  console.log('Starting debug test...\n');
  
  // Navigate to app
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'debug-1-initial.png' });
  console.log('Screenshot: debug-1-initial.png');
  
  // Try to find and click buttons
  console.log('\nLooking for buttons...');
  
  // Check for any buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i + 1}: "${text}"`);
  }
  
  // Try clicking Skip if available
  const skipButton = page.locator('button:has-text("Skip")');
  if (await skipButton.isVisible()) {
    console.log('\nClicking Skip button...');
    await skipButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-2-after-skip.png' });
    console.log('Screenshot: debug-2-after-skip.png');
  }
  
  // Check what's visible now
  const profileTab = await page.locator('text=Profile').isVisible();
  const startFreeButton = await page.locator('text=Start Free').isVisible();
  
  console.log(`\nProfile tab visible: ${profileTab}`);
  console.log(`Start Free button visible: ${startFreeButton}`);
  
  // If still in onboarding, handle the last slide
  if (startFreeButton) {
    const startBtn = page.locator('button:has-text("Start Free")');
    console.log('\nClicking Start Free...');
    await startBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-3-after-start-free.png' });
    console.log('Screenshot: debug-3-after-start-free.png');
  }
  
  // Final check
  const finalButtons = await page.locator('button').all();
  console.log(`\nFinal button count: ${finalButtons.length}`);
  
  await page.waitForTimeout(5000);
  await browser.close();
}

debugTest();