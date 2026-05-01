import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home page has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})
