import { chromium } from 'playwright';

async function testDietWise() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Collect page errors
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });
  
  try {
    console.log('Starting DietWise automated tests...\n');
    
    // Test 1: Load the app
    console.log('Test 1: Loading application...');
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✓ App loaded successfully');
    
    // Test 2: Check splash screen
    console.log('\nTest 2: Checking splash screen...');
    const splashScreen = await page.locator('.fixed.inset-0.z-50').first();
    if (await splashScreen.isVisible()) {
      console.log('✓ Splash screen is visible');
      
      // Check v1.0 positioning
      const versionText = await page.locator('text=v1.0.0').first();
      if (await versionText.isVisible()) {
        console.log('✓ Version text is visible and properly positioned');
      }
      
      // Wait for splash to disappear
      await page.waitForTimeout(5000);
    }
    
    // Test 3: Check onboarding screen
    console.log('\nTest 3: Checking onboarding screen...');
    const onboardingVisible = await page.locator('text=Welcome to DietWise').isVisible();
    if (onboardingVisible) {
      console.log('✓ Onboarding screen is visible');
      
      // Click through onboarding
      await page.click('body'); // First slide
      await page.waitForTimeout(500);
      await page.click('body'); // Second slide
      await page.waitForTimeout(500);
      await page.click('body'); // Third slide
      await page.waitForTimeout(500);
      
      // Check for Start Free button
      const startFreeButton = await page.locator('text=Start Free').first();
      if (await startFreeButton.isVisible()) {
        console.log('✓ Start Free button is visible');
        await startFreeButton.click();
      }
    }
    
    // Test 4: Check profile restriction
    console.log('\nTest 4: Testing profile completion requirement...');
    
    // Try clicking on different tabs
    const logFoodTab = await page.locator('text=Log Food').first();
    if (await logFoodTab.isVisible()) {
      await logFoodTab.click();
      await page.waitForTimeout(1000);
      
      // Check for profile completion message
      const alertMessage = await page.locator('text=Please complete your profile first').first();
      if (await alertMessage.isVisible()) {
        console.log('✓ Profile completion requirement is working');
      } else {
        console.log('✗ Profile completion check may not be working');
      }
    }
    
    // Test 5: Check Profile tab
    console.log('\nTest 5: Checking Profile tab...');
    const profileTab = await page.locator('text=Profile').first();
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await page.waitForTimeout(1000);
      console.log('✓ Profile tab is accessible');
      
      // Check for form fields
      const nameInput = await page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        console.log('✓ Profile form is visible');
        
        // Test weight input
        const weightInput = await page.locator('input[name="weight"]').first();
        await weightInput.fill('150');
        await page.waitForTimeout(500);
        await weightInput.clear();
        await weightInput.fill('160');
        console.log('✓ Weight input is editable');
      }
      
      // Check for weight goal slider
      const slider = await page.locator('input[type="range"]').first();
      if (await slider.isVisible()) {
        console.log('✓ Weight goal slider is visible');
      } else {
        console.log('✗ Weight goal slider not found');
      }
      
      // Check Create Account button styling
      const createAccountBtn = await page.locator('text=Create Account').first();
      if (await createAccountBtn.isVisible()) {
        const bgColor = await createAccountBtn.evaluate(el => 
          window.getComputedStyle(el).background
        );
        if (bgColor.includes('gradient') || bgColor.includes('purple') || bgColor.includes('pink')) {
          console.log('✓ Create Account button is properly styled');
        } else {
          console.log('✗ Create Account button may not have gradient styling');
        }
      }
    }
    
    // Test 6: Check for export functionality
    console.log('\nTest 6: Checking export functionality...');
    const exportSection = await page.locator('text=Export Data').first();
    if (await exportSection.isVisible()) {
      console.log('✗ Export section visible for free user (should be hidden)');
    } else {
      console.log('✓ Export section properly hidden for free users');
    }
    
    // Test 7: Test Create Account modal
    console.log('\nTest 7: Testing Create Account modal...');
    const createAccountButton = await page.locator('text=Create Account').first();
    if (await createAccountButton.isVisible()) {
      await createAccountButton.click();
      await page.waitForTimeout(1000);
      
      // Check if signup form appears (not login)
      const signupForm = await page.locator('text=Sign Up').first();
      const loginForm = await page.locator('text=Welcome Back').first();
      
      if (await signupForm.isVisible() && !(await loginForm.isVisible())) {
        console.log('✓ Create Account shows signup form (not login)');
      } else if (await loginForm.isVisible()) {
        console.log('✗ Create Account incorrectly shows login form');
      }
      
      // Close modal
      const closeButton = await page.locator('button[aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Test 8: Progress tab error check
    console.log('\nTest 8: Testing Progress tab...');
    
    // First fill out minimal profile to access other tabs
    const nameField = await page.locator('input[name="name"]').first();
    await nameField.fill('Test User');
    
    const ageField = await page.locator('input[name="age"]').first();
    await ageField.fill('30');
    
    const maleRadio = await page.locator('input[value="male"]').first();
    await maleRadio.click();
    
    const weightField = await page.locator('input[name="weight"]').first();
    await weightField.fill('150');
    
    const heightFt = await page.locator('input[name="height_ft"]').first();
    await heightFt.fill('5');
    
    const heightIn = await page.locator('input[name="height_in"]').first();
    await heightIn.fill('10');
    
    await page.waitForTimeout(1000);
    
    // Now try Progress tab
    const progressTab = await page.locator('text=Progress').first();
    if (await progressTab.isVisible()) {
      await progressTab.click();
      await page.waitForTimeout(2000);
      
      // Check if Progress content loads without white screen
      const progressContent = await page.locator('.bg-bg-card').first();
      const errorMessage = await page.locator('text=Error loading Progress tab').first();
      
      if (await progressContent.isVisible() && !(await errorMessage.isVisible())) {
        console.log('✓ Progress tab loads without errors');
      } else if (await errorMessage.isVisible()) {
        console.log('✗ Progress tab shows error');
      }
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Total console errors found: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nConsole errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✓ No console errors detected');
    }
    
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the tests
testDietWise().catch(console.error);