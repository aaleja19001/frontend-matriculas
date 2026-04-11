import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AvailableSlotService, AvailableSlot } from '../../../core/services/available-slot.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { StudentService, Student } from '../../../core/services/student.service';
import { SubjectService, Subject } from '../../../core/services/subject.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-request-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './request-appointment.component.html'
})
export class RequestAppointmentComponent implements OnInit {

  slots: AvailableSlot[] = [];
  subjects: Subject[] = [];
  student: Student | null = null;
  selectedSubjects: number[] = [];
  loading = false;
  saving = false;
  success = false;
  error = '';

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
    private subjectService: SubjectService,
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
        forkJoin({
          slots: this.slotService.getAll(),
          subjects: this.subjectService.getAll()
        }).subscribe({
          next: ({ slots, subjects }) => {
            this.slots = slots.filter(s => s.active && (s.bookedSpots ?? 0) < s.availableSpots);
            this.subjects = subjects;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

 toggleSubject(id: number) {
  const idx = this.selectedSubjects.indexOf(id);
  if (idx === -1) {
    this.selectedSubjects = [...this.selectedSubjects, id];
  } else {
    this.selectedSubjects = this.selectedSubjects.filter(s => s !== id);
  }
  this.cdr.detectChanges();
}
  isSelected(id: number) {
    return this.selectedSubjects.includes(id);
  }

  formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
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
      desiredSubjects: this.selectedSubjects.map(id => ({ id }))
    };

    this.appointmentService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.success = true;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/student/dashboard']), 2000);
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al crear la cita. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}