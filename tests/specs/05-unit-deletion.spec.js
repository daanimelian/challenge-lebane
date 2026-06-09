const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');

async function setupProjectWithUnits(page, unitConfig = testData.units.valid) {
  const loginPage = new LoginPage(page);
  const projectPage = new ProjectPage(page);
  const unitsPage = new UnitsPage(page);
  const priceListPage = new PriceListPage(page);

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

  await unitsPage.fillUnitForm(unitConfig);
  await unitsPage.saveUnits();
  await priceListPage.waitForPriceList();
  await priceListPage.navigateToUnitsTab();

  return { unitsPage, priceListPage };
}

test.describe('TC-005: Eliminar Unidad (Normal)', () => {
  test.setTimeout(120000);
  test('eliminar una unidad reduce el listado y mantiene la lista de precios', { tag: '@sanity' }, async ({ page }) => {
    logger.step('Setup: login, proyecto y múltiples unidades');
    const { unitsPage, priceListPage } = await setupProjectWithUnits(page, {
      pricePerSqm: '12',
      expectedProfit: '1',
      floors: '3',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '2',
      parkingSpaces: '0',
    });

    const countBefore = await unitsPage.getUnitCount();
    expect(countBefore).toBeGreaterThan(1);
    logger.info('Unidades antes de eliminar', { count: countBefore });

    logger.step('Eliminar una unidad');
    await unitsPage.deleteUnit(1);
    logger.info('Unidad eliminada');

    logger.step('Verificar que el listado disminuyó en una unidad');
    await priceListPage.navigateToUnitsTab();
    const countAfter = await unitsPage.getUnitCount();
    expect(countAfter).toBe(countBefore - 1);
    logger.info('Unidades después de eliminar', { count: countAfter });

    logger.step('Verificar que la lista de precios se mantiene');
    // Check the toolbar button "Lista precios {fecha}" — visible from the Unidades tab.
    // Using priceListExistsInToolbar() avoids navigating to General tab just to check existence.
    const hasPriceList = await priceListPage.priceListExistsInToolbar();
    expect(hasPriceList).toBe(true);
    logger.info('Lista de precios intacta', { filas: countAfter, filasPrevias: countBefore });
  });

  test('eliminar unidad no afecta las unidades restantes', async ({ page }) => {
    logger.step('Setup: login, proyecto y múltiples unidades');
    const { unitsPage, priceListPage } = await setupProjectWithUnits(page, {
      pricePerSqm: '12',
      expectedProfit: '1',
      floors: '2',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '3',
      parkingSpaces: '0',
    });

    const countBefore = await unitsPage.getUnitCount();
    logger.info('Unidades antes', { count: countBefore });

    logger.step('Eliminar primera unidad');
    await unitsPage.deleteUnit(1);

    logger.step('Verificar que quedan unidades y la lista de precios existe');
    await priceListPage.navigateToUnitsTab();
    const countAfter = await unitsPage.getUnitCount();
    expect(countAfter).toBeGreaterThan(0);
    expect(await priceListPage.priceListExistsInToolbar()).toBe(true);
    logger.info('Estado final verificado', { unidades: countAfter });
  });
});

test.describe('TC-006: Eliminar Última Unidad de una Lista', () => {
  test.setTimeout(120000);
  test('eliminar la última unidad de la lista también elimina la lista de precios', { tag: '@sanity' }, async ({ page }) => {
    logger.step('Setup: login, proyecto y una sola unidad');
    const { unitsPage, priceListPage } = await setupProjectWithUnits(page, {
      pricePerSqm: '10',
      expectedProfit: '1',
      floors: '1',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '1',
      parkingSpaces: '0',
    });

    const unitCount = await unitsPage.getUnitCount();
    expect(unitCount).toBe(1);
    logger.info('Confirmado: solo existe una unidad', { count: unitCount });

    logger.step('Eliminar la única unidad');
    await unitsPage.deleteUnit(0);
    logger.info('Unidad eliminada');

    logger.step('Verificar que la unidad fue eliminada');
    // After deleting the last unit the page reloads and briefly shows "25 filas" (pagination
    // placeholder). expect.poll() retries getUnitCount() until the grid settles at 0.
    await expect.poll(() => unitsPage.getUnitCount(), { timeout: 10000 }).toBe(0);
    logger.info('Lista de unidades vacía');

    logger.step('Verificar que la lista de precios también fue eliminada');
    await priceListPage.waitForPriceListGone();
    const hasPriceList = await priceListPage.priceListExists();
    expect(hasPriceList).toBe(false);
    logger.info('Lista de precios eliminada correctamente');
  });

  test('eliminar hasta dejar una unidad no elimina la lista de precios', async ({ page }) => {
    logger.step('Setup: login, proyecto con dos unidades');
    const { unitsPage, priceListPage } = await setupProjectWithUnits(page, {
      pricePerSqm: '10',
      expectedProfit: '1',
      floors: '1',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '2',
      parkingSpaces: '0',
    });

    const countBefore = await unitsPage.getUnitCount();
    expect(countBefore).toBe(2);
    logger.info('Confirmado: dos unidades', { count: countBefore });

    logger.step('Eliminar una unidad (queda una)');
    await unitsPage.deleteUnit(1);

    await priceListPage.navigateToUnitsTab();
    const countAfter = await unitsPage.getUnitCount();
    expect(countAfter).toBe(1);

    logger.step('Verificar que la lista de precios todavía existe');
    expect(await priceListPage.priceListExistsInToolbar()).toBe(true);
    logger.info('Lista de precios intacta con una unidad restante');
  });
});
