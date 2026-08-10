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
    page.getByRole('heading', { name: "Hi, I'm Jurre." }),
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

test('explore mode enables dragging and marker popups', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })
  await page.waitForTimeout(2000)

  await page.getByRole('button', { name: 'Explore map' }).click()
  await expect(page.locator('.story-sections')).toBeHidden()
  // Wait for the ease to the overview to finish.
  await page.waitForTimeout(1500)

  // Dragging should pan the map.
  const before = await page.locator('.story-map').screenshot()
  await page.mouse.move(640, 400)
  await page.mouse.down()
  await page.mouse.move(340, 400, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(1000)
  const after = await page.locator('.story-map').screenshot()
  expect(before.equals(after)).toBe(false)

  // Clicking a marker should open the location's info card. Use the last
  // marker in DOM order: markers can overlap at the overview zoom, and the
  // last-added marker is the one painted on top.
  await page.locator('.maplibregl-marker').last().click()
  await expect(page.locator('.explore-card .location-card')).toBeVisible()

  // The card closes via its close button.
  await page.locator('.card-close').click()
  await expect(page.locator('.explore-card')).toBeHidden()

  // Toggling back restores the story sections.
  await page.getByRole('button', { name: 'Back to story' }).click()
  await expect(page.locator('.story-sections')).toBeVisible()
})

test('leaving explore mode resumes the story where it left off', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  // Scroll partway into the story, then round-trip through explore mode.
  await page.mouse.wheel(0, 2000)
  await page.waitForTimeout(1500)
  const scrollBefore = await page.evaluate(() => window.scrollY)
  expect(scrollBefore).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Explore map' }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Back to story' }).click()
  await page.waitForTimeout(300)

  const scrollAfter = await page.evaluate(() => window.scrollY)
  expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(5)
})

test('progress bar stops jump to their section', async ({ page }) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  await expect(page.locator('.story-progress')).toBeVisible()
  await page.getByRole('button', { name: 'Go to Groningen' }).click()
  await page.waitForTimeout(1500)

  await expect(
    page.getByRole('heading', { name: 'Groningen' }),
  ).toBeInViewport()

  // The bar is story-mode chrome; explore mode hides it.
  await page.getByRole('button', { name: 'Explore map' }).click()
  await expect(page.locator('.story-progress')).toBeHidden()
})

test('dragging the map in story mode nudges the explore toggle', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('.cv-map canvas').waitFor({ timeout: 15000 })

  // Drag on an exposed map area, away from the intro card in the center.
  await page.mouse.move(200, 400)
  await page.mouse.down()
  await page.mouse.move(280, 440, { steps: 5 })
  await page.mouse.up()

  await expect(page.getByRole('button', { name: 'Explore map' })).toHaveClass(
    /is-nudging/,
  )
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
