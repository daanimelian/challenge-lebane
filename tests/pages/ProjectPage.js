const BasePage = require('./BasePage');

class ProjectPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async clickNewProject() {
    await this.page.getByRole('button', { name: 'Agregar proyecto' }).first().click();
    await this.page.getByRole('textbox', { name: 'Nombre' }).waitFor({ state: 'visible' });
  }

  async fillProjectForm({ name, currency = 'ARS', country = 'Argentina', province = 'Buenos Aires', city, address = 'Calle Test', doorNumber = '123', type = 'Edificio', adjustmentMode = 'Disponible al vencimiento', company }) {
    await this.page.getByRole('textbox', { name: 'Nombre' }).fill(name);

    // Currency
    await this.page.getByRole('button', { name: 'Abierto' }).first().click();
    await this.page.getByRole('option', { name: currency }).click();

    // Country
    await this.page.getByRole('button', { name: 'Abierto' }).nth(1).click();
    await this.page.getByRole('option', { name: country }).click();

    // Province
    await this.page.getByRole('button', { name: 'Abierto' }).nth(2).click();
    await this.page.getByRole('option', { name: province, exact: true }).click();

    // City
    if (city) {
      await this.page.getByRole('button', { name: 'Abierto' }).nth(3).click();
      await this.page.getByRole('option', { name: city }).click();
    }

    // Address
    await this.page.getByRole('textbox', { name: 'Dirección' }).fill(address);
    await this.page.locator('input[name="numeroPuerta"]').fill(doorNumber);

    // Date (pick first available)
    await this.page.getByRole('button', { name: 'Elige la fecha', exact: true }).click();
    await this.page.getByRole('gridcell').first().click();

    // Project type
    await this.page.getByRole('button', { name: 'Abierto' }).nth(4).click();
    await this.page.getByRole('option', { name: type, exact: true }).click();

    // Modalidad de ajuste
    await this.page.getByRole('button', { name: 'Abierto' }).nth(5).click();
    await this.page.getByRole('option', { name: adjustmentMode }).click();

    // Company/developer
    if (company) {
      await this.page.getByRole('combobox', { name: 'Escribí para buscar o crear' }).click();
      await this.page.getByRole('option', { name: company }).click();
    }
  }

  async clickRegister() {
    await this.page.getByRole('button', { name: 'Registrar' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
  }

  async createNewProject(projectData) {
    await this.clickNewProject();
    await this.fillProjectForm(projectData);
    await this.clickRegister();
  }

  async navigateToUnits() {
    await this.page.getByRole('button', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPriceListCreated() {
    return await this.page.getByRole('heading', { name: 'Nombre de la lista de precios' }).isVisible();
  }

  async getPriceListName() {
    const heading = this.page.getByRole('heading', { name: 'Nombre de la lista de precios' });
    await heading.waitFor({ state: 'visible' });
    return await this.page.locator('[data-testid="price-list-name"], .price-list-name').first().innerText();
  }
}

module.exports = ProjectPage;
