import { expect, test } from '@playwright/test'

test('home page renders without console errors', async ({ page }) => {
  const errors: Array<string> = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'A career, mapped.' }),
  ).toBeVisible()

  expect(errors).toEqual([])
})

test('map renders a canvas with visible size', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('.cv-map canvas')
  await expect(canvas).toBeVisible({ timeout: 15000 })

  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(100)
  expect(box!.height).toBeGreaterThan(100)
})

test('capture screenshots of the map for visual inspection', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })
  // Give tiles time to download and render.
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'test-results/map-top.png' })

  await page.mouse.wheel(0, 2500)
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'test-results/map-scrolled.png' })
})

test('scroll snaps to a location section', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  // Land awkwardly close to a section boundary; proximity snap should settle
  // the section center on the viewport center.
  const viewportHeight = page.viewportSize()!.height
  await page.mouse.wheel(0, viewportHeight * 1.15)
  await page.waitForTimeout(1500)

  // After a snap, some section's center should coincide with the viewport
  // center. Distances are viewport-relative, so no scroll math is needed.
  const distances = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.story-intro, .location-section'),
    ).map((section) => {
      const rect = section.getBoundingClientRect()
      return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2)
    }),
  )
  expect(Math.min(...distances)).toBeLessThan(5)
})

test('scrolling moves the map camera between locations', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  const screenshotBefore = await page.locator('.story-map').screenshot()
  await page.mouse.wheel(0, 3000)
  await page.waitForTimeout(500)
  const screenshotAfter = await page.locator('.story-map').screenshot()

  expect(screenshotBefore.equals(screenshotAfter)).toBe(false)
})
