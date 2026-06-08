const BasePage = require('./BasePage');

// TODO: update selectors after inspecting https://tst.lebane.app
const SELECTORS = {
  createUnitButton: '[data-testid="create-unit-btn"], button:has-text("Crear unidad"), button:has-text("Nueva unidad")',
  unitNameInput: '[data-testid="unit-name-input"], input[name="name"], input[placeholder*="nombre"]',
  unitFloorInput: '[data-testid="unit-floor-input"], input[name="floor"], input[placeholder*="piso"]',
  unitTypeSelect: '[data-testid="unit-type-select"], select[name="type"]',
  unitSurfaceInput: '[data-testid="unit-surface-input"], input[name="surface"], input[placeholder*="superficie"]',
  priceListSelect: '[data-testid="price-list-select"], select[name="priceList"]',
  saveUnitButton: '[data-testid="save-unit-btn"], button[type="submit"]:has-text("Guardar"), button:has-text("Crear")',
  unitListItem: '[data-testid="unit-item"], .unit-item, .unit-row',
  unitByName: (name) => `[data-testid="unit-item"]:has-text("${name}"), .unit-item:has-text("${name}")`,
  deleteUnitButton: '[data-testid="delete-unit-btn"], button.delete-btn, button[aria-label="Eliminar"]',
  deleteUnitButtonByName: (name) => `[data-testid="unit-item"]:has-text("${name}") [data-testid="delete-unit-btn"], .unit-item:has-text("${name}") .delete-btn`,
  confirmDeleteButton: '[data-testid="confirm-delete-btn"], button:has-text("Confirmar"), button:has-text("Eliminar")',
  loadTemplateButton: '[data-testid="load-template-btn"], button:has-text("Cargar template"), button:has-text("Template")',
  templateOption: (name) => `[data-testid="template-option"]:has-text("${name}"), .template-option:has-text("${name}")`,
  confirmTemplateButton: '[data-testid="confirm-template-btn"], button:has-text("Confirmar"), button:has-text("Cargar")',
};

class UnitsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async clickCreateUnit() {
    await this.click(SELECTORS.createUnitButton);
    await this.waitForVisible(SELECTORS.unitNameInput);
  }

  async fillUnitForm({ name, floor, type, surface, priceList }) {
    if (name) await this.fill(SELECTORS.unitNameInput, name);
    if (floor) await this.fill(SELECTORS.unitFloorInput, floor);
    if (type) await this.selectOption(SELECTORS.unitTypeSelect, type);
    if (surface) await this.fill(SELECTORS.unitSurfaceInput, surface);
    if (priceList) await this.selectOption(SELECTORS.priceListSelect, priceList);
  }

  async saveUnit() {
    await this.click(SELECTORS.saveUnitButton);
    await this.page.waitForLoadState('networkidle');
  }

  async createUnit(unitData) {
    await this.clickCreateUnit();
    await this.fillUnitForm(unitData);
    await this.saveUnit();
  }

  async unitExists(name) {
    return await this.isVisible(SELECTORS.unitByName(name));
  }

  async deleteUnit(name) {
    await this.click(SELECTORS.deleteUnitButtonByName(name));
    await this.waitForVisible(SELECTORS.confirmDeleteButton);
    await this.click(SELECTORS.confirmDeleteButton);
    await this.page.waitForLoadState('networkidle');
  }

  async getUnitCount() {
    return await this.getCount(SELECTORS.unitListItem);
  }

  async loadTemplate(templateName) {
    await this.click(SELECTORS.loadTemplateButton);
    await this.waitForVisible(SELECTORS.templateOption(templateName));
    await this.click(SELECTORS.templateOption(templateName));
    await this.click(SELECTORS.confirmTemplateButton);
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = UnitsPage;
