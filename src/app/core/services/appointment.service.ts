import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Appointment {
  id?: number;
  currentCredits: number;
  currentSchedule?: string;
  status: string;
  requestDate?: string;
  responseDate?: string;
  notes?: string;
  student?: { id: number; firstName?: string; lastName?: string; studentCode?: string };
  availableSlot?: { id: number; startTime?: string; endTime?: string };
  desiredSubjects?: { id: number; name?: string; code?: string }[];
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private url = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Appointment[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Appointment>(`${this.url}/${id}`);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Appointment>(`${this.url}/${id}/status`, { status });
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  create(appointment: any) {
  return this.http.post<Appointment>(this.url, appointment);
}

getByStudent(studentId: number) {
  return this.http.get<Appointment[]>(`${this.url}/student/${studentId}`);
}

}