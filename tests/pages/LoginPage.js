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

  async login(email, password) {
    await this.page.getByRole('textbox', { name: 'ejemplo@compañia.com' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Contraseña *' }).fill(password);
    await this.page.getByRole('button', { name: 'Ingresar' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = LoginPage;
