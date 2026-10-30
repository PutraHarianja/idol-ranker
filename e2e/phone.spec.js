import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'idol-ranker:v1:default'
const VIEWS = ['Pick', 'My ranking', 'Photo credits']

// A few saved picks so My ranking has something to show. Written once, so Start over sticks.
test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    if (localStorage.getItem(key)) return
    const pair = (winnerId, loserId) => ({ winnerId, loserId, timestamp: 1 })
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        comparisons: [
          pair('blackpink-jisoo', 'blackpink-jennie'),
          pair('blackpink-jennie', 'blackpink-rose'),
          pair('blackpink-jisoo', 'blackpink-rose'),
        ],
      }),
    )
  }, STORAGE_KEY)
})

async function open(page, view) {
  await page.goto('')
  if (view === 'My ranking') await page.getByRole('button', { name: 'My ranking' }).click()
  if (view === 'Photo credits') await page.getByRole('button', { name: 'Photo credits' }).click()
  await expect(page).toHaveTitle(new RegExp(`^${view}`))
}

async function expectNoHorizontalScroll(page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

for (const view of VIEWS) {
  test.describe(view, () => {
    test('header is one line', async ({ page }) => {
      await open(page, view)
      const boxes = await Promise.all(
        ['.title', '.tabs', '.share'].map((selector) => page.locator(selector).boundingBox()),
      )
      const centers = boxes.map((box) => box.y + box.height / 2)
      // Logo, tabs and Share sit on one row: their vertical centers match.
      expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(8)
    })

    test('no horizontal scroll', async ({ page }) => {
      await open(page, view)
      await expectNoHorizontalScroll(page)
    })
  })
}

test.describe('Start over', () => {
  test('confirmation fits and buttons are at least 44px tall', async ({ page }) => {
    await open(page, 'My ranking')
    await page.getByRole('button', { name: 'Start over' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Confirm start over' })
    await expect(dialog).toBeVisible()
    const yes = dialog.getByRole('button', { name: 'Yes, start over' })
    const cancel = dialog.getByRole('button', { name: 'Cancel' })
    await expect(dialog).toBeInViewport({ ratio: 1 })
    for (const button of [yes, cancel]) {
      await expect(button).toBeInViewport({ ratio: 1 })
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44)
    }
    await expectNoHorizontalScroll(page)
  })

  test('keyboard focus moves on at each step (#66)', async ({ page }) => {
    await open(page, 'My ranking')
    await page.getByRole('button', { name: 'Start over' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Start over' })).toBeFocused()

    await page.keyboard.press('Enter')
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Yes, start over' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Pick', exact: true })).toBeFocused()
  })
})

test('Share falls back to the link as text when the clipboard is denied', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error))
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    })
  })
  await open(page, 'Pick')
  await page.getByRole('button', { name: 'Share' }).click()
  await expect(page.getByText("Couldn't copy. Here's the link:")).toBeVisible()
  await expect(page.locator('.share-note__link')).toContainText('http')
  await expectNoHorizontalScroll(page)
  expect(errors).toEqual([])
})
