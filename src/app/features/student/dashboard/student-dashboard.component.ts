import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, AppointmentService } from '../../../core/services/appointment.service';
import { StudentService } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html'
})
export class StudentDashboardComponent implements OnInit {

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  studentName = signal('');

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    RESCHEDULED: 'Reprogramada',
    CANCELLED: 'Cancelada'
  };

  pending = computed(() => this.appointments().filter(a => a.status === 'PENDING').length);
  approved = computed(() => this.appointments().filter(a => a.status === 'APPROVED').length);
  total = computed(() => this.appointments().length);

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.studentName.set(this.authService.currentUser()?.sub || 'Estudiante');
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);
    this.studentService.getMe().subscribe({
      next: student => {
        this.appointmentService.getByStudent(student.id!).subscribe({
          next: data => {
            this.appointments.set([...data]);
            this.loading.set(false);
          },
          error: () => { 
            this.toast.error('Error al cargar tus citas');
            this.loading.set(false); 
          }
        });
      },
      error: () => { 
        this.toast.error('Error al identificar tu perfil');
        this.loading.set(false); 
      }
    });
  }

  formatDate(date: string | undefined) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  cancelAppointment(appointment: Appointment) {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      this.appointmentService.cancel(appointment.id!).subscribe({
        next: () => {
          this.toast.success('Cita cancelada correctamente');
          this.loadAppointments();
          this.appointmentService.refreshPendingCount();
        },
        error: (err) => {
          const msg = err.error?.detail || err.error?.message || 'Error desconocido';
          this.toast.error('No se pudo cancelar: ' + msg);
        }
      });
    }
  }

  canCancel(appointment: Appointment) {
    return appointment.status === 'PENDING';
  }
}
