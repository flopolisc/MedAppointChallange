import { Locator, Page } from '@playwright/test';
import { Appointment } from '../helpers/api';
import { PATHS } from './constants';

export class AppointmentsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(PATHS.APPOINTMENTS);
    await this.waitForListLoaded();
  }

  async waitForListLoaded() {
    await this.page.getByRole('heading', { name: /appointments/i }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: /Reschedule/i }).first().waitFor({ state: 'visible' });
  }

  async waitForAppointmentByNotes(notes: string) {
    await this.page.getByText(notes, { exact: true }).waitFor({ state: 'visible' });
  }

  appointmentCardByNotes(notes: string): Locator {
    return this.page
      .getByText(notes, { exact: true })
      .locator(
        'xpath=ancestor::div[.//button[contains(normalize-space(.),"Reschedule") or contains(normalize-space(.),"Cancel")]][1]',
      );
  }

  appointmentDateTimeByNotes(notes: string): Locator {
    return this.appointmentCardByNotes(notes).locator('p').filter({
      hasText: /\d{1,2}\/\d{1,2}\/\d{4}\s•\s\d{2}:\d{2}/,
    });
  }

  async clickRescheduleForAppointment(appointment: Appointment) {
    if (!appointment.notes) {
      throw new Error('Appointment notes are required to locate the card');
    }

    await this.appointmentCardByNotes(appointment.notes)
      .getByRole('button', { name: /Reschedule/i })
      .click();
  }

  rescheduleForm(): Locator {
    return this.page.locator('form').filter({ has: this.page.getByText('New Date') });
  }

  successBanner(): Locator {
    return this.page.getByText('Appointment rescheduled successfully');
  }

  async rescheduleAppointment(appointment: Appointment, date: string, slot: string) {
    await this.clickRescheduleForAppointment(appointment);
    await this.rescheduleForm().locator('input[type="date"]').fill(date);
    await this.rescheduleForm().locator('select').selectOption(slot);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
