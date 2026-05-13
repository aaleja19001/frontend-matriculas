import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

import { SubjectOffering } from './subject-offering.service';

export interface Enrollment {
  id?: number;
  enrollmentDate?: string;
  student?: { id: number };
  subjectOffering: SubjectOffering;
}

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
  enrollments?: Enrollment[];
  advisor?: { id?: number; login?: string; firstName?: string; lastName?: string };
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private url = `${environment.apiUrl}/appointments`;
  pendingCount = signal(0);

  constructor(private http: HttpClient) {}

  refreshPendingCount() {
    this.getAll().subscribe(data => {
      this.pendingCount.set(data.filter(a => a.status === 'PENDING').length);
    });
  }

  getAll() {
    return this.http.get<Appointment[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Appointment>(`${this.url}/${id}`);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Appointment>(`${this.url}/${id}/status`, { status });
  }

  cancel(id: number) {
    return this.http.patch<Appointment>(`${this.url}/${id}/cancel`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  create(appointment: any) {
  return this.http.post<Appointment>(this.url, appointment);
}

  update(id: number, appointment: any) {
    return this.http.put<Appointment>(`${this.url}/${id}`, appointment);
  }

getByStudent(studentId: number) {
  return this.http.get<Appointment[]>(`${this.url}/student/${studentId}`);
}

getByAdvisor(advisorId: number) {
  return this.http.get<Appointment[]>(`${this.url}/advisor/${advisorId}`);
}

}