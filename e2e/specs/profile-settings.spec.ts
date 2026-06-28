import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { ProfilePage } from '../pages/profile.page';
import type { UserProfile } from '../helpers/api';

test.describe('Patient profile settings', () => {
  test('should update the patient profile from settings', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new ProfilePage(page);
    const newFirstName = `Name - ${Date.now()}`;
    const newLastName = `Last Name - ${Date.now()}`;
    const newNotes = 'e2e profile update';

    let putResponseBody: UserProfile | undefined;

    await page.route('**/users/me', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      putResponseBody = await response.json();
      await route.fulfill({ response });
    });

    await test.step('patient opens profile settings', async () => {
      await dashboardPage.goto();
      await profilePage.openFromHeader();
      await expect(profilePage.firstNameInput()).toBeVisible();
      await expect(profilePage.lastNameInput()).toBeVisible();
    });

    await test.step('patient updates name and notes, then saves', async () => {
      await profilePage.updateName(newFirstName, newLastName, newNotes);
      await expect(profilePage.successBanner()).toBeVisible();
    });

    await test.step('save response returns the submitted profile fields', async () => {
      expect(putResponseBody).toBeDefined();
      expect(putResponseBody!.first_name).toBe(newFirstName);
      expect(putResponseBody!.last_name).toBe(newLastName);
      expect(putResponseBody!.notes).toBe(newNotes);
    });

    await test.step('profile data persists after reload', async () => {
      await page.reload();
      await expect(profilePage.firstNameInput()).toHaveValue(newFirstName);
      await expect(profilePage.lastNameInput()).toHaveValue(newLastName);
      await expect(profilePage.notesInput()).toHaveValue(newNotes);
    });
  });
});
