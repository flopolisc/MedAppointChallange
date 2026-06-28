import { Page } from '@playwright/test';

export class BookAppointmentPage {
  constructor(private readonly page: Page) {}

  async waitForForm() {
    await this.page.getByTestId('submit-appointment').waitFor({ state: 'visible' });
  }

  dateInput() {
    return this.page.locator('#appointment_date');
  }

  timeSlotSelect() {
    return this.page.locator('#time_slot');
  }

  doctorSelect() {
    return this.page.locator('#doctor_id');
  }

  notesInput() {
    return this.page.locator('#notes');
  }

  submitButton() {
    return this.page.getByTestId('submit-appointment');
  }

  successMessage() {
    return this.page.getByText('Appointment Booked!');
  }

  async fillDate(date: string) {
    await this.dateInput().fill(date);
  }

  async selectSlot(slot: string) {
    await this.timeSlotSelect().selectOption(slot);
  }

  async submit() {
    await this.submitButton().click();
  }

  async selectDoctor(doctorId: string) {
    await this.doctorSelect().selectOption(String(doctorId));
  }

  async book(date: string, slot: string, doctorId?: string, notes?: string) {
    if (doctorId) {
      await this.selectDoctor(doctorId);
    }
    if (notes) {
      await this.notesInput().fill(notes);
    }
    await this.fillDate(date);
    await this.selectSlot(slot);
    await this.submit();
  }
}
