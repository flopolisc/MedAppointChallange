import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { env } from './helpers/env';
import { AUTH_SESSION_FILE } from './helpers/auth-session';

setup('authenticate via UI and persist session', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(env.patientEmail, env.patientPassword);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: AUTH_SESSION_FILE });
});
