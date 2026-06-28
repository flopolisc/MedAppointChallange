import { APIRequestContext } from '@playwright/test';
import { env } from './env';

export type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  time_slot: string;
  status: string;
  notes: string | null;
};

export type Doctor = {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type CreateAppointmentInput = {
  doctor_id: number;
  appointment_date: string;
  time_slot: string;
  notes?: string;
};

export class ApiHelper {
  constructor(
    private readonly request: APIRequestContext,
    private token: string,
  ) {}

  private authHeaders() {
    if (!this.token) {
      throw new Error('API session token is missing');
    }
    return { Authorization: `Bearer ${this.token}` };
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const response = await this.request.post(`${env.apiUrl}/appointments`, {
      headers: this.authHeaders(),
      data: input,
    });
    if (!response.ok()) {
      throw new Error(`POST appointments failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async findDoctorByName(name: string): Promise<Doctor> {
    const response = await this.request.get(`${env.apiUrl}/doctors`, {
      headers: this.authHeaders(),
    });
    if (!response.ok()) {
      throw new Error(`GET doctors failed: ${response.status()}`);
    }

    const doctors: Doctor[] = await response.json();
    const normalized = name.toLowerCase();
    const doctor = doctors.find((d) =>
      `${d.first_name} ${d.last_name}`.toLowerCase().includes(normalized),
    );
    if (!doctor) {
      throw new Error(`Doctor not found: ${name}`);
    }
    return doctor;
  }

  normalizeDate(isoDate: string): string {
    return isoDate.slice(0, 10);
  }

  formatUiAppointmentLabel(isoDate: string, slot: string): string {
    const [year, month, day] = this.normalizeDate(isoDate).split('-');
    return `${Number(month)}/${Number(day)}/${year} • ${slot}`;
  }
}
