import { test, expect } from '@playwright/test';

let orderId: string;

test('create order', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'qa@example.com');
  await page.fill('#password', 'secret123');
  await page.click('div.form > div:nth-child(3) > button');
  await page.waitForTimeout(3000);
  await page.click('text=New order');
  await page.fill('input[name=sku]', 'SKU-1');
  await page.click('button.css-1x2y3');
  expect(await page.locator('.toast').isVisible()).toBe(true);
  orderId = (await page.locator('.order-id').textContent())!;
});

test('order appears in list', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.locator(`text=${orderId}`)).toBeTruthy();
});
