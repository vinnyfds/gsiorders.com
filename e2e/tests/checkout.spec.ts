import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('completes full purchase journey', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('add-to-cart-btn').first().click();
    await page.getByTestId('cart-icon').click();
    await page.getByTestId('proceed-to-checkout-btn').click();
    await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com\//);
  });
}); 