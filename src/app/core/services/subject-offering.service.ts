import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Professor } from './professor.service';
import { Subject } from './subject.service';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export const DayOfWeekNames: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
};

export interface SubjectOffering {
  id?: number;
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek;
  semester: string;
  capacity: number;
  subject: Subject;
  professor: Professor;
  enrolledCount?: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectOfferingService {
  private url = `${environment.apiUrl}/subject-offerings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SubjectOffering[]> {
    return this.http.get<SubjectOffering[]>(this.url);
  }

  getById(id: number): Observable<SubjectOffering> {
    return this.http.get<SubjectOffering>(`${this.url}/${id}`);
  }

  create(offering: SubjectOffering): Observable<SubjectOffering> {
    return this.http.post<SubjectOffering>(this.url, offering);
  }

  update(id: number, offering: SubjectOffering): Observable<SubjectOffering> {
    return this.http.put<SubjectOffering>(`${this.url}/${id}`, offering);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
