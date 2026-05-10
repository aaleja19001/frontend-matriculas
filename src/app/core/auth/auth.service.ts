import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'kimsa_token';
  private readonly USER_KEY = 'kimsa_user';

  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<any>(this.getSavedUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string, mustChangePassword: boolean }>(`${environment.apiUrl}/authenticate`, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        const payload = this.decodeToken(response.token);
        const userData = { ...payload, mustChangePassword: response.mustChangePassword };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        this.isAuthenticated.set(true);
        this.currentUser.set(userData);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post(`${environment.apiUrl}/account/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          user.mustChangePassword = false;
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUser.set({ ...user });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  requestReset(email: string) {
    return this.http.post(`${environment.apiUrl}/account/reset-password/init`, email, { responseType: 'text' });
  }

  completeReset(key: string, newPassword: string) {
    return this.http.post(`${environment.apiUrl}/account/reset-password/finish`, { key, newPassword });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    const user = this.getSavedUser();
    return user?.auth?.includes('ROLE_ADMIN') ?? false;
  }

  private getSavedUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}