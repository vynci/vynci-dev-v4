import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// WCAG 2.1 AA checks on every page type, in both themes, at a width that shows the ToC
const pages = ['/', '/about', '/posts/robot-camera-video-stream-using-aws-kvs']

for (const colorScheme of ['light', 'dark'] as const) {
  for (const path of pages) {
    test(`${path} has no WCAG AA violations (${colorScheme})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.emulateMedia({ colorScheme })
      await page.goto(path)
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const summary = violations.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 5)
            .join(' | ')}`
      )
      expect(summary).toEqual([])
    })
  }
}
