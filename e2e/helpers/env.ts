function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://light-it-qa-challenge.vercel.app',
  apiUrl: process.env.API_URL ?? 'https://qa-challenge-backend.vercel.app/api',
  patientEmail: required('PATIENT_EMAIL'),
  patientPassword: required('PATIENT_PASSWORD'),
  rescheduleDate: process.env.RESCHEDULE_DATE ?? '2026-12-01',
  rescheduleSlot: process.env.RESCHEDULE_SLOT ?? '09:00',
  doctorName: process.env.DOCTOR_NAME ?? 'Ana García',
};
