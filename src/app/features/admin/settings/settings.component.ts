import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
      
   <div style="background: white; border: 1px solid #E2E8F0; border-radius: 1rem; padding: 2rem; margin-top: 2rem;">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin-bottom: 1rem;">Documentación de la API</h2>
        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.5rem;">
          Accede a la documentación técnica de los endpoints del sistema (Swagger/OpenAPI).
        </p>
        
        <a [href]="swaggerUrl" target="_blank" 
           style="display: inline-flex; align-items: center; gap: 0.5rem; background: #2563EB; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: background 0.2s;"
           onmouseover="this.style.backgroundColor='#1D4ED8'" 
           onmouseout="this.style.backgroundColor='#2563EB'">
          <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          Abrir Swagger UI
        </a>
      </div>
      
      <div style="background: white; border: 1px solid #E2E8F0; border-radius: 1rem; padding: 2rem; margin-top: 2rem; overflow-x: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0;">Auditoría de Cambios (Update/Delete)</h2>
          <button (click)="loadAuditLogs()" style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#F1F5F9'" onmouseout="this.style.backgroundColor='#F8FAFC'">
            Actualizar
          </button>
        </div>

        <div *ngIf="loadingAudit()" style="padding: 2rem; text-align: center; color: #64748B; font-size: 0.875rem;">
          Cargando registros...
        </div>

        <table *ngIf="!loadingAudit() && auditLogs().length > 0" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8F0;">
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">ID</th>
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">Fecha</th>
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">Tabla</th>
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">Operación</th>
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">Old Data</th>
              <th style="text-align: left; padding: 0.75rem; color: #64748B; font-weight: 600;">New Data</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of auditLogs()" style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 0.75rem; color: #0F172A;">{{ log.id }}</td>
              <td style="padding: 0.75rem; color: #475569;">{{ log.createdAt | date:'short' }}</td>
              <td style="padding: 0.75rem; font-weight: 600; color: #2563EB;">{{ log.tableName }}</td>
              <td style="padding: 0.75rem;">
                <span [ngStyle]="{'background': log.operation === 'DELETE' ? '#FEE2E2' : '#FEF3C7', 'color': log.operation === 'DELETE' ? '#991B1B' : '#92400E', 'padding': '0.25rem 0.5rem', 'border-radius': '0.25rem', 'font-size': '0.75rem', 'font-weight': '700'}">
                  {{ log.operation }}
                </span>
              </td>
              <td style="padding: 0.75rem; max-width: 200px; overflow-x: auto; font-family: monospace; font-size: 0.75rem; color: #64748B; white-space: nowrap;">
                {{ log.oldData }}
              </td>
              <td style="padding: 0.75rem; max-width: 200px; overflow-x: auto; font-family: monospace; font-size: 0.75rem; color: #64748B; white-space: nowrap;">
                {{ log.newData || '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loadingAudit() && auditLogs().length === 0" style="padding: 3rem 1rem; text-align: center; color: #64748B; font-size: 0.875rem;">
          No hay registros de auditoría disponibles o el script SQL aún no se ha ejecutado en la base de datos.
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  sendEmail: boolean = true;
  savedMessage: boolean = false;
  
  auditLogs = signal<any[]>([]);
  loadingAudit = signal<boolean>(false);
  
  get swaggerUrl(): string {
    return environment.apiUrl.replace('/api', '') + '/swagger-ui/index.html';
  }
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    const saved = localStorage.getItem('admin_send_credentials_email');
    if (saved !== null) {
      this.sendEmail = saved === 'true';
    }
    this.loadAuditLogs();
  }

  loadAuditLogs() {
    this.loadingAudit.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/admin/audit`).subscribe({
      next: (data) => {
        this.auditLogs.set(data || []);
        this.loadingAudit.set(false);
      },
      error: () => {
        this.auditLogs.set([]);
        this.loadingAudit.set(false);
      }
    });
  }

  saveSettings() {
    localStorage.setItem('admin_send_credentials_email', this.sendEmail.toString());
    this.savedMessage = true;
    setTimeout(() => this.savedMessage = false, 3000);
  }
}
