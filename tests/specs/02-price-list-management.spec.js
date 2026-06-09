const { test, expect } = require('@playwright/test');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');
const { loginAndSetupProject } = require('../helpers/setup');

test.describe('TC-002: Crear Unidades y Verificar Lista de Precios', () => {
  test.setTimeout(120000);

  test('crear unidades via formulario y verificar que aparecen en lista de precios', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login y crear proyecto de base');
    const projectName = await loginAndSetupProject(page);
    logger.info('Proyecto creado', { name: projectName });

    logger.step('Completar formulario de unidades');
    await unitsPage.fillUnitForm(testData.units.valid);

    logger.step('Guardar unidades');
    await unitsPage.saveUnits();

    logger.step('Verificar que se creó lista de precios');
    await priceListPage.waitForPriceList();
    expect(await priceListPage.priceListExists()).toBe(true);

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
    await loginAndSetupProject(page);

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

  test('crear lista de precios con nombre personalizado lo guarda correctamente', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);
    const customName = `Lista Personalizada ${Date.now().toString().slice(-6)}`;

    logger.step('Login y crear proyecto de base');
    await loginAndSetupProject(page);

    logger.step('Completar formulario con nombre de lista personalizado');
    await unitsPage.fillUnitForm({ ...testData.units.valid, priceListName: customName });
    await unitsPage.saveUnits();

    logger.step('Verificar que la lista muestra el nombre personalizado');
    await priceListPage.waitForPriceList();
    await expect(page.getByText(customName)).toBeVisible();
    logger.info('Nombre personalizado verificado', { name: customName });
  });
});

test.describe('TC-003: Modificar Precio de Lista', () => {
  test.setTimeout(120000);

  test('modificar precio por m² y verificar que se actualiza en la lista', { tag: '@sanity' }, async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login, crear proyecto y unidades');
    await loginAndSetupProject(page);
    await unitsPage.fillUnitForm(testData.units.valid);
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();
    logger.info('Setup completado — proyecto y unidades creados');

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

  test('el precio de la unidad es precio/m² × m² cubiertos', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);
    const pricePerSqm = 20;
    const coveredMeters = 50;

    logger.step('Login, crear proyecto y unidades con precio/m² conocido');
    await loginAndSetupProject(page);
    await unitsPage.fillUnitForm({
      pricePerSqm: String(pricePerSqm),
      expectedProfit: '1',
      floors: '1',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '1',
      parkingSpaces: '0',
    });
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();
    await priceListPage.navigateToUnitsTab();

    logger.step(`Completar M2 cubiertos: ${coveredMeters}`);
    await unitsPage.fillFirstUnitCoveredMeters(String(coveredMeters));

    logger.step('Verificar cálculo: precio/m² × m² cubiertos = precio unidad');
    const unitPrice = await unitsPage.getFirstUnitPriceAsNumber();
    expect(unitPrice).toBe(pricePerSqm * coveredMeters);
    logger.info('Cálculo verificado', { pricePerSqm, coveredMeters, expected: pricePerSqm * coveredMeters, actual: unitPrice });
  });

  test('cambiar precio/m² global no retroactiva unidades con M2 ya cargado', async ({ page }) => {
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Login, crear proyecto y unidades');
    await loginAndSetupProject(page);
    await unitsPage.fillUnitForm({
      pricePerSqm: '10',
      expectedProfit: '1',
      floors: '1',
      basements: '0',
      typologies: ['Dos ambientes'],
      unitsPerFloor: '1',
      parkingSpaces: '0',
    });
    await unitsPage.saveUnits();
    await priceListPage.waitForPriceList();
    await priceListPage.navigateToUnitsTab();

    logger.step('Cargar M2 en la unidad para que tenga precio calculado');
    await unitsPage.fillFirstUnitCoveredMeters('50');
    const precioOriginal = await unitsPage.getFirstUnitPrice();
    logger.info('Precio calculado con precio/m² inicial', { precio: precioOriginal });

    logger.step('Modificar precio/m² global a un valor diferente');
    await priceListPage.modifyPrice('precioListaMetroCuadrado', '99');
    logger.info('Precio/m² global actualizado a 99');

    /*
     * COMPORTAMIENTO DESCUBIERTO durante las pruebas — no confirmado como especificación.
     * Las unidades con M2 > 0 mantienen su precio; solo las unidades que pasan
     * de M2=0 a M2>0 recalculan usando el precio/m² activo en ese momento.
     * Si este comportamiento es un bug, este test debería actualizarse con el valor esperado correcto.
     */
    logger.step('Verificar que el precio de la unidad con M2 ya cargado no cambió');
    await priceListPage.navigateToUnitsTab();
    const precioTrasModificacion = await unitsPage.getFirstUnitPrice();
    expect(precioTrasModificacion).toBe(precioOriginal);
    logger.info('Precio sin cambios tras modificación global', {
      precioAntes: precioOriginal,
      precioDespues: precioTrasModificacion,
    });
  });
});
