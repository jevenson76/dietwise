import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DietWise Accessibility Tests', () => {
  test('home page passes accessibility checks', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works throughout app', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test form navigation
    await page.keyboard.press('Tab');
    await page.keyboard.type('25');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space'); // Select dropdown
    
    // Test modal accessibility
    await page.click('button:has-text("Help")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toBeFocused();
    
    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('screen reader announcements work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check ARIA labels
    const scanButton = page.locator('button:has-text("Scan Barcode")');
    await expect(scanButton).toHaveAttribute('aria-label', /scan.*barcode/i);
    
    // Check live regions for dynamic content
    await page.fill('input[name="weight"]', '75');
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/calculated/i);
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="main-content"]')
      .analyze();
    
    const colorContrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toHaveLength(0);
  });

  test('forms have proper labels and error messages', async ({ page }) => {
    await page.goto('/');
    
    // Check all inputs have labels
    const inputs = await page.locator('input:not([type="hidden"])').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
    
    // Test error message association
    await page.fill('input[name="age"]', '200');
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('id');
    
    const ageInput = page.locator('input[name="age"]');
    const errorId = await errorMessage.getAttribute('id');
    await expect(ageInput).toHaveAttribute('aria-describedby', errorId!);
  });
});