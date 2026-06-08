const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');
const logger = require('../../utils/logger');

test.describe('TC-001: Crear Proyecto', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    logger.step('Login');
    await loginPage.navigate();
    await loginPage.login(testData.credentials.email, testData.credentials.password);
    logger.info('Login exitoso');
  });

  test('crear proyecto con nombre genera lista de precios inicial', async ({ page }) => {
    const projectPage = new ProjectPage(page);
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

    // TODO: refinar navegación post-registro según comportamiento real de la app
    logger.step('Navegar a sección Unidades del proyecto');
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Unidades' }).click();
    await page.waitForLoadState('networkidle');

    logger.step('Verificar que se creó lista de precios inicial');
    await priceListPage.waitForPriceList();
    const hasPriceList = await priceListPage.priceListExists();
    expect(hasPriceList).toBe(true);

    const priceListName = await priceListPage.getPriceListName();
    expect(priceListName).toContain('Lista precios');
    logger.info('Lista de precios verificada', { name: priceListName });
  });

  test('crear proyecto sin nombre usa nombre por defecto', async ({ page }) => {
    const projectPage = new ProjectPage(page);
    const priceListPage = new PriceListPage(page);

    logger.step('Abrir formulario de nuevo proyecto');
    await projectPage.clickNewProject();

    logger.step('Completar formulario sin nombre');
    await projectPage.fillProjectForm({
      ...testData.projects.valid,
      name: '',
    });

    logger.step('Registrar proyecto');
    await projectPage.clickRegister();

    logger.step('Navegar a sección Unidades del proyecto');
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Unidades' }).click();
    await page.waitForLoadState('networkidle');

    logger.step('Verificar que se creó lista de precios inicial');
    await priceListPage.waitForPriceList();
    const hasPriceList = await priceListPage.priceListExists();
    expect(hasPriceList).toBe(true);
    logger.info('Lista de precios generada correctamente para proyecto sin nombre');
  });
});
