import { Page } from '@playwright/test';
import { PATHS } from './constants';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(PATHS.LOGIN);
  }

  emailInput() {
    return this.page.locator('#email');
  }

  passwordInput() {
    return this.page.locator('#password');
  }

  submitButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
}
