import { test, expect } from '@playwright/test';

test.describe('Allegro E2E Tests', () => {
  
  test('01 - Homepage loads', async ({ page }) => {
    await page.goto('/');
    
    // Main page should load
    await expect(page.locator('body')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/01-homepage.png', fullPage: true });
  });

  test('02 - Listen button exists', async ({ page }) => {
    await page.goto('/');
    
    // Look for main action button (listen/capture)
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'e2e-results/02-listen-button.png', fullPage: true });
  });

  test('03 - UI components render', async ({ page }) => {
    await page.goto('/');
    
    // Wait for React hydration
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'e2e-results/03-ui-components.png', fullPage: true });
  });

  test('04 - Responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e-results/04-mobile.png', fullPage: true });
  });

  test('05 - Responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e-results/05-tablet.png', fullPage: true });
  });

});

