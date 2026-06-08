const BasePage = require('./BasePage');

class UnitsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigateToUnits() {
    await this.page.getByRole('button', { name: 'Unidades' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Fills the "Actualizar datos del proyecto" form required before accessing the price list.
  // Required fields: pricePerSqm, floors, typologies (at least one), unitsPerFloor.
  async fillUnitForm({ pricePerSqm, expectedProfit, floors, basements, typologies, unitsPerFloor, parkingSpaces, priceListName }) {
    if (pricePerSqm) {
      await this.page.locator('input[name="precioListaMetroCuadrado"]').fill(String(pricePerSqm));
    }
    if (floors) {
      await this.page.locator('input[name="pisos"]').fill(String(floors));
    }
    if (typologies) {
      const list = Array.isArray(typologies) ? typologies : [typologies];
      // nth(1): 0=Moneda, 1=Tipologias
      await this.page.getByRole('button', { name: 'Abierto' }).nth(1).click();
      for (const typology of list) {
        await this.page.getByRole('option', { name: typology, exact: true }).click();
      }
      await this.page.keyboard.press('Escape');
    }
    if (unitsPerFloor) {
      await this.page.locator('input[name="unidadesPorPiso"]').fill(String(unitsPerFloor));
    }
    if (expectedProfit) {
      await this.page.locator('input[name="gananciaEsperada"]').fill(String(expectedProfit));
    }
    if (basements !== undefined) {
      await this.page.locator('input[name="subsuelos"]').fill(String(basements));
    }
    if (parkingSpaces !== undefined) {
      await this.page.locator('input[name="cantidadCocheras"]').fill(String(parkingSpaces));
    }
    if (priceListName) {
      await this.page.locator('input[name="nombreListaPrecios"]').fill(String(priceListName));
    }
  }

  async saveUnits() {
    await this.page.getByRole('button', { name: 'Guardar' }).click();
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
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
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getUnitCount() {
    return await this.page.getByRole('button', { name: 'Eliminar' }).count();
  }

  // Fills m2 cubiertos for the first apartment unit (data-index="1", skipping Cochera at index 0)
  // so its price calculates from 0 before price-change tests.
  async fillFirstUnitCoveredMeters(value = '50') {
    await this.page.locator('tr[data-index="1"] td[data-column-id="metrosCubiertos"] .\\!block').click();
    await this.page.getByRole('textbox', { name: 'Valor...' }).fill(String(value));
    // Clicking the adjacent cell confirms the value and triggers price recalculation
    await this.page.locator('tr[data-index="1"] td[data-column-id="metrosSemiCubiertos"] .\\!block').click();
    await this.page.keyboard.press('Escape');
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstUnitPrice() {
    return (await this.page.locator('tr[data-index="1"] td[data-column-id="precio"] .\\!block').innerText()).trim();
  }

  async loadTemplate(xlsxFilePath) {
    await this.page.getByRole('button', { name: 'Templates' }).click();
    await this.page.getByRole('button', { name: 'Cargar Template de Unidades', exact: true }).click();
    await this.page.getByText('Seleccionar desde mi').click();
    await this.page.locator('div').filter({ hasText: /Cargar Template de Unidades/ }).nth(1).setInputFiles(xlsxFilePath);
    await this.page.getByRole('button', { name: 'Cargar', exact: true }).click();
    await this.page.getByRole('button').filter({ hasText: /^$/ }).click();
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = UnitsPage;
