import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Subject {
  id?: number;
  name: string;
  code: string;
  credits: number;
  programs?: any[];
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private url = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.url);
  }

  getById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.url}/${id}`);
  }

  create(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.url, subject);
  }

  update(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.url}/${id}`, subject);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}