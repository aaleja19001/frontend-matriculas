import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService, Professor } from '../../../core/services/professor.service';
import { ValidationService } from '../../../core/services/validation.service';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';

@Component({
  selector: 'app-professors',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
  templateUrl: './professors.component.html'
})
export class ProfessorsComponent implements OnInit {

  professors = signal<Professor[]>([]);
  search = signal('');
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  validationErrors = signal<{ [key: string]: string }>({});

  stats = computed(() => {
    const all = this.professors();
    return {
      total: all.length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length
    };
  });

  filtered = computed(() => {
    const value = this.search().toLowerCase().trim();
    if (!value) return this.professors();
    return this.professors().filter(p =>
      p.firstName?.toLowerCase().includes(value) ||
      p.lastName?.toLowerCase().includes(value) ||
      p.nationalId?.toLowerCase().includes(value) ||
      p.email?.toLowerCase().includes(value)
    );
  });

  form = {
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    active: true
  };

  constructor(
    private professorService: ProfessorService,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.loadProfessors();
  }

  onCharacterLimitExceeded(event: { field: string; limit: number; current: number }): void {
    const errorMsg = this.validationService.formatErrorMessage(
      event.field,
      event.limit,
      event.current
    );
    
    this.validationErrors.update(errors => ({
      ...errors,
      [event.field]: errorMsg
    }));

    setTimeout(() => {
      this.validationErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[event.field];
        return newErrors;
      });
    }, 3000);
  }

  getCharLimit(fieldName: string): number {
    return this.validationService.getFieldLimit(fieldName);
  }

  validateForm(): boolean {
    const fieldsToValidate = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      nationalId: this.form.nationalId
    };

    const errors = this.validationService.validateFields(fieldsToValidate);
    
    if (errors.length > 0) {
      const errorMap: { [key: string]: string } = {};
      errors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      this.validationErrors.set(errorMap);
      return false;
    }

    this.validationErrors.set({});
    return true;
  }

  loadProfessors() {
    this.loading.set(true);
    this.professorService.getAll().subscribe({
      next: data => {
        this.professors.set([...data]);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { firstName: '', lastName: '', email: '', nationalId: '', active: true };
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEdit(professor: Professor) {
    this.editingId.set(professor.id!);
    this.form = {
      firstName: professor.firstName,
      lastName: professor.lastName,
      email: professor.email,
      nationalId: professor.nationalId,
      active: professor.active
    };
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
    if (!this.validateForm()) return;

    this.saving.set(true);
    const professorData: Professor = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      nationalId: this.form.nationalId,
      active: this.form.active
    };

    if (this.editingId()) {
      professorData.id = this.editingId()!;
      this.professorService.update(this.editingId()!, professorData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadProfessors(); },
        error: () => { this.saving.set(false); }
      });
    } else {
      this.professorService.create(professorData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadProfessors(); },
        error: () => { this.saving.set(false); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este profesor?')) return;
    this.professorService.delete(id).subscribe({
      next: () => { this.loadProfessors(); },
      error: () => { 
        // El ErrorInterceptor ya muestra el mensaje en un toast.
        // Aquí podrías agregar lógica adicional si fuera necesario.
      }
    });
  }

}
