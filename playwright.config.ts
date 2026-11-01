import { defineConfig } from '@playwright/test'

// Runs against the production build: `pnpm build && pnpm e2e`
export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:3457',
    // The locally installed Google Chrome; no browser download needed
    channel: 'chrome',
    colorScheme: 'light'
  },
  webServer: {
    command: 'pnpm start -p 3457',
    url: 'http://localhost:3457',
    reuseExistingServer: true
  }
})
