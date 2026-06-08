const BasePage = require('./BasePage');

// TODO: update selectors after inspecting https://tst.lebane.app
const SELECTORS = {
  priceListContainer: '[data-testid="price-list"], .price-list, [class*="price-list"]',
  priceListByName: (name) => `[data-testid="price-list"]:has-text("${name}"), .price-list:has-text("${name}")`,
  priceListItem: '[data-testid="price-list-item"], .price-list-item',
  priceListCount: '[data-testid="price-list-item"], .price-list-item',
  unitPriceInput: (unitName) => `[data-testid="unit-item"]:has-text("${unitName}") input[name="price"], .unit-item:has-text("${unitName}") .price-input`,
  savePriceButton: '[data-testid="save-price-btn"], button:has-text("Guardar"), button[type="submit"]',
  unitPriceDisplay: (unitName) => `[data-testid="unit-item"]:has-text("${unitName}") [data-testid="unit-price"], .unit-item:has-text("${unitName}") .price`,
};

class PriceListPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async priceListExists(name) {
    return await this.isVisible(SELECTORS.priceListByName(name));
  }

  async getPriceListCount() {
    return await this.getCount(SELECTORS.priceListCount);
  }

  async modifyPrice(unitName, newPrice) {
    const priceInput = SELECTORS.unitPriceInput(unitName);
    await this.waitForVisible(priceInput);
    await this.fill(priceInput, newPrice);
    await this.click(SELECTORS.savePriceButton);
    await this.page.waitForLoadState('networkidle');
  }

  async getUnitPrice(unitName) {
    return await this.getText(SELECTORS.unitPriceDisplay(unitName));
  }

  async verifyUnitInPriceList(priceListName, unitName) {
    const listLocator = this.page.locator(SELECTORS.priceListByName(priceListName));
    return await listLocator.locator(`:has-text("${unitName}")`).isVisible();
  }

  async waitForPriceListGone(name) {
    await this.page.locator(SELECTORS.priceListByName(name)).waitFor({ state: 'hidden' });
  }
}

module.exports = PriceListPage;
