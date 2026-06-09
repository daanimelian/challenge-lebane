const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');

test.describe('TC-001: Crear Proyecto', () => {
  test.setTimeout(120000);
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    logger.step('Login');
    await loginPage.navigate();
    await loginPage.login(testData.credentials.email, testData.credentials.password);
    logger.info('Login exitoso');
  });

  test('crear proyecto con nombre genera lista de precios inicial', { tag: '@sanity' }, async ({ page }) => {
    const projectPage = new ProjectPage(page);
    const unitsPage = new UnitsPage(page);
    const priceListPage = new PriceListPage(page);
    const projectName = testData.projects.valid.name();

    logger.step('Abrir formulario de nuevo proyecto');
    await projectPage.clickNewProject();

    logger.step('Completar formulario del proyecto');
    await projectPage.fillProjectForm({
      ...testData.projects.valid,
      name: projectName,
    });

    logger.step('Registrar proyecto');
    await projectPage.clickRegister();
    logger.info('Proyecto registrado', { name: projectName });

    logger.step('Navegar a sección Unidades del proyecto');
    await page.getByText('Comienza a operar tu proyecto').waitFor({ state: 'visible' });
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Comercial' }).locator('button').click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Unidades' }).click();
    await page.waitForLoadState('networkidle');

    logger.step('Completar formulario Actualizar datos del proyecto');
    await unitsPage.fillUnitForm(testData.units.valid);

    logger.step('Guardar formulario de unidades');
    await unitsPage.saveUnits();
    logger.info('Formulario de unidades guardado');

    logger.step('Verificar que se creó lista de precios');
    await priceListPage.waitForPriceList();
    const hasPriceList = await priceListPage.priceListExists();
    expect(hasPriceList).toBe(true);

    const priceListName = await priceListPage.getPriceListName();
    expect(priceListName).toContain('Lista precios');
    logger.info('Lista de precios verificada', { name: priceListName });
  });
});
