import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, AppointmentService } from '../../../core/services/appointment.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html'
})
export class StudentDashboardComponent implements OnInit {

  appointments: Appointment[] = [];
  loading = false;

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    RESCHEDULED: 'Reprogramada',
    CANCELLED: 'Cancelada'
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

 loadAppointments() {
  this.loading = true;
  this.studentService.getMe().subscribe({
    next: student => {
      this.appointmentService.getByStudent(student.id!).subscribe({
        next: data => {
          this.appointments = [...data];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
    },
    error: () => { this.loading = false; this.cdr.detectChanges(); }
  });
}

  formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  getStatusColor(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'background-color: #FEF3C7; color: #D97706;',
      APPROVED: 'background-color: #D1FAE5; color: #059669;',
      REJECTED: 'background-color: #FEE2E2; color: #DC2626;',
      RESCHEDULED: 'background-color: #DBEAFE; color: #2563EB;',
      CANCELLED: 'background-color: #F1F5F9; color: #64748B;'
    };
    return colors[status] || '';
  }

  get pending() { return this.appointments.filter(a => a.status === 'PENDING').length; }
  get approved() { return this.appointments.filter(a => a.status === 'APPROVED').length; }
  get rejected() { return this.appointments.filter(a => a.status === 'REJECTED').length; }

  cancelAppointment(appointment: Appointment) {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      this.appointmentService.cancel(appointment.id!).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (err) => {
          alert('Error al cancelar la cita: ' + (err.error?.detail || err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  canCancel(appointment: Appointment) {
    return appointment.status !== 'CANCELLED';
  }
}