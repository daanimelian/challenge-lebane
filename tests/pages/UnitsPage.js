const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class UnitsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async fillUnitForm({ pricePerSqm, expectedProfit, floors, basements, typologies, unitsPerFloor, parkingSpaces, priceListName }) {
    if (pricePerSqm) {
      await this.page.locator('input[name="precioListaMetroCuadrado"]').fill(String(pricePerSqm));
    }
    if (floors) {
      await this.page.locator('input[name="pisos"]').fill(String(floors));
    }
    if (typologies) {
      const list = Array.isArray(typologies) ? typologies : [typologies];
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

  async deleteUnit(index = 1) {
    await this.page.getByRole('button', { name: 'Eliminar' }).nth(index).click();
    await this.page.getByRole('button', { name: 'Confirmar' }).click();
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
    await this.page.waitForLoadState('networkidle');
    // Deletion triggers a full page reload — wait for the main spinner to clear.
    await this.page
      .locator('main')
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  async getUnitCount() {
    // Falls back to 0 when the element is absent (empty grid after last unit is deleted).
    const text = await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByText(/\d+ filas/)
      .innerText({ timeout: 3000 })
      .catch(() => '0');
    return parseInt(text.match(/\d+/)?.[0] ?? '0', 10);
  }

  _unitRow(unitId) {
    return this.page.getByRole('row', { name: new RegExp(`Alternar seleccionar fila ${unitId} `) });
  }

  async fillFirstUnitCoveredMeters(value = '50') {
    const row = this._unitRow(101);
    await row.locator('td[data-column-id="metrosCubiertos"] .\\!block').click();
    await this.page.getByRole('textbox', { name: 'Valor...' }).fill(String(value));
    await row.locator('td[data-column-id="metrosSemiCubiertos"] .\\!block').click();
    await this.page.getByText('Precio Unidad').click();
    await this.page.waitForLoadState('networkidle');
    // Price recalculation is async — poll until non-zero, re-evaluating after possible reorder.
    await expect(
      this._unitRow(101).locator('td[data-column-id="precio"] .\\!block')
    ).not.toHaveText('0,00', { timeout: 10000 });
  }

  async getFirstUnitPrice() {
    return (await this._unitRow(101).locator('td[data-column-id="precio"] .\\!block').innerText()).trim();
  }

  async getFirstUnitPriceAsNumber() {
    const price = await this.getFirstUnitPrice();
    // Format: dot as thousands separator, comma as decimal (e.g. "1.500,00" → 1500)
    return parseFloat(price.replace(/\./g, '').replace(',', '.'));
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
    await this.page.getByRole('button', { name: 'Cerrar' }).waitFor({ state: 'visible', timeout: 60000 });
    await expect(this.page.getByText('Archivo subido exitosamente')).toBeVisible({ timeout: 60000 });
    await this.page.getByRole('button', { name: 'Cerrar' }).click();
    await this.page.waitForLoadState('networkidle');
    // Template upload triggers a full page reload — wait for the main spinner to clear.
    await this.page
      .locator('main')
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    const unidadesTab = this.page.getByRole('tab', { name: 'Unidades' });
    if (await unidadesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await unidadesTab.click();
      await this.page.waitForLoadState('networkidle');
    }
    await this.page
      .getByRole('tabpanel', { name: 'Unidades' })
      .getByRole('progressbar')
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => {});
  }
}

module.exports = UnitsPage;
