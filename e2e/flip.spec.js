import { expect, test } from '@playwright/test'

// The flip-in restarts on every pick, tie included, not only the first one after a refresh (#89).
test('the flip-in plays after every pick and tie', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('.pair')
  await page.evaluate(() => {
    window.__flipIns = 0
    document.addEventListener(
      'animationstart',
      (event) => {
        if (event.animationName.includes('flip-in')) window.__flipIns++
      },
      true,
    )
  })
  const answers = [
    () => page.locator('.card').first().click(),
    () => page.locator('.card').nth(1).click(),
    () => page.getByRole('button', { name: /too close/i }).click(),
    () => page.locator('.card').first().click(),
  ]
  for (const [i, answer] of answers.entries()) {
    await answer()
    // Two cards flip in per answer; waiting for them also waits out the flash before the next one.
    await expect.poll(() => page.evaluate(() => window.__flipIns)).toBe((i + 1) * 2)
  }
})
