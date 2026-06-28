import { test, expect } from '../fixtures/auth.fixture';
import { AppointmentsPage } from '../pages/appointments.page';
import type { Appointment } from '../helpers/api';
import { env } from '../helpers/env';

test.describe('Reschedule appointment', () => {
  test('should reschedule an existing appointment to a new slot', async ({ page, api }) => {
    const appointmentsPage = new AppointmentsPage(page);
    const targetDate = env.rescheduleDate;
    const targetSlot = env.rescheduleSlot;
    const originalDate = '2028-04-20';
    const originalSlot = '15:30';
    const appointmentNotes = `Cardiology follow-up - ${Date.now()}`;

    const doctor = await api.findDoctorByName(env.bookDoctorName);
    let appointment: Appointment;
    let putResponseBody: { appointment?: Appointment } | undefined;

    await page.route('**/appointments/*/reschedule', async (route) => {
      const response = await route.fetch();
      putResponseBody = await response.json();
      await route.fulfill({ response });
    });

    await test.step('patient has an upcoming appointment', async () => {
      appointment = await api.createAppointment({
        doctor_id: doctor.id,
        appointment_date: originalDate,
        time_slot: originalSlot,
        notes: appointmentNotes,
      });

      expect(api.normalizeDate(appointment.appointment_date)).toBe(originalDate);
      expect(appointment.time_slot).toBe(originalSlot);
    });

    await test.step('patient opens the appointments list', async () => {
      await appointmentsPage.goto();
      await appointmentsPage.waitForAppointmentByNotes(appointmentNotes);
    });

    await test.step('patient selects a new date and time', async () => {
      await appointmentsPage.rescheduleAppointment(appointment!, targetDate, targetSlot);
      await expect(appointmentsPage.successBanner()).toBeVisible();
    });

    await test.step('save response returns the rescheduled date and time', async () => {
      expect(putResponseBody?.appointment).toBeDefined();
      expect.soft(api.normalizeDate(putResponseBody!.appointment!.appointment_date)).toBe(targetDate);
      expect.soft(putResponseBody!.appointment!.time_slot).toBe(targetSlot);
    });

    await test.step('appointments list shows the rescheduled date and time after reload', async () => {
      const expectedLabel = api.formatUiAppointmentLabel(targetDate, targetSlot);

      await page.reload();
      await appointmentsPage.waitForListLoaded();
      await appointmentsPage.waitForAppointmentByNotes(appointmentNotes);

      await expect(appointmentsPage.appointmentDateTimeByNotes(appointmentNotes)).toHaveText(
        expectedLabel,
      );
    });
  });
});
