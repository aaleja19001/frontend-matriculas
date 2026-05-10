import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { MaxLengthDirective } from '../../../../shared/directives/max-length.directive';

@Component({
  selector: 'app-advisor-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaxLengthDirective],
  template: `
    <div class="max-w-md mx-auto">
      <!-- Header -->
      <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
        <button routerLink="/advisor/profile" 
                style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px; border: 1px solid #E2E8F0; background: white; color: #64748B; cursor: pointer;">
          <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">Cambiar Contraseña</h1>
          <p style="font-size: 0.875rem; color: #64748B; margin-top: 0.25rem;">Actualiza tus credenciales de acceso</p>
        </div>
      </div>

      <!-- Content -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 1rem; padding: 2rem;">
        
        <form (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Alert Message -->
          <div *ngIf="message().text" 
               [style]="message().type === 'success' ? 'background-color: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0;' : 'background-color: #FEE2E2; color: #991B1B; border: 1px solid #FECACA;'"
               style="padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500;">
            {{ message().text }}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.875rem; font-weight: 600; color: #334155;">Contraseña Actual</label>
            <input type="password" [(ngModel)]="currentPassword" name="currentPassword" required
                   style="padding: 0.625rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; font-size: 0.875rem; outline: none;"
                   appMaxLength="password">
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.875rem; font-weight: 600; color: #334155;">Nueva Contraseña</label>
            <input type="password" [(ngModel)]="newPassword" name="newPassword" required
                   style="padding: 0.625rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; font-size: 0.875rem; outline: none;"
                   placeholder="Mínimo 8 caracteres"
                   appMaxLength="password">
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.875rem; font-weight: 600; color: #334155;">Confirmar Nueva Contraseña</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required
                   style="padding: 0.625rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; font-size: 0.875rem; outline: none;"
                   appMaxLength="password">
          </div>

          <div style="margin-top: 1rem; display: flex; justify-content: flex-end; gap: 1rem;">
            <button type="button" routerLink="/advisor/profile"
                    style="padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; background: white; color: #64748B; font-size: 0.875rem; font-weight: 600; cursor: pointer;">
              Cancelar
            </button>
            <button type="submit" [disabled]="loading() || !currentPassword || !newPassword || !confirmPassword"
                    style="padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; background: #10B981; color: white; font-size: 0.875rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
              <svg *ngIf="loading()" style="animation: spin 1s linear infinite; width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ loading() ? 'Actualizando...' : 'Cambiar Contraseña' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
  `
})
export class AdvisorChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  message = signal({ text: '', type: '' });

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.message.set({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (this.newPassword.length < 8) {
      this.message.set({ text: 'La nueva contraseña debe tener al menos 8 caracteres', type: 'error' });
      return;
    }

    this.loading.set(true);
    this.message.set({ text: '', type: '' });

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set({ text: 'Contraseña actualizada con éxito', type: 'success' });
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.router.navigate(['/advisor/profile']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.message.set({ 
          text: err.error?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.', 
          type: 'error' 
        });
      }
    });
  }
}
