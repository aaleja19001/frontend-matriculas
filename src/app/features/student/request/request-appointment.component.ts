import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AvailableSlot, AvailableSlotService } from '../../../core/services/available-slot.service';
import { Student, StudentService } from '../../../core/services/student.service';
import { DayOfWeek, DayOfWeekNames, SubjectOffering, SubjectOfferingService } from '../../../core/services/subject-offering.service';

@Component({
  selector: 'app-request-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './request-appointment.component.html'
})
export class RequestAppointmentComponent implements OnInit {

  slots: AvailableSlot[] = [];
  offerings: SubjectOffering[] = [];
  student: Student | null = null;
  selectedOfferings: number[] = [];
  loading = false;
  saving = false;
  success = false;
  error = '';
  
  DayOfWeekNames = DayOfWeekNames;
  daysOfWeek: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  form = {
    slotId: null as number | null,
    currentCredits: 0,
    currentSchedule: '',
    notes: ''
  };

  constructor(
    private slotService: AvailableSlotService,
    private appointmentService: AppointmentService,
    private studentService: StudentService,
    private offeringService: SubjectOfferingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.studentService.getMe().subscribe({
      next: student => {
        this.student = student;
        // Check if student already has active appointments
        this.appointmentService.getByStudent(student.id!).subscribe({
          next: appointments => {
            const activeAppointments = appointments.filter(a => a.status !== 'CANCELLED');
            if (activeAppointments.length > 0) {
              this.error = 'Ya tienes una cita activa. No puedes programar más de una cita a la vez.';
              this.loading = false;
              this.cdr.detectChanges();
              return;
            }
            
            forkJoin({
              slots: this.slotService.getAll(),
              offerings: this.offeringService.getAll()
            }).subscribe({
              next: ({ slots, offerings }) => {
                this.slots = slots.filter(s => s.active && (s.bookedSpots ?? 0) < s.availableSpots);
                this.offerings = offerings;
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: () => { this.loading = false; this.cdr.detectChanges(); }
            });
          },
          error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

 toggleOffering(id: number) {
  const idx = this.selectedOfferings.indexOf(id);
  if (idx === -1) {
    if (this.selectedOfferings.length >= 7) {
      this.error = 'No puedes seleccionar más de 7 materias.';
      return;
    }

    const newOffering = this.offerings.find(o => o.id === id);
    if (newOffering) {
      // Validar cupos
      if ((newOffering.enrolledCount ?? 0) >= newOffering.capacity) {
        this.error = `La materia ${newOffering.subject.name} no tiene cupos disponibles.`;
        return;
      }

      // Validar choques de horario
      const conflict = this.checkConflicts(newOffering);
      if (conflict) {
        this.error = `Conflicto de horario entre ${newOffering.subject.name} y ${conflict.subject.name}`;
        return;
      }
    }

    this.error = '';
    this.selectedOfferings = [...this.selectedOfferings, id];
  } else {
    this.selectedOfferings = this.selectedOfferings.filter(s => s !== id);
    this.error = '';
  }
  this.cdr.detectChanges();
}

  checkConflicts(newOffering: SubjectOffering): SubjectOffering | null {
    const selected = this.offerings.filter(o => this.selectedOfferings.includes(o.id!));
    for (const s of selected) {
      // Solo verificar conflictos si son el mismo día
      if (s.dayOfWeek === newOffering.dayOfWeek && this.isOverlapping(newOffering, s)) {
        return s;
      }
    }
    return null;
  }

  isOverlapping(o1: SubjectOffering, o2: SubjectOffering): boolean {
    // Extraer solo la hora de startTime y endTime
    const s1Time = this.getTimeInMinutes(o1.startTime);
    const e1Time = this.getTimeInMinutes(o1.endTime);
    const s2Time = this.getTimeInMinutes(o2.startTime);
    const e2Time = this.getTimeInMinutes(o2.endTime);
    return s1Time < e2Time && s2Time < e1Time;
  }

  getTimeInMinutes(dateString: string): number {
    const date = new Date(dateString);
    return date.getHours() * 60 + date.getMinutes();
  }

  getOfferingsByDay(day: DayOfWeek): SubjectOffering[] {
    return this.offerings.filter(o => o.dayOfWeek === day);
  }

  isSelected(id: number) {
    return this.selectedOfferings.includes(id);
  }

  formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  formatTime(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      timeStyle: 'short'
    });
  }

  formatTimeRange(startTime: string, endTime: string) {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  submit() {
    if (!this.form.slotId) {
      this.error = 'Selecciona un slot disponible';
      return;
    }
    if (!this.form.currentCredits || this.form.currentCredits <= 0) {
      this.error = 'Ingresa tus créditos actuales';
      return;
    }
    if (this.selectedOfferings.length === 0) {
      this.error = 'Debes seleccionar al menos una materia';
      return;
    }
    if (!this.student?.id) {
      this.error = 'No se encontró tu perfil de estudiante';
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = {
      currentCredits: this.form.currentCredits,
      currentSchedule: this.form.currentSchedule,
      notes: this.form.notes,
      status: 'PENDING',
      requestDate: new Date().toISOString(),
      availableSlot: { id: this.form.slotId },
      student: { id: this.student.id },
      enrollments: this.selectedOfferings.map(id => ({
        subjectOffering: { id }
      }))
    };

    this.appointmentService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.success = true;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/student/dashboard']), 2000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.detail || err.error?.message || 'Error al crear la cita. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}