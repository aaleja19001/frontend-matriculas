import { Component, OnInit, signal, computed } from '@angular/core';
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

  professors = signal<Professor[]>([]);
  search = signal('');
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  filtered = computed(() => {
    const value = this.search().toLowerCase();
    return this.professors().filter(p =>
      p.firstName?.toLowerCase().includes(value) ||
      p.lastName?.toLowerCase().includes(value) ||
      p.nationalId?.toLowerCase().includes(value)
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
    private professorService: ProfessorService
  ) {}

  ngOnInit() {
    this.loadProfessors();
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
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
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
      error: () => { alert('No se puede eliminar el profesor. Puede que esté asociado a materias.'); }
    });
  }
}
