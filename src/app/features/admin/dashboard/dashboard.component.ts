import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-blue-700">Panel Administrador</h1>
          <button
            (click)="logout()"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
        <div class="grid grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl shadow text-center">
            <h2 class="text-lg font-semibold text-gray-700">Citas pendientes</h2>
            <p class="text-4xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow text-center">
            <h2 class="text-lg font-semibold text-gray-700">Estudiantes</h2>
            <p class="text-4xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow text-center">
            <h2 class="text-lg font-semibold text-gray-700">Slots disponibles</h2>
            <p class="text-4xl font-bold text-blue-600 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }
}