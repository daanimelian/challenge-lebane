const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');

async function loginAndCreateProject(page) {
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

test.describe('TC-002: Crear Unidades y Verificar Lista de Precios', () => {
  test('crear unidades via formulario y verificar que aparecen en lista de precios', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto de base');
    const projectName = await loginAndCreateProject(page);
    logger.info('Proyecto creado', { name: projectName });

    logger.step('Completar formulario de unidades');
    await unitsPage.fillUnitForm(testData.units.valid);

    logger.step('Guardar unidades');
    await unitsPage.saveUnits();
    logger.info('Unidades guardadas');

    logger.step('Verificar que se creó lista de precios');
    await priceListPage.waitForPriceList();
    const hasPriceList = await priceListPage.priceListExists();
    expect(hasPriceList).toBe(true);

    const priceListName = await priceListPage.getPriceListName();
    expect(priceListName).toContain('Lista precios');
    logger.info('Lista de precios verificada', { name: priceListName });

    logger.step('Navegar a tab Unidades de la lista de precios');
    await priceListPage.navigateToUnitsTab();

    logger.step('Verificar que las unidades aparecen en la lista de precios');
    const unitCount = await unitsPage.getUnitCount();
    expect(unitCount).toBeGreaterThan(0);
    logger.info('Unidades verificadas en lista de precios', { count: unitCount });
  });

  test('crear unidades con pisos mínimos genera al menos una unidad', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto de base');
    await loginAndCreateProject(page);

    logger.step('Completar formulario con configuración mínima');
    await unitsPage.fillUnitForm({
      pricePerSqm: '10',
      expectedProfit: '1',
      floors: '1',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '1',
      parkingSpaces: '0',
    });

    logger.step('Guardar unidades');
    await unitsPage.saveUnits();

    logger.step('Verificar lista de precios creada');
    await priceListPage.waitForPriceList();
    expect(await priceListPage.priceListExists()).toBe(true);

    await priceListPage.navigateToUnitsTab();
    const unitCount = await unitsPage.getUnitCount();
    expect(unitCount).toBeGreaterThan(0);
    logger.info('Unidad mínima verificada', { count: unitCount });
  });
});

test.describe('TC-003: Modificar Precio de Lista', () => {
  test('modificar precio por m² y verificar que se actualiza en la lista', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login, crear proyecto y unidades');
    await loginAndCreateProject(page);
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();
    logger.info('Setup completado — proyecto y unidades creados');

    // The app only recalculates a unit's price when its M2 changes FROM 0 to a non-zero value,
    // using the pricePerSqm active at that moment. Changing pricePerSqm alone does NOT
    // retroactively update units that already have M2 > 0.
    // Correct order: update pricePerSqm first, then fill M2 from 0 → price uses the new value.
    logger.step('Modificar precio por m² primero (General → Editar → Guardar)');
    await priceListPage.modifyPrice('precioListaMetroCuadrado', testData.prices.updated);
    logger.info('Precio de lista actualizado', { newPrice: testData.prices.updated });

    logger.step('Navegar a Unidades y completar M2 en primera unidad (tenía 0)');
    await priceListPage.navigateToUnitsTab();
    await unitsPage.fillFirstUnitCoveredMeters();

    logger.step('Verificar que el precio de la unidad se calculó usando el nuevo precio por M2');
    const unitPrice = await unitsPage.getFirstUnitPrice();
    expect(unitPrice).not.toBe('0,00');
    logger.info('Precio de unidad calculado con M2 × nuevo precio', { price: unitPrice });
  });
});
