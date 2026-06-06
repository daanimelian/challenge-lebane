const { defineConfig, devices } = require('@playwright/test');
const env = require('./environments');

module.exports = defineConfig({
  testDir: '../tests/specs',
  outputDir: `../${env.reportDir}/artifacts`,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: env.retries,
  workers: process.env.CI ? 1 : 1,
  timeout: env.timeout,

  expect: {
    timeout: env.actionTimeout,
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: `../${env.reportDir}/html`,
        open: 'never',
      },
    ],
    [
      'json',
      {
        outputFile: `../${env.reportDir}/json/results.json`,
      },
    ],
  ],

  use: {
    baseURL: env.baseURL,
    headless: env.headless,
    slowMo: env.slowMo,
    navigationTimeout: env.navigationTimeout,
    actionTimeout: env.actionTimeout,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
