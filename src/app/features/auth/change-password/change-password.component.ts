import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
  template: `
    <div style="min-height: 100vh; background: #0F172A; display: flex; align-items: center; justify-content: center; padding: 1.5rem; position: relative; overflow: hidden;">
      
      <!-- Blobs decorativos -->
      <div style="position: absolute; top: -10%; right: -10%; width: 40rem; height: 40rem; background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%); filter: blur(60px); pointer-events: none;"></div>
      <div style="position: absolute; bottom: -10%; left: -10%; width: 35rem; height: 35rem; background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%); filter: blur(60px); pointer-events: none;"></div>

      <div style="width: 100%; max-width: 28rem; position: relative; z-index: 10;">
        
        <div style="background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 2rem; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <div style="text-align: center; margin-bottom: 2.5rem;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #2563EB, #1D4ED8); border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; transform: rotate(-6deg); box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.5);">
              <svg style="width: 2rem; height: 2rem; color: white; transform: rotate(6deg);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 style="color: white; font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 0.5rem;">Cambia tu Contraseña</h1>
            <p style="color: #94A3B8; font-size: 0.875rem; line-height: 1.5;">Por seguridad, debes actualizar tu contraseña temporal antes de continuar.</p>
          </div>

          <form (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label style="color: #94A3B8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 0.25rem;">Contraseña Actual</label>
              <div style="position: relative;">
                <input [type]="showCurrent ? 'text' : 'password'" [(ngModel)]="currentPassword" name="currentPassword" required
                       style="width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 0.875rem 1.25rem; color: white; font-size: 0.875rem; outline: none; transition: all 0.2s; box-sizing: border-box;"
                       placeholder="Ingresa tu contraseña temporal"
                       appMaxLength="password">
                <button type="button" (click)="showCurrent = !showCurrent" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748B; cursor: pointer; padding: 0.25rem;">
                  <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="!showCurrent" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path *ngIf="showCurrent" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label style="color: #94A3B8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 0.25rem;">Nueva Contraseña</label>
              <input [type]="showNew ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" required
                     style="width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 0.875rem 1.25rem; color: white; font-size: 0.875rem; outline: none; transition: all 0.2s; box-sizing: border-box;"
                     placeholder="Mínimo 8 caracteres"
                     appMaxLength="password">
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label style="color: #94A3B8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 0.25rem;">Confirmar Nueva Contraseña</label>
              <input [type]="showNew ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" required
                     style="width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 0.875rem 1.25rem; color: white; font-size: 0.875rem; outline: none; transition: all 0.2s; box-sizing: border-box;"
                     placeholder="Repite la nueva contraseña"
                     appMaxLength="password">
            </div>

            <div *ngIf="error()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.75rem; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
              <svg style="width: 1.25rem; height: 1.25rem; color: #EF4444; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p style="color: #FCA5A5; font-size: 0.875rem;">{{ error() }}</p>
            </div>

            <button type="submit" [disabled]="loading() || !currentPassword || !newPassword || !confirmPassword"
                    style="margin-top: 1rem; background: #2563EB; color: white; border: none; border-radius: 1rem; padding: 1rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); display: flex; align-items: center; justify-content: center; gap: 0.75rem;"
                    onmouseover="this.style.backgroundColor='#1D4ED8'; this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.backgroundColor='#2563EB'; this.style.transform='translateY(0)'">
              <span *ngIf="!loading()">Actualizar y Continuar</span>
              <svg *ngIf="loading()" style="animation: spin 1s linear infinite; width: 1.25rem; height: 1.25rem;" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </button>
          </form>

        </div>
      </div>
    </div>

    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
  `
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  error = signal('');
  loading = signal(false);
  showCurrent = false;
  showNew = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }
    if (this.newPassword.length < 8) {
      this.error.set('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
      }
    });
  }
}
