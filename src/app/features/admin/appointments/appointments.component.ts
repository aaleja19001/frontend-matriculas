import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppointmentsComponent implements OnInit {

  appointments: Appointment[] = [];
  loading = false;
  selected: Appointment | null = null;
  processing: number | null = null;

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    RESCHEDULED: 'Reprogramada',
    CANCELLED: 'Cancelada'
  };

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: data => {
        this.appointments = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

 openDetail(appointment: Appointment) {
  console.log('openDetail:', appointment);
  this.selected = appointment;
  this.cdr.detectChanges();
}

  closeDetail() {
  this.selected = null;
  this.cdr.detectChanges();
}

  approve(id: number) {
    this.processing = id;
    this.appointmentService.updateStatus(id, 'APPROVED').subscribe({
      next: () => { this.loadAppointments(); this.closeDetail(); this.processing = null; },
      error: () => this.processing = null
    });
  }

  reject(id: number) {
    this.processing = id;
    this.appointmentService.updateStatus(id, 'REJECTED').subscribe({
      next: () => { this.loadAppointments(); this.closeDetail(); this.processing = null; },
      error: () => this.processing = null
    });
  }

  formatDate(date: string) {
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