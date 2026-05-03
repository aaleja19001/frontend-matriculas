import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  offerings: SubjectOffering[] = [];
  subjects: Subject[] = [];
  professors: Professor[] = [];
  loading = false;
  showModal = false;
  saving = false;
  editingId: number | null = null;
  
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
    private professorService: ProfessorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      offerings: this.offeringService.getAll(),
      subjects: this.subjectService.getAll(),
      professors: this.professorService.getAll()
    }).subscribe({
      next: ({ offerings, subjects, professors }) => {
        this.offerings = offerings;
        this.subjects = subjects;
        this.professors = professors;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = { 
      subjectId: null, 
      professorId: null, 
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '', 
      endTime: '', 
      semester: '2024-1', 
      capacity: 30 
    };
    this.showModal = true;
  }

  openEdit(offering: SubjectOffering) {
    this.editingId = offering.id!;
    this.form = {
      subjectId: offering.subject.id!,
      professorId: offering.professor.id!,
      dayOfWeek: offering.dayOfWeek,
      startTime: offering.startTime.substring(0, 16),
      endTime: offering.endTime.substring(0, 16),
      semester: offering.semester,
      capacity: offering.capacity
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  save() {
    if (!this.form.subjectId || !this.form.professorId || !this.form.startTime || !this.form.endTime) return;
    
    this.saving = true;
    const payload: any = {
      dayOfWeek: this.form.dayOfWeek,
      startTime: `${this.form.startTime}:00Z`,
      endTime: `${this.form.endTime}:00Z`,
      semester: this.form.semester,
      capacity: this.form.capacity,
      subject: { id: this.form.subjectId },
      professor: { id: this.form.professorId }
    };

    if (this.editingId) {
      payload.id = this.editingId;
      this.offeringService.update(this.editingId, payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving = false; },
        error: () => this.saving = false
      });
    } else {
      this.offeringService.create(payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving = false; },
        error: () => this.saving = false
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
}
