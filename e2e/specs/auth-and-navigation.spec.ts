import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { PATHS } from '../pages/constants';
import { env } from '../helpers/env';

test.describe('Authentication', () => {
  test('should allow a patient to sign in and access the portal', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('patient opens the login page', async () => {
      await loginPage.goto();
      await expect(loginPage.emailInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
      await expect(loginPage.submitButton()).toBeVisible();
    });

    await test.step('patient signs in with valid credentials', async () => {
      await loginPage.login(env.patientEmail, env.patientPassword);
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i })).toBeVisible();
    });

    await test.step('signed-out patient is redirected to login', async () => {
      await page.evaluate(() => localStorage.removeItem('token'));
      await page.goto(PATHS.APPOINTMENTS);
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
