require('dotenv').config();

module.exports = {
  baseURL: process.env.BASE_URL || 'https://tst.lebane.app',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
  actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 10000,
  retries: parseInt(process.env.RETRIES) || 1,
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  credentials: {
    email: process.env.USER_EMAIL || '',
    password: process.env.USER_PASSWORD || '',
  },
  reportDir: process.env.REPORT_DIR || 'reports',
};
