import { chromium } from 'playwright';

async function checkFormatting() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  console.log('=== DietWise Formatting Check ===\n');
  
  try {
    // Navigate to app
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    
    // 1. Check Splash Screen
    console.log('1. SPLASH SCREEN CHECK:');
    await page.screenshot({ path: 'format-1-splash.png', fullPage: true });
    
    // Check v1.0.0 position
    const versionElement = page.locator('text=v1.0.0');
    if (await versionElement.isVisible()) {
      const versionBox = await versionElement.boundingBox();
      console.log(`   ✓ Version position - Bottom: ${versionBox?.y}, Left: ${versionBox?.x}`);
    }
    
    // Wait for splash to complete
    await page.waitForTimeout(5000);
    
    // 2. Check Onboarding Screens
    console.log('\n2. ONBOARDING SCREENS CHECK:');
    
    // Check if we're on onboarding
    const onboardingTitle = page.locator('text=Welcome to DietWise');
    if (await onboardingTitle.isVisible()) {
      await page.screenshot({ path: 'format-2-onboarding-1.png', fullPage: true });
      
      // Navigate through onboarding
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'format-3-onboarding-2.png', fullPage: true });
      
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'format-4-onboarding-3.png', fullPage: true });
      
      // Click Start Free if visible
      const startFree = page.locator('button:has-text("Start Free")');
      if (await startFree.isVisible()) {
        await startFree.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Skip onboarding if needed
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. Check Main App Layout
    console.log('\n3. MAIN APP LAYOUT:');
    await page.screenshot({ path: 'format-5-main-app.png', fullPage: true });
    
    // Check for Profile tab
    const profileTab = page.locator('button:has-text("Profile")');
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await page.waitForTimeout(1500);
      
      // 4. Profile Tab Formatting
      console.log('\n4. PROFILE TAB FORMATTING:');
      await page.screenshot({ path: 'format-6-profile-tab.png', fullPage: true });
      
      // Check specific elements
      const checks = [
        { selector: '.bg-bg-card', name: 'Card containers' },
        { selector: 'input[type="text"], input[type="number"]', name: 'Input fields' },
        { selector: 'button', name: 'Buttons' },
        { selector: '.space-y-4, .space-y-6', name: 'Vertical spacing' }
      ];
      
      for (const check of checks) {
        const elements = await page.locator(check.selector).count();
        if (elements > 0) {
          console.log(`   ✓ ${check.name}: ${elements} found`);
          
          // Get first element's computed styles
          const firstElement = page.locator(check.selector).first();
          const styles = await firstElement.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              padding: computed.padding,
              margin: computed.margin,
              border: computed.border,
              borderRadius: computed.borderRadius
            };
          });
          console.log(`     Styles: ${JSON.stringify(styles)}`);
        }
      }
      
      // 5. Check Weight Goal Section
      console.log('\n5. WEIGHT GOAL SECTION:');
      
      // Scroll to weight goal
      const weightGoalSection = page.locator('text=Your Weight Goal');
      if (await weightGoalSection.isVisible()) {
        await weightGoalSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'format-7-weight-goal.png', fullPage: false });
        
        // Check slider
        const slider = page.locator('input[type="range"]');
        if (await slider.isVisible()) {
          const sliderBox = await slider.boundingBox();
          console.log(`   ✓ Slider dimensions - Width: ${sliderBox?.width}, Height: ${sliderBox?.height}`);
        }
      }
      
      // 6. Check Create Account Button
      console.log('\n6. CREATE ACCOUNT BUTTON:');
      const createAccountBtn = page.locator('button:has-text("Create Account")');
      if (await createAccountBtn.isVisible()) {
        await createAccountBtn.scrollIntoViewIfNeeded();
        const btnBox = await createAccountBtn.boundingBox();
        console.log(`   ✓ Button position - Y: ${btnBox?.y}`);
        
        const btnStyles = await createAccountBtn.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            background: computed.background,
            padding: computed.padding,
            marginTop: computed.marginTop
          };
        });
        console.log(`   ✓ Button styles: ${JSON.stringify(btnStyles)}`);
        
        await page.screenshot({ path: 'format-8-account-section.png', fullPage: false });
      }
      
      // 7. Check spacing between sections
      console.log('\n7. SECTION SPACING:');
      const sections = await page.locator('.bg-bg-card').all();
      console.log(`   Found ${sections.length} card sections`);
      
      if (sections.length > 1) {
        for (let i = 0; i < Math.min(3, sections.length); i++) {
          const box = await sections[i].boundingBox();
          console.log(`   Section ${i + 1} - Top: ${box?.y}, Height: ${box?.height}`);
        }
      }
      
      // 8. Mobile Responsive Check
      console.log('\n8. MOBILE RESPONSIVE CHECK:');
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'format-9-mobile-view.png', fullPage: true });
      
      // Check if elements adjust properly
      const mobileInputs = await page.locator('input').first();
      if (await mobileInputs.isVisible()) {
        const mobileBox = await mobileInputs.boundingBox();
        console.log(`   ✓ Mobile input width: ${mobileBox?.width}`);
      }
      
    } else {
      console.log('   ✗ Could not access Profile tab');
    }
    
    console.log('\n=== Formatting Check Complete ===');
    console.log('\nScreenshots saved:');
    console.log('- format-1-splash.png');
    console.log('- format-2-onboarding-1.png');
    console.log('- format-3-onboarding-2.png');
    console.log('- format-4-onboarding-3.png');
    console.log('- format-5-main-app.png');
    console.log('- format-6-profile-tab.png');
    console.log('- format-7-weight-goal.png');
    console.log('- format-8-account-section.png');
    console.log('- format-9-mobile-view.png');
    
  } catch (error) {
    console.error('Error during formatting check:', error.message);
    await page.screenshot({ path: 'format-error.png' });
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
}

checkFormatting();