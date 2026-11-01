import { expect, test } from '@playwright/test'

const post = '/posts/robot-control-using-aws-iot-core'

test.describe('theme', () => {
  test('follows the OS setting by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('toggle persists across reloads under the same storage key', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('switch', { name: 'Toggle dark mode' })
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(await page.evaluate(() => localStorage.isDarkMode)).toBe('true')

    // Applied by the inline script before first paint, not after hydration
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('body', { state: 'attached' })
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})

test.describe('navigation', () => {
  test('back button returns through history after an in-app visit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.getByRole('link', { name: /Rovy Part 1/ }).click()
    await expect(page).toHaveURL(post)
    await page.getByRole('link', { name: 'Go back to posts' }).click()
    await expect(page).toHaveURL('/')
  })

  test('back button links home on a direct visit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(post)
    await page.getByRole('link', { name: 'Go back to posts' }).click()
    await expect(page).toHaveURL('/')
  })

  test('unknown posts return 404', async ({ page }) => {
    const response = await page.goto('/posts/does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})

test.describe('post page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  test('table of contents follows the scroll position', async ({ page }) => {
    await page.goto(post)
    const toc = page.getByRole('navigation', { name: 'Table of contents' })
    await expect(toc.locator('li.font-medium')).toHaveText('Overview')

    // Scroll the heading to the top, as following its ToC link does
    await page.evaluate(() => document.getElementById('hardware')!.scrollIntoView())
    await expect(toc.locator('li.font-medium')).toHaveText('Hardware')

    await toc.getByRole('link', { name: 'Summary' }).click()
    await expect(toc.locator('li.font-medium')).toHaveText('Summary')
  })

  test('videos load nothing until scrolled into view, then play', async ({ page }) => {
    await page.goto(post)
    const video = page.locator('video').nth(1)
    await expect(video).toHaveAttribute('poster', /\.poster\./)
    expect(await video.evaluate((v: HTMLVideoElement) => v.readyState)).toBe(0)

    await video.scrollIntoViewIfNeeded()
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState > 0))
      .toBe(true)
  })

  test('post images are square and the avatar is round', async ({ page }) => {
    await page.goto(post)
    const radius = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).borderRadius)
    expect(await radius('.prose img')).toBe('0px')
    expect(await radius('img[alt="Vince Elizaga"]')).not.toBe('0px')
  })
})
