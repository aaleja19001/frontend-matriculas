import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id?: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<AdminUser[]>(this.url);
  }

  get(login: string) {
    return this.http.get<AdminUser>(`${this.url}/${login}`);
  }

  create(user: AdminUser, sendEmail: boolean = true) {
    return this.http.post<AdminUser>(`${this.url}?sendEmail=${sendEmail}`, user);
  }

  update(login: string, user: AdminUser) {
    return this.http.put<AdminUser>(`${this.url}/${login}`, user);
  }

  delete(login: string) {
    return this.http.delete(`${this.url}/${login}`);
  }
}
