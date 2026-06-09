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
    await this.page.getByRole('button', { name: 'Abierto' }).first().click();
    await this.page.getByRole('option', { name: currency }).click();
    await this.page.getByRole('button', { name: 'Abierto' }).nth(1).click();
    await this.page.getByRole('option', { name: country }).click();
    await this.page.getByRole('button', { name: 'Abierto' }).nth(2).click();
    await this.page.getByRole('option', { name: province, exact: true }).click();
    if (city) {
      await this.page.getByRole('button', { name: 'Abierto' }).nth(3).click();
      await this.page.getByRole('option', { name: city }).click();
    }
    await this.page.getByRole('textbox', { name: 'Dirección' }).fill(address);
    await this.page.locator('input[name="numeroPuerta"]').fill(doorNumber);
    await this.page.getByRole('button', { name: 'Elige la fecha', exact: true }).click();
    await this.page.getByRole('gridcell').first().click();
    await this.page.getByRole('button', { name: 'Abierto' }).nth(4).click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
    await this.page.getByRole('button', { name: 'Abierto' }).nth(5).click();
    await this.page.getByRole('option', { name: adjustmentMode }).click();
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

  async navigateToComercialUnidades() {
    await this.page.getByText('Comienza a operar tu proyecto').waitFor({ state: 'visible' });
    await this.page.getByRole('button').nth(1).click();
    await this.page.getByRole('button', { name: 'Comercial' }).locator('button').click();
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = ProjectPage;
