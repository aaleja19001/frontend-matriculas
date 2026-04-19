import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Subject } from './subject.service';

export interface Program {
  id?: number;
  name: string;
  codePrefix: string;
  subjects?: Subject[];
}

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private url = `${environment.apiUrl}/programs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Program[]> {
    return this.http.get<Program[]>(this.url);
  }

  getById(id: number): Observable<Program> {
    return this.http.get<Program>(`${this.url}/${id}`);
  }

  create(program: Program): Observable<Program> {
    return this.http.post<Program>(this.url, program);
  }

  update(id: number, program: Program): Observable<Program> {
    return this.http.put<Program>(`${this.url}/${id}`, program);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
