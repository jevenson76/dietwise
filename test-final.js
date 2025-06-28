import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('=== DietWise Automated Test Report ===\n');
  
  try {
    // Navigate to app
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(2000);
    
    // Test 1: Navigate through onboarding
    console.log('TEST 1: Onboarding Navigation');
    
    // Click through slides using Next button
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      console.log('✓ Found Next button');
      await nextButton.click();
      await page.waitForTimeout(1000);
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
    
    // On final slide, click Start Free
    const startFree = page.locator('button:has-text("Start Free")');
    if (await startFree.isVisible()) {
      console.log('✓ Found Start Free button');
      await startFree.click();
      await page.waitForTimeout(2000);
    }
    
    // Test 2: Profile tab access
    console.log('\nTEST 2: Profile Tab Access');
    const profileTab = page.locator('button:has-text("Profile")');
    
    if (await profileTab.isVisible()) {
      console.log('✓ Profile tab is visible');
      await profileTab.click();
      await page.waitForTimeout(1000);
      
      // Test 3: Profile form elements
      console.log('\nTEST 3: Profile Form Elements');
      
      const checks = [
        { selector: 'input[name="name"]', name: 'Name field' },
        { selector: 'input[name="age"]', name: 'Age field' },
        { selector: 'input[name="weight"]', name: 'Weight field' },
        { selector: 'input[type="range"]', name: 'Weight goal slider' },
        { selector: 'button:has-text("Create Account")', name: 'Create Account button' }
      ];
      
      for (const check of checks) {
        const element = page.locator(check.selector);
        if (await element.isVisible()) {
          console.log(`✓ ${check.name} is visible`);
        } else {
          console.log(`✗ ${check.name} NOT visible`);
        }
      }
      
      // Test 4: Weight input editing
      console.log('\nTEST 4: Weight Input Editing');
      const weightInput = page.locator('input[name="weight"]');
      if (await weightInput.isVisible()) {
        await weightInput.fill('150');
        await page.waitForTimeout(500);
        await weightInput.clear();
        await weightInput.fill('160');
        const value = await weightInput.inputValue();
        if (value === '160') {
          console.log('✓ Weight input is editable');
        } else {
          console.log('✗ Weight input editing failed');
        }
      }
      
      // Test 5: Navigation restriction
      console.log('\nTEST 5: Navigation Restriction');
      const logTab = page.locator('button:has-text("Log Food")');
      if (await logTab.isVisible()) {
        await logTab.click();
        await page.waitForTimeout(1000);
        
        // Check for restriction message
        const alertText = await page.textContent('body');
        if (alertText.includes('Please complete your profile')) {
          console.log('✓ Navigation restriction working');
        } else {
          console.log('✗ Navigation restriction may not be working');
        }
      }
      
      // Test 6: Export visibility
      console.log('\nTEST 6: Export Feature (Free Tier)');
      await profileTab.click(); // Go back to profile
      await page.waitForTimeout(1000);
      
      const exportSection = await page.locator('text=Export Data').isVisible();
      if (!exportSection) {
        console.log('✓ Export section hidden for free users');
      } else {
        console.log('✗ Export section visible for free users');
      }
      
      // Test 7: Create Account modal
      console.log('\nTEST 7: Create Account Modal');
      const createBtn = page.locator('button:has-text("Create Account")');
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(1500);
        
        // Check modal content
        const signUpText = await page.locator('text=Sign Up').isVisible();
        const welcomeBackText = await page.locator('text=Welcome Back').isVisible();
        
        if (signUpText && !welcomeBackText) {
          console.log('✓ Create Account shows signup form');
        } else if (welcomeBackText) {
          console.log('✗ Create Account shows login form instead');
        }
      }
      
    } else {
      console.log('✗ Profile tab not found');
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
}

runTests();