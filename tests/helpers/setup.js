const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');
const UnitsPage = require('../pages/UnitsPage');
const PriceListPage = require('../pages/PriceListPage');
const testData = require('../fixtures/test-data');

async function loginAndSetupProject(page) {
  const loginPage = new LoginPage(page);
  const projectPage = new ProjectPage(page);

  await loginPage.navigate();
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const projectName = testData.projects.valid.name();
  await projectPage.clickNewProject();
  await projectPage.fillProjectForm({ ...testData.projects.valid, name: projectName });
  await projectPage.clickRegister();
  await projectPage.navigateToComercialUnidades();

  return projectName;
}

async function setupProjectWithUnits(page, unitConfig = testData.units.valid) {
  const unitsPage = new UnitsPage(page);
  const priceListPage = new PriceListPage(page);

  await loginAndSetupProject(page);
  await unitsPage.fillUnitForm(unitConfig);
  await unitsPage.saveUnits();
  await priceListPage.waitForPriceList();
  await priceListPage.navigateToUnitsTab();

  return { unitsPage, priceListPage };
}

module.exports = { loginAndSetupProject, setupProjectWithUnits };
