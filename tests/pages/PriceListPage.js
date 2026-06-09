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

  async openFirstPriceList() {
    await this.navigateToGeneralTab();
  }

  async navigateToUnitsTab() {
    await this.page.getByRole('tab', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
    // The table data loads asynchronously after the tab switch.
    // Wait for the skeleton/loading indicator inside the tabpanel to disappear.
    await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  async navigateToGeneralTab() {
    await this.page.getByRole('tab', { name: 'General' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Price editing lives behind an "Editar" button on the General tab.
  // After saving, the form closes and the card shows the new value.
  async modifyPrice(inputName, newPrice) {
    await this.navigateToGeneralTab();
    await this.page.getByRole('button', { name: 'Editar' }).click();
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
