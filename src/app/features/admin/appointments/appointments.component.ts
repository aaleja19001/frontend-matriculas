import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html'
})
export class AppointmentsComponent implements OnInit {

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  selected = signal<Appointment | null>(null);
  processingId = signal<number | null>(null);

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    RESCHEDULED: 'Reprogramada',
    CANCELLED: 'Cancelada'
  };

  constructor(
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);
    this.appointmentService.getAll().subscribe({
      next: data => {
        this.appointments.set([...data]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('error:', err);
        this.loading.set(false);
      }
    });
  }

  openDetail(appointment: Appointment) {
    this.selected.set(appointment);
  }

  closeDetail() {
    this.selected.set(null);
  }

  approve(id: number) {
    this.processingId.set(id);
    this.appointmentService.updateStatus(id, 'APPROVED').subscribe({
      next: () => { 
        this.loadAppointments(); 
        this.closeDetail(); 
        this.processingId.set(null); 
      },
      error: () => this.processingId.set(null)
    });
  }

  reject(id: number) {
    this.processingId.set(id);
    this.appointmentService.updateStatus(id, 'REJECTED').subscribe({
      next: () => { 
        this.loadAppointments(); 
        this.closeDetail(); 
        this.processingId.set(null); 
      },
      error: () => this.processingId.set(null)
    });
  }

  formatDate(date: string | undefined) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  getStudentName(appointment: Appointment) {
    if (!appointment.student) return '—';
    return `${appointment.student.firstName} ${appointment.student.lastName}`;
  }
}