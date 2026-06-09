const logger = require('./logger');

async function retryAction(action, { retries = 3, delay = 1000, label = 'action' } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (error) {
      logger.warn(`${label} failed (attempt ${attempt}/${retries})`, { error: error.message });
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function uniqueName(prefix = 'Test') {
  return `${prefix} ${Date.now().toString().slice(-6)}`;
}

function formatPrice(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

async function waitForToast(page, text, timeout = 5000) {
  const toast = page.locator(`[role="alert"]:has-text("${text}"), .toast:has-text("${text}"), .notification:has-text("${text}")`);
  await toast.waitFor({ state: 'visible', timeout });
  return toast;
}

async function clearAndFill(page, selector, value) {
  await page.locator(selector).click({ clickCount: 3 });
  await page.locator(selector).fill(value);
}

module.exports = {
  retryAction,
  uniqueName,
  formatPrice,
  waitForToast,
  clearAndFill,
};
