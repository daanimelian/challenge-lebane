const BasePage = require('./BasePage');

// TODO: update selectors after inspecting https://tst.lebane.app
const SELECTORS = {
  newProjectButton: '[data-testid="new-project-btn"], button:has-text("Nuevo proyecto"), button:has-text("Crear proyecto")',
  projectNameInput: '[data-testid="project-name-input"], input[name="name"], input[placeholder*="nombre"]',
  createProjectButton: '[data-testid="create-project-btn"], button[type="submit"]:has-text("Crear")',
  projectListItem: '[data-testid="project-item"], .project-item, .project-card',
  projectByName: (name) => `[data-testid="project-item"]:has-text("${name}"), .project-item:has-text("${name}")`,
  priceListSection: '[data-testid="price-list"], .price-list, [class*="price-list"]',
  priceListItem: '[data-testid="price-list-item"], .price-list-item',
};

class ProjectPage extends BasePage {
  constructor(page) {
    super(page);
    this.path = '/proyectos';
  }

  async navigateToProjects() {
    await super.navigate(this.path);
    await this.waitForVisible(SELECTORS.newProjectButton);
  }

  async clickNewProject() {
    await this.click(SELECTORS.newProjectButton);
  }

  async fillProjectForm({ name }) {
    await this.waitForVisible(SELECTORS.projectNameInput);
    await this.fill(SELECTORS.projectNameInput, name);
  }

  async clickCreateBtn() {
    await this.click(SELECTORS.createProjectButton);
    await this.page.waitForLoadState('networkidle');
  }

  async createNewProject(projectData) {
    await this.clickNewProject();
    await this.fillProjectForm(projectData);
    await this.clickCreateBtn();
  }

  async projectExists(name) {
    return await this.isVisible(SELECTORS.projectByName(name));
  }

  async verifyPriceListCreated() {
    await this.waitForVisible(SELECTORS.priceListSection);
    return await this.getCount(SELECTORS.priceListItem) > 0;
  }

  async openProject(name) {
    await this.click(SELECTORS.projectByName(name));
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = ProjectPage;
