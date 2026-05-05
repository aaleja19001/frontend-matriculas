import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Student {
  id?: number;
  firstName?: string;
  lastName?: string;
  studentCode?: string;
  nationalId?: string;
  active?: boolean;
  user?: { id: number; login?: string };
  program?: { id: number; name?: string };
}

@Injectable({ providedIn: 'root' })
export class StudentService {

  private url = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Student[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Student>(`${this.url}/${id}`);
  }

  getMe() {
    return this.http.get<Student>(`${this.url}/me`);
  }

  update(id: number, student: Student) {
    return this.http.put<Student>(`${this.url}/${id}`, student);
  }
}
