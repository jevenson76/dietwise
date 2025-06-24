import { chromium } from 'playwright';

async function testDietWise() {
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Collect page errors
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });
  
  try {
    console.log('Starting detailed DietWise tests...\n');
    
    // Test 1: Load the app
    console.log('Test 1: Loading application...');
    const response = await page.goto('http://localhost:5174', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    if (response && response.ok()) {
      console.log('✓ App loaded successfully (HTTP ' + response.status() + ')');
    } else {
      console.log('✗ App failed to load properly');
    }
    
    // Wait for initial render
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-screenshot-1-initial.png' });
    console.log('Screenshot saved: test-screenshot-1-initial.png');
    
    // Test 2: Check what's currently visible
    console.log('\nTest 2: Checking current screen...');
    
    // Check for splash screen
    const splashVisible = await page.locator('.fixed.inset-0.z-50').count() > 0;
    if (splashVisible) {
      console.log('✓ Splash/Onboarding screen detected');
      
      // Wait for it to auto-advance or click through
      await page.waitForTimeout(5000);
      
      // Check if still visible
      if (await page.locator('.fixed.inset-0.z-50').count() > 0) {
        // Try clicking through onboarding
        console.log('Clicking through onboarding...');
        for (let i = 0; i < 4; i++) {
          await page.click('body');
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Check for Start Free button
    const startFreeBtn = page.locator('button:has-text("Start Free")');
    if (await startFreeBtn.count() > 0) {
      console.log('✓ Found Start Free button');
      await startFreeBtn.first().click();
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot after onboarding
    await page.screenshot({ path: 'test-screenshot-2-after-onboarding.png' });
    console.log('Screenshot saved: test-screenshot-2-after-onboarding.png');
    
    // Test 3: Check for Profile tab
    console.log('\nTest 3: Looking for navigation tabs...');
    const profileTab = page.locator('button:has-text("Profile")');
    const tabCount = await profileTab.count();
    
    if (tabCount > 0) {
      console.log(`✓ Found ${tabCount} Profile tab(s)`);
      await profileTab.first().click();
      await page.waitForTimeout(1500);
      
      // Take screenshot of profile tab
      await page.screenshot({ path: 'test-screenshot-3-profile-tab.png' });
      console.log('Screenshot saved: test-screenshot-3-profile-tab.png');
      
      // Check for profile form elements
      console.log('\nTest 4: Checking profile form...');
      
      // Wait for form to be visible
      await page.waitForSelector('.bg-bg-card', { timeout: 5000 }).catch(() => {});
      
      const elements = {
        'Name input': 'input[name="name"]',
        'Age input': 'input[name="age"]',
        'Weight input': 'input[name="weight"]',
        'Male radio': 'input[id="male"]',
        'Female radio': 'input[id="female"]',
        'Height ft': 'input[name="height_ft"]',
        'Height in': 'input[name="height_in"]',
        'Target weight input': 'input[name="targetWeightInput"]',
        'Weight slider': 'input[type="range"]'
      };
      
      for (const [name, selector] of Object.entries(elements)) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✓ ${name} found`);
        } else {
          console.log(`✗ ${name} NOT found`);
        }
      }
      
      // Test 5: Check Create Account button
      console.log('\nTest 5: Checking account section...');
      const createAccountBtn = page.locator('button:has-text("Create Account")');
      if (await createAccountBtn.count() > 0) {
        console.log('✓ Create Account button found');
        
        // Check styling
        const bgClass = await createAccountBtn.first().getAttribute('class');
        if (bgClass && (bgClass.includes('purple') || bgClass.includes('pink') || bgClass.includes('gradient'))) {
          console.log('✓ Create Account button has gradient styling');
        }
      }
      
      // Test 6: Test weight input editing
      console.log('\nTest 6: Testing weight input...');
      const weightInput = page.locator('input[name="weight"]');
      if (await weightInput.count() > 0) {
        await weightInput.first().fill('150');
        await page.waitForTimeout(500);
        const value1 = await weightInput.first().inputValue();
        
        await weightInput.first().fill('160');
        await page.waitForTimeout(500);
        const value2 = await weightInput.first().inputValue();
        
        if (value1 === '150' && value2 === '160') {
          console.log('✓ Weight input is editable');
        } else {
          console.log('✗ Weight input editing issue');
        }
      }
    } else {
      console.log('✗ Profile tab not found');
    }
    
    // Test 7: Check for errors
    console.log('\nTest 7: Checking for JavaScript errors...');
    const relevantErrors = errors.filter(error => 
      !error.includes('ERR_CONNECTION_REFUSED') && // Backend not running
      !error.includes('Failed to fetch') &&
      !error.includes('Download the React DevTools')
    );
    
    if (relevantErrors.length === 0) {
      console.log('✓ No critical JavaScript errors');
    } else {
      console.log(`✗ Found ${relevantErrors.length} JavaScript errors:`);
      relevantErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-screenshot-4-final.png' });
    console.log('\nScreenshot saved: test-screenshot-4-final.png');
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${errors.length}`);
    console.log(`Critical errors: ${relevantErrors.length}`);
    
  } catch (error) {
    console.error('\nTest error:', error.message);
    await page.screenshot({ path: 'test-error-screenshot.png' });
    console.log('Error screenshot saved: test-error-screenshot.png');
  } finally {
    // Keep browser open for 5 seconds to see final state
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run the tests
testDietWise().catch(console.error);