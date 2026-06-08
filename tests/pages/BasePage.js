class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path);
  }

  async click(selector) {
    await this.page.locator(selector).click();
  }

  async fill(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  async getText(selector) {
    return await this.page.locator(selector).innerText();
  }

  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  async waitForVisible(selector, timeout) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  async waitForURL(urlPattern) {
    await this.page.waitForURL(urlPattern);
  }

  async getCount(selector) {
    return await this.page.locator(selector).count();
  }

  async selectOption(selector, value) {
    await this.page.locator(selector).selectOption(value);
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }
}

module.exports = BasePage;
