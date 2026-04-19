import { expect, test } from '@playwright/test'

test('home page renders hero heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Hello Nuxt' })).toBeVisible()
})
