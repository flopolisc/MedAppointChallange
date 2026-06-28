import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { BookAppointmentPage } from '../pages/book-appointment.page';
import { AppointmentsPage } from '../pages/appointments.page';
import type { Appointment } from '../helpers/api';
import { env } from '../helpers/env';

test.describe('Book appointment', () => {
  test('should book a new appointment from the dashboard', async ({ page, api }) => {
    const dashboardPage = new DashboardPage(page);
    const bookPage = new BookAppointmentPage(page);
    const appointmentsPage = new AppointmentsPage(page);
    const bookDate = env.bookDate;
    const bookSlot = env.bookSlot;
    const bookNotes = `Follow-up visit - ${Date.now()}`;

    const doctor = await api.findDoctorByName(env.bookDoctorName);
    let postResponseBody: Appointment | undefined;

    await page.route('**/appointments', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      postResponseBody = await response.json();
      await route.fulfill({ response });
    });

    await test.step('patient opens the dashboard', async () => {
      await dashboardPage.goto();
      await expect(dashboardPage.newAppointmentLink()).toBeVisible();
    });

    await test.step('patient starts booking from the dashboard', async () => {
      await dashboardPage.openNewAppointment();
      await bookPage.waitForForm();
    });

    await test.step('patient selects doctor, date, time and confirms', async () => {
      await bookPage.book(bookDate, bookSlot, String(doctor.id), bookNotes);
      await expect(bookPage.successMessage()).toBeVisible({ timeout: 15000 });
    });

    await test.step('booking response returns the submitted appointment details', async () => {
      expect(postResponseBody).toBeDefined();
      expect(postResponseBody!.doctor_id).toBe(doctor.id);
      expect(api.normalizeDate(postResponseBody!.appointment_date)).toBe(bookDate);
      expect(postResponseBody!.time_slot).toBe(bookSlot);
      expect(postResponseBody!.notes).toBe(bookNotes);
    });

    await test.step('appointments list shows the new booking with the selected date and time', async () => {
      await appointmentsPage.goto();
      await appointmentsPage.waitForAppointmentByNotes(bookNotes);

      const expectedLabel = api.formatUiAppointmentLabel(bookDate, bookSlot);
      await expect(appointmentsPage.appointmentDateTimeByNotes(bookNotes)).toHaveText(expectedLabel);
    });
  });
});
