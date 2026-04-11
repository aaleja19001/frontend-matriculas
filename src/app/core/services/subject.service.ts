import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Subject {
  id?: number;
  name?: string;
  code?: string;
  credits?: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private url = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Subject[]>(this.url);
  }
}