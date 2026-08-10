import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  const overflow = await page.evaluate(() => {
    const root = document.scrollingElement!
    return root.scrollWidth - root.clientWidth
  })
  expect(overflow).toBe(0)
})

test('mobile cards stay inside the viewport', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'test-results/mobile-top.png' })

  // Scroll to the last (content-heaviest) location section.
  await page.locator('.location-section').last().scrollIntoViewIfNeeded()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'test-results/mobile-last-card.png' })

  const card = page.locator('.location-card').last()
  await expect(card).toBeVisible()
  const box = (await card.boundingBox())!
  const viewport = page.viewportSize()!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
})
