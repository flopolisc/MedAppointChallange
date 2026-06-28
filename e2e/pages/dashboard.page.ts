import { Page } from '@playwright/test';
import { PATHS } from './constants';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(PATHS.DASHBOARD);
    await this.page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).waitFor({
      state: 'visible',
    });
  }

  newAppointmentLink() {
    return this.page.locator('main').getByRole('link', { name: /New Appointment/i });
  }

  async openNewAppointment() {
    await this.newAppointmentLink().click();
    await this.page.waitForURL(/\/appointments\/new/);
  }
}
