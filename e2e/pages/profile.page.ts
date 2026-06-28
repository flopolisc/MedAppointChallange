import { Page } from '@playwright/test';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async openFromHeader() {
    await this.page.getByRole('link', { name: 'P', exact: true }).click();
    await this.page.waitForURL(/\/profile/);
  }

  firstNameInput() {
    return this.page.getByLabel('First Name');
  }

  lastNameInput() {
    return this.page.getByLabel('Last Name');
  }

  notesInput() {
    return this.page.getByLabel(/Notes/i);
  }

  saveButton() {
    return this.page.getByRole('button', { name: /Save Changes/i });
  }

  successBanner() {
    return this.page.getByText('Profile updated successfully');
  }

  async updateName(firstName: string, lastName: string, notes: string) {
    await this.firstNameInput().fill(firstName);
    await this.lastNameInput().fill(lastName);
    await this.notesInput().fill(notes);
    await this.saveButton().click();
  }
}
