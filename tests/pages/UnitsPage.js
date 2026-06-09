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
    // Deletion triggers a full page reload — wait for the main spinner to clear
    // before the caller tries to interact with tabs or the DataGrid.
    await this.page
      .locator('main')
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  async getUnitCount() {
    // MUI DataGrid renders "N filas" in the toolbar — more reliable than counting action buttons.
    // Falls back to 0 when the element is absent (empty grid after last unit is deleted).
    const text = await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByText(/\d+ filas/)
      .innerText({ timeout: 3000 })
      .catch(() => '0');
    return parseInt(text.match(/\d+/)?.[0] ?? '0', 10);
  }

  // Returns the row for a given unit identifier regardless of its current sort position.
  // Uses the row's accessible name (e.g. "Alternar seleccionar fila 101 Piso 1...")
  // so the locator re-evaluates correctly after the list reorders.
  _unitRow(unitId) {
    return this.page.getByRole('row', { name: new RegExp(`Alternar seleccionar fila ${unitId} `) });
  }

  // Fills m2 cubiertos for unit 101 and waits for the async price recalculation.
  async fillFirstUnitCoveredMeters(value = '50') {
    const row = this._unitRow(101);
    await row.locator('td[data-column-id="metrosCubiertos"] .\\!block').click();
    await this.page.getByRole('textbox', { name: 'Valor...' }).fill(String(value));
    // Clicking the adjacent cell confirms the value and triggers price recalculation
    await row.locator('td[data-column-id="metrosSemiCubiertos"] .\\!block').click();
    // Click the "Precio Unidad" column header to close any open inline editor without opening a new one
    await this.page.getByText('Precio Unidad').click();
    await this.page.waitForLoadState('networkidle');
    // Price recalculation is async — poll until the cell shows a non-zero value.
    // Re-evaluates _unitRow(101) on each retry so reordering doesn't break the check.
    await expect(
      this._unitRow(101).locator('td[data-column-id="precio"] .\\!block')
    ).not.toHaveText('0,00', { timeout: 10000 });
  }

  async getFirstUnitPrice() {
    return (await this._unitRow(101).locator('td[data-column-id="precio"] .\\!block').innerText()).trim();
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
    // The tabpanel progressbar may persist even after data loads (MUI DataGrid behavior).
    // Wait briefly for it to hide; if it doesn't, the "N filas" text is the reliable signal.
    await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => {});
  }
}

module.exports = UnitsPage;
