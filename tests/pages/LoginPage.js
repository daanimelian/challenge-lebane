const BasePage = require('./BasePage');

// TODO: update selectors after inspecting https://tst.lebane.app
const SELECTORS = {
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  loginButton: 'button[type="submit"]',
  errorMessage: '[data-testid="error-message"], .error-message, [role="alert"]',
  userAvatar: '[data-testid="user-avatar"], .user-avatar, header .avatar',
};

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.path = '/login';
  }

  async navigate() {
    await super.navigate(this.path);
    await this.waitForVisible(SELECTORS.emailInput);
  }

  async fillEmail(email) {
    await this.fill(SELECTORS.emailInput, email);
  }

  async fillPassword(password) {
    await this.fill(SELECTORS.passwordInput, password);
  }

  async clickLoginBtn() {
    await this.click(SELECTORS.loginButton);
  }

  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginBtn();
    await this.page.waitForLoadState('networkidle');
  }

  async getErrorMessage() {
    return await this.getText(SELECTORS.errorMessage);
  }

  async isLoggedIn() {
    return await this.isVisible(SELECTORS.userAvatar);
  }
}

module.exports = LoginPage;
