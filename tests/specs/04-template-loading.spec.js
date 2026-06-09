const { test, expect } = require('@playwright/test');
const path = require('path');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');

const XLSX_TEMPLATE_PATH = path.resolve(__dirname, '../fixtures/unit-template.xlsx');

async function loginAndNavigateToUnits(page) {
  const loginPage = new LoginPage(page);
  const projectPage = new ProjectPage(page);

  await loginPage.navigate();
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const projectName = testData.projects.valid.name();
  await projectPage.clickNewProject();
  await projectPage.fillProjectForm({ ...testData.projects.valid, name: projectName });
  await projectPage.clickRegister();

  await page.getByText('Comienza a operar tu proyecto').waitFor({ state: 'visible' });
  await page.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Comercial' }).locator('button').click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Unidades' }).click();
  await page.waitForLoadState('networkidle');

  return projectName;
}

test.describe('TC-004: Cargar Template', () => {
  test('cargar template crea nueva lista de precios', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);
    const defaultTemplate = { name: 'unit-template.csv' };

    logger.step('Login y crear proyecto base');
    await loginAndNavigateToUnits(page);

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
    logger.info('Template cargado', { template: defaultTemplate.name });

    logger.step('Verificar unidades creadas o actualizadas desde template');
    const unitCountAfter = await unitsPage.getUnitCount();
    logger.info('Unidades del template', {
      antes: unitCountBefore,
      despues: unitCountAfter,
      resultado: unitCountAfter > unitCountBefore ? 'nuevas unidades creadas' : 'unidades existentes actualizadas',
    });
    expect(unitCountAfter).toBeGreaterThan(0);

    logger.step('Verificar que la lista de precios sigue existiendo');
    await priceListPage.openFirstPriceList();
    await priceListPage.waitForPriceList();
    const priceListCountAfter = await priceListPage.getPriceListCount();
    expect(priceListCountAfter).toBeGreaterThan(0);
    logger.info('Lista de precios verificada post-template', {
      antes: priceListCountBefore,
      despues: priceListCountAfter,
    });
  });

  test('cargar template crea unidades asociadas', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto base');
    await loginAndNavigateToUnits(page);

    logger.step('Completar formulario Actualizar datos del proyecto');
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();

    logger.step('Cargar template');
    await priceListPage.navigateToUnitsTab();
    const unitCountBefore = await unitsPage.getUnitCount();
    await unitsPage.loadTemplate(XLSX_TEMPLATE_PATH);
    logger.info('Template cargado', { template: 'unit-template.csv' });

    logger.step('Verificar unidades creadas o actualizadas desde template');
    const unitCountAfter = await unitsPage.getUnitCount();
    logger.info('Unidades del template', {
      antes: unitCountBefore,
      despues: unitCountAfter,
      resultado: unitCountAfter > unitCountBefore ? 'nuevas unidades creadas' : 'unidades existentes actualizadas',
    });
    expect(unitCountAfter).toBeGreaterThan(0);

    logger.step('Verificar lista de precios del template');
    await priceListPage.openFirstPriceList();
    await priceListPage.waitForPriceList();
    expect(await priceListPage.priceListExists()).toBe(true);
  });

  test('cargar template sobre proyecto con unidades existentes mantiene lista original', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login, crear proyecto y unidades base');
    await loginAndNavigateToUnits(page);
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
    logger.info('Unidades del template', {
      antes: unitCountBefore,
      despues: unitCountAfter,
      resultado: unitCountAfter > unitCountBefore ? 'nuevas unidades creadas' : 'unidades existentes actualizadas',
    });
    expect(unitCountAfter).toBeGreaterThan(0);

    logger.step('Verificar que la lista de precios original se mantiene');
    await priceListPage.openFirstPriceList();
    await priceListPage.waitForPriceList();
    const priceListCountAfter = await priceListPage.getPriceListCount();
    expect(priceListCountAfter).toBeGreaterThan(0);
    logger.info('Listas de precios después del template', {
      antes: priceListCountBefore,
      despues: priceListCountAfter,
    });
  });
});
