const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.path = '/sign-in';
  }

  async navigate() {
    await super.navigate(this.path);
    await this.page.getByRole('textbox', { name: 'ejemplo@compañia.com' }).waitFor({ state: 'visible' });
  }

  async fillEmail(email) {
    await this.page.getByRole('textbox', { name: 'ejemplo@compañia.com' }).fill(email);
  }

  async fillPassword(password) {
    await this.page.getByRole('textbox', { name: 'Contraseña *' }).fill(password);
  }

  async clickLoginBtn() {
    await this.page.getByRole('button', { name: 'Ingresar' }).click();
  }

  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginBtn();
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn() {
    return await this.page.getByRole('button', { name: 'Agregar proyecto' }).first().isVisible();
  }
}

module.exports = LoginPage;
