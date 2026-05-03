import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService, Professor } from '../../../core/services/professor.service';

@Component({
  selector: 'app-professors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professors.component.html'
})
export class ProfessorsComponent implements OnInit {

  professors: Professor[] = [];
  filtered: Professor[] = [];
  loading = false;
  search = '';
  showModal = false;
  saving = false;
  editingId: number | null = null;

  form = {
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    active: true
  };

  constructor(
    private professorService: ProfessorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfessors();
  }

  loadProfessors() {
    this.loading = true;
    this.professorService.getAll().subscribe({
      next: data => {
        this.professors = [...data];
        this.filtered = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.search = value;
    this.filtered = this.professors.filter(p =>
      p.firstName?.toLowerCase().includes(value) ||
      p.lastName?.toLowerCase().includes(value) ||
      p.nationalId?.toLowerCase().includes(value)
    );
    this.cdr.detectChanges();
  }

  openCreate() {
    this.editingId = null;
    this.form = { firstName: '', lastName: '', email: '', nationalId: '', active: true };
    this.showModal = true;
  }

  openEdit(professor: Professor) {
    this.editingId = professor.id!;
    this.form = {
      firstName: professor.firstName,
      lastName: professor.lastName,
      email: professor.email,
      nationalId: professor.nationalId,
      active: professor.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  save() {
    this.saving = true;
    const professorData: Professor = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      nationalId: this.form.nationalId,
      active: this.form.active
    };

    if (this.editingId) {
      professorData.id = this.editingId;
      this.professorService.update(this.editingId, professorData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadProfessors(); },
        error: () => { this.saving = false; }
      });
    } else {
      this.professorService.create(professorData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadProfessors(); },
        error: () => { this.saving = false; }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este profesor?')) return;
    this.professorService.delete(id).subscribe({
      next: () => { this.loadProfessors(); },
      error: () => { alert('No se puede eliminar el profesor. Puede que esté asociado a materias.'); }
    });
  }
}
