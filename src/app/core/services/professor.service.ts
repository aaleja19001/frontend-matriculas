import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Professor {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfessorService {
  private url = `${environment.apiUrl}/professors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.url);
  }

  getById(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.url}/${id}`);
  }

  create(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.url, professor);
  }

  update(id: number, professor: Professor): Observable<Professor> {
    return this.http.put<Professor>(`${this.url}/${id}`, professor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
