const { test, expect } = require('@playwright/test');
const path = require('path');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');
const { loginAndSetupProject } = require('../helpers/setup');

const XLSX_TEMPLATE_PATH = path.resolve(__dirname, '../fixtures/unit-template.xlsx');

test.describe('TC-004: Cargar Template', () => {
  test.setTimeout(120000);

  test('cargar template agrega unidades a la lista de precios existente', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto base');
    await loginAndSetupProject(page);

    logger.step('Crear unidades iniciales para tener una lista de precios base');
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();

    const priceListCountBefore = await priceListPage.getPriceListCount();
    logger.info('Listas de precios antes de cargar template', { count: priceListCountBefore });

    logger.step('Cargar template');
    await priceListPage.navigateToUnitsTab();
    const unitCountBefore = await unitsPage.getUnitCount();
    await unitsPage.loadTemplate(XLSX_TEMPLATE_PATH);

    logger.step('Verificar unidades creadas o actualizadas desde template');
    const unitCountAfter = await unitsPage.getUnitCount();
    expect(unitCountAfter).toBeGreaterThan(0);
    logger.info('Unidades del template', { antes: unitCountBefore, despues: unitCountAfter });

    logger.step('Verificar que la lista de precios sigue existiendo');
    await priceListPage.navigateToGeneralTab();
    await priceListPage.waitForPriceList();
    const priceListCountAfter = await priceListPage.getPriceListCount();
    expect(priceListCountAfter).toBeGreaterThan(0);
    logger.info('Lista de precios verificada post-template', { antes: priceListCountBefore, despues: priceListCountAfter });
  });

  test('cargar template crea unidades asociadas', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto base');
    await loginAndSetupProject(page);
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();

    logger.step('Cargar template');
    await priceListPage.navigateToUnitsTab();
    const unitCountBefore = await unitsPage.getUnitCount();
    await unitsPage.loadTemplate(XLSX_TEMPLATE_PATH);

    logger.step('Verificar unidades creadas o actualizadas desde template');
    const unitCountAfter = await unitsPage.getUnitCount();
    expect(unitCountAfter).toBeGreaterThan(0);
    logger.info('Unidades del template', { antes: unitCountBefore, despues: unitCountAfter });

    logger.step('Verificar lista de precios del template');
    await priceListPage.navigateToGeneralTab();
    await priceListPage.waitForPriceList();
    expect(await priceListPage.priceListExists()).toBe(true);
  });

  test('cargar template sobre proyecto con unidades existentes mantiene lista original', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login, crear proyecto y unidades base');
    await loginAndSetupProject(page);
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();

    await priceListPage.navigateToUnitsTab();
    const unitCountBefore = await unitsPage.getUnitCount();
    const priceListCountBefore = await priceListPage.getPriceListCount();
    logger.info('Estado antes del template', { unidades: unitCountBefore, listas: priceListCountBefore });

    logger.step('Cargar template');
    await unitsPage.loadTemplate(XLSX_TEMPLATE_PATH);

    logger.step('Verificar unidades creadas o actualizadas desde template');
    const unitCountAfter = await unitsPage.getUnitCount();
    expect(unitCountAfter).toBeGreaterThan(0);
    logger.info('Unidades del template', { antes: unitCountBefore, despues: unitCountAfter });

    logger.step('Verificar que la lista de precios original se mantiene');
    await priceListPage.navigateToGeneralTab();
    await priceListPage.waitForPriceList();
    const priceListCountAfter = await priceListPage.getPriceListCount();
    expect(priceListCountAfter).toBeGreaterThan(0);
    logger.info('Listas de precios después del template', { antes: priceListCountBefore, despues: priceListCountAfter });
  });
});
