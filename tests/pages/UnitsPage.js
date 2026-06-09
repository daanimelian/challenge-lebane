const { expect } = require('@playwright/test');
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
    // Click the "Precio Unidad" column header to close any open inline editor without opening a new one
    await this.page.getByText('Precio Unidad').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstUnitPrice() {
    return (await this.page.locator('tr[data-index="1"] td[data-column-id="precio"] .\\!block').innerText()).trim();
  }

  async loadTemplate(xlsxFilePath) {
    await this.page.getByRole('button', { name: 'Templates' }).click();
    await this.page.getByRole('button', { name: 'Cargar Template de Unidades', exact: true }).click();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByText('Seleccionar desde mi').click(),
    ]);
    await fileChooser.setFiles(xlsxFilePath);
    await this.page.getByRole('button', { name: 'Cargar', exact: true }).click();
    await this.page.getByRole('button', { name: 'Cerrar' }).waitFor({ state: 'visible' });
    await expect(this.page.getByText('Archivo subido exitosamente')).toBeVisible();
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
    await this.page.waitForLoadState('networkidle');
    // After upload the app triggers a full page reload (main shows a loading spinner
    // and the breadcrumb changes). Wait for that top-level reload to complete.
    await this.page
      .locator('main')
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    // Navigate to the Unidades tab explicitly (it may not be the active one after reload).
    const unidadesTab = this.page.getByRole('tab', { name: 'Unidades' });
    if (await unidadesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await unidadesTab.click();
      await this.page.waitForLoadState('networkidle');
    }
    // Wait for the unit table to finish populating.
    await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }
}

module.exports = UnitsPage;
