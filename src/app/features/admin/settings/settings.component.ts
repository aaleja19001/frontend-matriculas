import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 64rem; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.875rem; font-weight: 800; color: #0F172A; letter-spacing: -0.025em;">Configuraciones</h1>
        <p style="font-size: 0.875rem; margin-top: 0.25rem; color: #64748B;">Ajustes generales del sistema.</p>
      </div>

      <div style="background: white; border: 1px solid #E2E8F0; border-radius: 1rem; padding: 2rem;">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin-bottom: 1.5rem;">Credenciales de Usuarios</h2>
        
        <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: #F8FAFC; border-radius: 0.75rem; border: 1px solid #F1F5F9;">
          <input type="checkbox" id="sendEmail" [(ngModel)]="sendEmail" (change)="saveSettings()"
                 style="width: 1.25rem; height: 1.25rem; margin-top: 0.25rem; cursor: pointer; accent-color: #2563EB;">
          <div>
            <label for="sendEmail" style="font-weight: 600; color: #0F172A; cursor: pointer; display: block;">
              Enviar correo de credenciales automáticamente
            </label>
            <p style="font-size: 0.875rem; color: #64748B; margin-top: 0.25rem; line-height: 1.5;">
              Si está activo, al crear un nuevo usuario (estudiante, profesor, asesor, admin) se enviará un correo con la contraseña generada.<br>
              Si está inactivo, las credenciales se mostrarán en pantalla una única vez tras su creación.
            </p>
          </div>
        </div>

        <div *ngIf="savedMessage" style="margin-top: 1rem; padding: 0.75rem; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
          <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Configuración guardada correctamente.
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  sendEmail: boolean = true;
  savedMessage: boolean = false;

  ngOnInit() {
    const saved = localStorage.getItem('admin_send_credentials_email');
    if (saved !== null) {
      this.sendEmail = saved === 'true';
    }
  }

  saveSettings() {
    localStorage.setItem('admin_send_credentials_email', this.sendEmail.toString());
    this.savedMessage = true;
    setTimeout(() => this.savedMessage = false, 3000);
  }
}
