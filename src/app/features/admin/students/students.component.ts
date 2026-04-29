import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StudentService, Student } from '../../../core/services/student.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html'
})
export class StudentsComponent implements OnInit {

  students: Student[] = [];
  filtered: Student[] = [];
  programs: any[] = [];
  loading = false;
  search = '';
  showModal = false;
  saving = false;
  deleting: number | null = null;
  editingId: number | null = null;

  form = {
    firstName: '',
    lastName: '',
    studentCode: '',
    nationalId: '',
    login: '',
    password: '',
    email: '',
    programId: null as number | null
  };

  constructor(
    private studentService: StudentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone

  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadPrograms();
  }

 loadStudents() {
  this.loading = true;
  this.studentService.getAll().subscribe({
    next: data => {
      this.ngZone.run(() => {
        this.students = [...data];
        this.filtered = [...data];
        this.loading = false;
      });
    },
    error: () => {
      this.ngZone.run(() => {
        this.loading = false;
      });
    }
  });
}

loadPrograms() {
  this.http.get<any[]>(`${environment.apiUrl}/programs`).subscribe({
    next: data => {
      console.log('programs:', data);
      this.programs = [...data];
      this.cdr.detectChanges();
    },
    error: (err) => console.error('error programs:', err)
  });
}

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.search = value;
    this.filtered = this.students.filter(s =>
      s.firstName?.toLowerCase().includes(value) ||
      s.lastName?.toLowerCase().includes(value) ||
      s.studentCode?.toLowerCase().includes(value) ||
      s.nationalId?.toLowerCase().includes(value)
    );
    this.cdr.detectChanges();
  }

  openCreate() {
  console.log('openCreate called');
  this.editingId = null;
  this.form = { firstName: '', lastName: '', studentCode: '', nationalId: '', login: '', password: '', email: '', programId: null };
  this.showModal = true;
  this.cdr.detectChanges();
}

  openEdit(student: Student) {
    this.editingId = student.id!;
    this.form = {
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      studentCode: student.studentCode ?? '',
      nationalId: student.nationalId ?? '',
      login: student.user?.login ?? '',
      password: '',
      email: '',
      programId: student.program?.id ?? null
    };
    this.showModal = true;
  }

closeModal() {
  this.showModal = false;
  this.editingId = null;
  this.cdr.markForCheck();
  this.cdr.detectChanges();
}

 save() {
  this.saving = true;

  if (this.editingId) {
    const payload: any = {
      id: this.editingId,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      studentCode: this.form.studentCode,
      nationalId: this.form.nationalId,
      active: true,
      program: this.form.programId ? { id: this.form.programId } : null
    };
    this.http.put<any>(`${environment.apiUrl}/students/${this.editingId}`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.editingId = null;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.loadStudents();
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); }
    });
  } else {
    const userPayload = {
      login: this.form.login,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      password: this.form.password,
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
            this.saving = false;
            this.closeModal();
            this.loadStudents();
            this.cdr.detectChanges();
          },
          error: () => { this.saving = false; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); }
    });
  }
} 

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;
    this.deleting = id;
    this.http.delete(`${environment.apiUrl}/students/${id}`).subscribe({
      next: () => { this.deleting = null; this.loadStudents(); },
      error: () => { this.deleting = null; }
    });
  }

  getInitials(student: Student) {
    return `${student.firstName?.charAt(0) ?? ''}${student.lastName?.charAt(0) ?? ''}`;
  }

  onlyLetters(event: KeyboardEvent) {
  const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
  if (!pattern.test(event.key)) {
    event.preventDefault();
  }
}

onlyNumbers(event: KeyboardEvent) {
  const pattern = /^[0-9]$/;
  if (!pattern.test(event.key)) {
    event.preventDefault();
  }
}
}