import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StudentService, Student } from '../../../core/services/student.service';
import { ValidationService } from '../../../core/services/validation.service';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
  templateUrl: './students.component.html'
})
export class StudentsComponent implements OnInit {

  students = signal<Student[]>([]);
  programs = signal<any[]>([]);
  search = signal('');
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  validationErrors = signal<{ [key: string]: string }>({});

  stats = computed(() => {
    const all = this.students();
    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      programs: new Set(all.map(s => s.program?.id).filter(id => id)).size
    };
  });

  filtered = computed(() => {
    const value = this.search().toLowerCase().trim();
    if (!value) return this.students();
    return this.students().filter(s =>
      s.firstName?.toLowerCase().includes(value) ||
      s.lastName?.toLowerCase().includes(value) ||
      s.studentCode?.toLowerCase().includes(value) ||
      s.nationalId?.toLowerCase().includes(value)
    );
  });

  form = {
    firstName: '',
    lastName: '',
    studentCode: '',
    nationalId: '',
    login: '',
    email: '',
    programId: null as number | null
  };

  constructor(
    private studentService: StudentService,
    private http: HttpClient,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadPrograms();
  }

  loadStudents() {
    this.loading.set(true);
    this.studentService.getAll().subscribe({
      next: data => {
        this.students.set([...data]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadPrograms() {
    this.http.get<any[]>(`${environment.apiUrl}/programs`).subscribe({
      next: data => {
        this.programs.set([...data]);
      },
      error: (err) => console.error('error programs:', err)
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { firstName: '', lastName: '', studentCode: '', nationalId: '', login: '', email: '', programId: null };
    this.showModal.set(true);
  }

  openEdit(student: Student) {
    this.editingId.set(student.id!);
    this.form = {
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      studentCode: student.studentCode ?? '',
      nationalId: student.nationalId ?? '',
      login: student.user?.login ?? '',
      email: '',
      programId: student.program?.id ?? null
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
    this.saving.set(true);

    if (this.editingId()) {
      const payload: any = {
        id: this.editingId(),
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        studentCode: this.form.studentCode,
        nationalId: this.form.nationalId,
        active: true,
        program: this.form.programId ? { id: this.form.programId } : null
      };
      this.http.put<any>(`${environment.apiUrl}/students/${this.editingId()}`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadStudents();
        },
        error: () => { this.saving.set(false); }
      });
    } else {
      const userPayload = {
        login: this.form.login,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        activated: true,
        langKey: 'es',
        authorities: ['ROLE_USER']
      };

      this.http.post<any>(`${environment.apiUrl}/admin/users`, userPayload).subscribe({
        next: user => {
          const studentPayload = {
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            studentCode: this.form.studentCode,
            nationalId: this.form.nationalId,
            active: true,
            user: { id: user.id },
            program: this.form.programId ? { id: this.form.programId } : null
          };
          this.http.post<any>(`${environment.apiUrl}/students`, studentPayload).subscribe({
            next: () => {
              this.saving.set(false);
              this.closeModal();
              this.loadStudents();
            },
            error: () => { this.saving.set(false); }
          });
        },
        error: () => { this.saving.set(false); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;
    this.deletingId.set(id);
    this.http.delete(`${environment.apiUrl}/students/${id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadStudents();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Error al eliminar el estudiante.');
      }
    });
  }

  getInitials(student: Student) {
    return `${student.firstName?.charAt(0) ?? ''}${student.lastName?.charAt(0) ?? ''}`;
  }



  /**
   * Maneja el evento cuando se excede el límite de caracteres
   */
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

    // Limpiar el error después de 3 segundos
    setTimeout(() => {
      this.validationErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[event.field];
        return newErrors;
      });
    }, 3000);
  }

  /**
   * Valida todos los campos antes de guardar
   */
  validateForm(): boolean {
    const fieldsToValidate = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      studentCode: this.form.studentCode,
      nationalId: this.form.nationalId,
      login: this.editingId() ? '' : this.form.login, // No validar login si estamos editando
      email: this.editingId() ? '' : this.form.email
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

  /**
   * Obtiene el límite de caracteres para un campo
   */
  getCharLimit(fieldName: string): number {
    return this.validationService.getFieldLimit(fieldName);
  }
}
