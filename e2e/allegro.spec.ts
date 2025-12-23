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

  test('06 - Play Along page loads', async ({ page }) => {
    await page.goto('/play-along');
    
    // Check key elements are present (default is now Song Mode - Phase 6C)
    await expect(page.getByRole('heading', { name: 'Play Along Mode' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Song Matcher' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Song Matching' })).toBeVisible();
    
    // Check all three mode tabs exist
    await expect(page.getByRole('button', { name: /Song Mode/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Chord Mode/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Key Mode/ })).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/06-play-along-song.png', fullPage: true });
    
    // Switch to Chord Mode and verify
    await page.getByRole('button', { name: /Chord Mode/ }).click();
    await expect(page.getByRole('heading', { name: 'Chord Detection' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Chord Detection' })).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/06-play-along-chord.png', fullPage: true });
    
    // Switch to Key Mode and verify
    await page.getByRole('button', { name: /Key Mode/ }).click();
    await expect(page.getByRole('heading', { name: 'Key Detection' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Key Detection' })).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/06-play-along-key.png', fullPage: true });
  });

  test('07 - Practice Mode page loads', async ({ page }) => {
    await page.goto('/practice');
    
    // Check key elements are present (Phase 7 - Background Listening)
    await expect(page.getByRole('heading', { name: '🎧 Practice Mode' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Background Listening' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Background Listening' })).toBeVisible();
    
    // Check how-it-works section
    await expect(page.getByRole('heading', { name: 'How Practice Mode Works' })).toBeVisible();
    
    // Check navigation links
    await expect(page.getByRole('link', { name: /Play Along Mode/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Song Recognition/ })).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/07-practice-mode.png', fullPage: true });
  });

});

