import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StudentService, Student } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = signal(false);
  saving = signal(false);
  message = signal({ text: '', type: '' });
  student: Student | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      studentCode: [{ value: '', disabled: true }],
      nationalId: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.studentService.getMe().subscribe({
      next: (student) => {
        this.student = student;
        this.profileForm.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          studentCode: student.studentCode,
          nationalId: student.nationalId
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.message.set({ text: 'Error al cargar el perfil', type: 'error' });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.student || !this.student.id) return;

    this.saving.set(true);
    const formValue = this.profileForm.getRawValue();
    // Combinamos el objeto original con los nuevos valores del formulario
    // Esto asegura que el 'id' y otros campos necesarios (como 'user' o 'program') estén presentes
    const updatedStudent = { ...this.student, ...formValue };
    
    this.studentService.update(this.student.id, updatedStudent).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set({ text: 'Perfil actualizado con éxito', type: 'success' });
        setTimeout(() => this.message.set({ text: '', type: '' }), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.message.set({ 
          text: 'Error al actualizar: ' + (err.error?.detail || err.error?.message || 'Error desconocido'), 
          type: 'error' 
        });
      }
    });
  }
}
