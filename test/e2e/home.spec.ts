import { expect, test } from '@playwright/test'

test('home page renders the naoki heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'naoki' })).toBeVisible()
})
