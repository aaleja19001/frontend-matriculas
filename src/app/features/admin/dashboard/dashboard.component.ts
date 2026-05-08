import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  stats = signal({ pending: 0, approved: 0, students: 0, slots: 0 });
  recentAppointments = signal<Appointment[]>([]);
  loading = signal(true);
  userName = signal('');
  currentDate = new Date();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userName.set(this.authService.currentUser()?.sub || 'Administrador');
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    // Citas y Stats
    this.http.get<Appointment[]>(`${environment.apiUrl}/appointments`).subscribe({
      next: data => {
        this.stats.update(s => ({
          ...s,
          pending: data.filter(a => a.status === 'PENDING').length,
          approved: data.filter(a => a.status === 'APPROVED').length
        }));
        // Tomar las últimas 5 citas
        this.recentAppointments.set(data.slice(-5).reverse());
      }
    });

    // Estudiantes
    this.http.get<any[]>(`${environment.apiUrl}/students`).subscribe({
      next: data => this.stats.update(s => ({ ...s, students: data.length }))
    });

    // Slots
    this.http.get<any[]>(`${environment.apiUrl}/available-slots`).subscribe({
      next: data => {
        this.stats.update(s => ({ ...s, slots: data.filter((s: any) => s.active).length }));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStudentName(appointment: Appointment) {
    if (!appointment.student) return 'Estudiante';
    return `${appointment.student.firstName} ${appointment.student.lastName}`;
  }

  formatDate(date: string | undefined) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
