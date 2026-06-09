const BasePage = require('./BasePage');

class PriceListPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async waitForPriceList() {
    await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).waitFor({ state: 'visible' });
  }

  async priceListExists() {
    return this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).isVisible();
  }

  async priceListExistsInToolbar() {
    return this.page.getByRole('button', { name: /Lista precios/ }).isVisible();
  }

  async getPriceListCount() {
    return this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).count();
  }

  async getPriceListName() {
    return this.page.getByText(/Lista precios/).first().innerText();
  }

  async navigateToUnitsTab() {
    await this.page.getByRole('tab', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
    // The tabpanel progressbar may persist after data loads (MUI DataGrid behavior).
    await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => {});
  }

  async navigateToGeneralTab() {
    await this.page.getByRole('tab', { name: 'General' }).click();
    await this.page.waitForLoadState('networkidle');
  }

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
