import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-5 mb-8">
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Citas pendientes</span>
            <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.pending }}</p>
          <p class="text-xs text-amber-500 mt-1">Por revisar</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aprobadas</span>
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.approved }}</p>
          <p class="text-xs text-green-500 mt-1">Este período</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estudiantes</span>
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.students }}</p>
          <p class="text-xs text-indigo-500 mt-1">Registrados</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Slots activos</span>
            <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.slots }}</p>
          <p class="text-xs text-purple-500 mt-1">Disponibles</p>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {

  stats = { pending: 0, approved: 0, students: 0, slots: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any[]>(`${environment.apiUrl}/appointments`).subscribe({
      next: data => {
        this.stats.pending = data.filter(a => a.status === 'PENDING').length;
        this.stats.approved = data.filter(a => a.status === 'APPROVED').length;
      }
    });
    this.http.get<any[]>(`${environment.apiUrl}/students`).subscribe({
      next: data => this.stats.students = data.length
    });
    this.http.get<any[]>(`${environment.apiUrl}/available-slots`).subscribe({
      next: data => this.stats.slots = data.filter((s: any) => s.active).length
    });
  }
}