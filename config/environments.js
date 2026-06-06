require('dotenv').config();

const environments = {
  tst: {
    baseURL: 'https://tst.lebane.app',
    timeout: 30000,
    retries: 1,
  },
  prod: {
    baseURL: 'https://lebane.app',
    timeout: 45000,
    retries: 2,
  },
};

const ENV = process.env.ENV || 'tst';

module.exports = {
  ...environments[ENV],
  baseURL: process.env.BASE_URL || environments[ENV].baseURL,
  timeout: parseInt(process.env.TIMEOUT) || environments[ENV].timeout,
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
  actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 10000,
  retries: parseInt(process.env.RETRIES) || environments[ENV].retries,
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  credentials: {
    email: process.env.USER_EMAIL || '',
    password: process.env.USER_PASSWORD || '',
  },
  reportDir: process.env.REPORT_DIR || 'reports',
};
