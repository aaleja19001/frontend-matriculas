import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="min-height: 100vh; background-color: #F8FAFC;">
      
      <!-- Navbar -->
      <nav style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40;">
        
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 2rem; height: 2rem; background-color: #2563EB; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 1rem; height: 1rem; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <span style="font-size: 0.875rem; font-weight: 700; color: #0F172A;">Matricula<span style="color: #2563EB;">+</span></span>
        </div>

        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <a routerLink="/student/dashboard" routerLinkActive="active-nav"
             style="font-size: 0.875rem; font-weight: 500; color: #64748B; text-decoration: none;">
            Mis citas
          </a>
          <a routerLink="/student/request" routerLinkActive="active-nav"
             style="font-size: 0.875rem; font-weight: 500; color: #64748B; text-decoration: none;">
            Solicitar cita
          </a>
          <a routerLink="/student/profile" routerLinkActive="active-nav"
             style="font-size: 0.875rem; font-weight: 500; color: #64748B; text-decoration: none;">
            Mi Perfil
          </a>
          <div style="display: flex; align-items: center; gap: 0.75rem; padding-left: 1rem; border-left: 1px solid #E2E8F0;">
            <div style="width: 2rem; height: 2rem; background-color: #EEF2FF; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 0.75rem; font-weight: 600; color: #2563EB;">
                {{ authService.currentUser()?.sub?.charAt(0)?.toUpperCase() }}
              </span>
            </div>
            <span style="font-size: 0.875rem; color: #0F172A; font-weight: 500;">{{ authService.currentUser()?.sub }}</span>
            <button (click)="logout()"
                    style="font-size: 0.75rem; color: #64748B; background: none; border: none; cursor: pointer;">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <!-- Contenido -->
      <main style="max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem;">
        <router-outlet />
      </main>

      <style>
        .active-nav {
          color: #2563EB !important;
          font-weight: 600 !important;
        }
      </style>
    </div>
  `
})
export class StudentLayoutComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
