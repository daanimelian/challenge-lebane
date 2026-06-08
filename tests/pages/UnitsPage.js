const BasePage = require('./BasePage');

class UnitsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigateToUnits() {
    await this.page.getByRole('button', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Fills the bulk unit generator form
  async fillUnitForm({ pricePerSqm, expectedProfit, floors, basements, unitsPerFloor, parkingSpaces, unitType }) {
    if (pricePerSqm) {
      await this.page.locator('input[name="precioListaMetroCuadrado"]').fill(String(pricePerSqm));
    }
    if (expectedProfit) {
      await this.page.locator('input[name="gananciaEsperada"]').fill(String(expectedProfit));
    }
    if (floors) {
      await this.page.locator('input[name="pisos"]').fill(String(floors));
    }
    if (basements) {
      await this.page.locator('input[name="subsuelos"]').fill(String(basements));
    }
    if (unitType) {
      await this.page.getByTitle(unitType).getByRole('combobox').fill(String(unitType));
    }
    if (unitsPerFloor) {
      await this.page.locator('input[name="unidadesPorPiso"]').fill(String(unitsPerFloor));
    }
    if (parkingSpaces) {
      await this.page.locator('input[name="cantidadCocheras"]').fill(String(parkingSpaces));
    }
  }

  async saveUnits() {
    await this.page.getByRole('button', { name: 'Guardar' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async createUnits(unitData) {
    await this.fillUnitForm(unitData);
    await this.saveUnits();
  }

  async navigateToUnitsTab() {
    await this.page.getByRole('tab', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async deleteUnit(index = 1) {
    await this.page.getByRole('button', { name: 'Eliminar' }).nth(index).click();
    await this.page.getByRole('button', { name: 'Confirmar' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getUnitCount() {
    return await this.page.getByRole('button', { name: 'Eliminar' }).count();
  }

  async loadTemplate(csvFilePath) {
    // TODO: verificar el selector exacto del botón que abre el file picker
    await this.page.getByRole('button', { name: 'Cargar template' }).click();

    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvFilePath);

    await this.page.getByRole('button', { name: 'Confirmar' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = UnitsPage;
