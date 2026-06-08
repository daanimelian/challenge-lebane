const BasePage = require('./BasePage');

class PriceListPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async waitForPriceList() {
    await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).waitFor({ state: 'visible' });
  }

  async priceListExists() {
    return await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).isVisible();
  }

  async getPriceListCount() {
    return await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).count();
  }

  async getPriceListName() {
    return await this.page.locator('text=/Lista precios/').first().innerText();
  }

  async navigateToUnitsTab() {
    await this.page.getByRole('tab', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async modifyPrice(inputName, newPrice) {
    const input = this.page.locator(`input[name="${inputName}"]`);
    await input.click({ clickCount: 3 });
    await input.fill(String(newPrice));
    await this.page.getByRole('button', { name: 'Guardar' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPriceListGone() {
    await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).waitFor({ state: 'hidden' });
  }
}

module.exports = PriceListPage;
