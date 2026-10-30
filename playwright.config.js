import { defineConfig } from '@playwright/test'

const PORT = 4173

// Phone-width smoke tests (#60) against the production build, in light and dark.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    baseURL: `http://localhost:${PORT}/idol-ranker/`,
    viewport: { width: 360, height: 740 },
    // shortcut: CI uses the Chromium that `playwright install` downloads; locally set
    // E2E_CHANNEL=chrome to use the installed Chrome instead of downloading a browser.
    channel: process.env.E2E_CHANNEL || undefined,
  },
  projects: [
    { name: 'light', use: { colorScheme: 'light' } },
    { name: 'dark', use: { colorScheme: 'dark' } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/idol-ranker/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
