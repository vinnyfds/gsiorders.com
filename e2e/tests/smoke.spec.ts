import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/GSI Orders/);
    
    // Check for key elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have working health check endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
    expect(healthData.timestamp).toBeDefined();
    expect(healthData.environment).toBeDefined();
  });

  test('should load products page', async ({ page }) => {
    await page.goto('/products');
    
    // Check page loads
    await expect(page).toHaveTitle(/Products/);
    
    // Check for product grid (may be empty in test environment)
    await expect(page.locator('[data-testid="products-grid"]')).toBeVisible();
    
    // Check for no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have working API endpoints', async ({ request }) => {
    // Test products API
    const productsResponse = await request.get('/api/products');
    expect(productsResponse.ok()).toBeTruthy();
    
    const productsData = await productsResponse.json();
    expect(Array.isArray(productsData.products)).toBeTruthy();
    
    // Test brands API
    const brandsResponse = await request.get('/api/brands');
    expect(brandsResponse.ok()).toBeTruthy();
    
    const brandsData = await brandsResponse.json();
    expect(Array.isArray(brandsData.brands)).toBeTruthy();
  });
}); 