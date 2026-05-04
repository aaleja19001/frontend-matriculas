import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectOfferingService, SubjectOffering, DayOfWeek, DayOfWeekNames } from '../../../core/services/subject-offering.service';
import { SubjectService, Subject } from '../../../core/services/subject.service';
import { ProfessorService, Professor } from '../../../core/services/professor.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offerings.component.html'
})
export class OfferingsComponent implements OnInit {

  offerings = signal<SubjectOffering[]>([]);
  subjects = signal<Subject[]>([]);
  professors = signal<Professor[]>([]);
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  
  DayOfWeekNames = DayOfWeekNames;
  daysOfWeek: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  form = {
    subjectId: null as number | null,
    professorId: null as number | null,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '',
    endTime: '',
    semester: '2024-1',
    capacity: 30
  };

  constructor(
    private offeringService: SubjectOfferingService,
    private subjectService: SubjectService,
    private professorService: ProfessorService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      offerings: this.offeringService.getAll(),
      subjects: this.subjectService.getAll(),
      professors: this.professorService.getAll()
    }).subscribe({
      next: ({ offerings, subjects, professors }) => {
        this.offerings.set(offerings);
        this.subjects.set(subjects);
        this.professors.set(professors);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { 
      subjectId: null, 
      professorId: null, 
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '', 
      endTime: '', 
      semester: '2024-1', 
      capacity: 30 
    };
    this.showModal.set(true);
  }

  openEdit(offering: SubjectOffering) {
    this.editingId.set(offering.id!);
    this.form = {
      subjectId: offering.subject.id!,
      professorId: offering.professor.id!,
      dayOfWeek: offering.dayOfWeek,
      startTime: offering.startTime.substring(0, 16),
      endTime: offering.endTime.substring(0, 16),
      semester: offering.semester,
      capacity: offering.capacity
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
    if (!this.form.subjectId || !this.form.professorId || !this.form.startTime || !this.form.endTime) return;
    
    this.saving.set(true);
    const payload: any = {
      dayOfWeek: this.form.dayOfWeek,
      startTime: `${this.form.startTime}:00Z`,
      endTime: `${this.form.endTime}:00Z`,
      semester: this.form.semester,
      capacity: this.form.capacity,
      subject: { id: this.form.subjectId },
      professor: { id: this.form.professorId }
    };

    if (this.editingId()) {
      payload.id = this.editingId()!;
      this.offeringService.update(this.editingId()!, payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving.set(false); },
        error: () => this.saving.set(false)
      });
    } else {
      this.offeringService.create(payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving.set(false); },
        error: () => this.saving.set(false)
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;
    this.offeringService.delete(id).subscribe({
      next: () => this.loadData(),
      error: () => alert('Error al eliminar la oferta.')
    });
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
}
