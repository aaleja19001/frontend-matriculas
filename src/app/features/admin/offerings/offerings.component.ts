import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Professor, ProfessorService } from '../../../core/services/professor.service';
import { DayOfWeek, DayOfWeekNames, SubjectOffering, SubjectOfferingService } from '../../../core/services/subject-offering.service';
import { Subject, SubjectService } from '../../../core/services/subject.service';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
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
  validationErrors: { [key: string]: string } = {};
  
  DayOfWeekNames = DayOfWeekNames;
  daysOfWeek: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  form = {
    subjectId: null as number | null,
    professorId: null as number | null,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '',
    endTime: '',
    semester: '2026-02',
    capacity: 30
  };

  constructor(
    private offeringService: SubjectOfferingService,
    private subjectService: SubjectService,
    private professorService: ProfessorService,
    private validationService: ValidationService,
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
      semester: '2026-02', 
      capacity: 30 
    };
    this.validationErrors = {};
    this.showModal = true;
  }

  openEdit(offering: SubjectOffering) {
    this.editingId = offering.id!;
    this.form = {
      subjectId: offering.subject.id!,
      professorId: offering.professor.id!,
      dayOfWeek: offering.dayOfWeek,
      startTime: offering.startTime.substring(0, 5),
      endTime: offering.endTime.substring(0, 5),
      semester: offering.semester,
      capacity: offering.capacity
    };
    this.validationErrors = {};
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  save() {
    if (!this.form.subjectId || !this.form.professorId || !this.form.startTime || !this.form.endTime) return;
    
    this.validationErrors = {};

    // Validar duración (2 a 8 horas)
    const [startH, startM] = this.form.startTime.split(':').map(Number);
    const [endH, endM] = this.form.endTime.split(':').map(Number);
    const durationHours = (endH + endM / 60) - (startH + startM / 60);

    if (durationHours < 2 || durationHours > 8) {
      this.validationErrors['duration'] = `La duración debe ser entre 2 y 8 horas. (Actual: ${durationHours.toFixed(1)}h)`;
      return;
    }

    const errors = this.validationService.validateFields({ semester: this.form.semester });
    if (errors.length > 0) {
      this.validationErrors['semester'] = errors[0].message;
      return;
    }

    this.saving = true;
    const payload: any = {
      dayOfWeek: this.form.dayOfWeek,
      startTime: `${this.form.startTime}:00`,
      endTime: `${this.form.endTime}:00`,
      semester: this.form.semester,
      capacity: this.form.capacity,
      subject: { id: this.form.subjectId },
      professor: { id: this.form.professorId }
    };

    if (this.editingId) {
      payload.id = this.editingId;
      this.offeringService.update(this.editingId, payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving = false; },
        error: (err) => { 
          this.saving = false;
          if (err.error?.message) alert(err.error.message);
        }
      });
    } else {
      this.offeringService.create(payload).subscribe({
        next: () => { this.loadData(); this.closeModal(); this.saving = false; },
        error: (err) => { 
          this.saving = false;
          if (err.error?.message) alert(err.error.message);
        }
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

  formatTime(time: string) {
    if (!time) return '—';
    return time.substring(0, 5);
  }
}
