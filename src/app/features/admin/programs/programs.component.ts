import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService, Program } from '../../../core/services/program.service';
import { SubjectService, Subject } from '../../../core/services/subject.service';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programs.component.html'
})
export class ProgramsComponent implements OnInit {

  programs = signal<Program[]>([]);
  subjects = signal<Subject[]>([]);
  search = signal('');
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  stats = computed(() => {
    const all = this.programs();
    return {
      total: all.length,
      totalSubjects: all.reduce((acc, p) => acc + (p.subjects?.length || 0), 0)
    };
  });

  filtered = computed(() => {
    const value = this.search().toLowerCase().trim();
    if (!value) return this.programs();
    return this.programs().filter(p =>
      p.name?.toLowerCase().includes(value) ||
      p.codePrefix?.toLowerCase().includes(value)
    );
  });

  form = {
    name: '',
    codePrefix: '',
    selectedSubjectIds: [] as number[]
  };

  constructor(
    private programService: ProgramService,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    this.loadPrograms();
    this.loadSubjects();
  }

  loadPrograms() {
    this.loading.set(true);
    this.programService.getAll().subscribe({
      next: data => {
        this.programs.set([...data]);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  loadSubjects() {
    this.subjectService.getAll().subscribe({
      next: data => { this.subjects.set(data); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { name: '', codePrefix: '', selectedSubjectIds: [] };
    this.showModal.set(true);
  }

  openEdit(program: Program) {
    this.editingId.set(program.id!);
    this.form = {
      name: program.name,
      codePrefix: program.codePrefix,
      selectedSubjectIds: program.subjects?.map(s => s.id!) || []
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  toggleSubject(subjectId: number) {
    const index = this.form.selectedSubjectIds.indexOf(subjectId);
    if (index > -1) {
      this.form.selectedSubjectIds.splice(index, 1);
    } else {
      this.form.selectedSubjectIds.push(subjectId);
    }
  }

  save() {
    this.saving.set(true);
    const programData: any = {
      name: this.form.name,
      codePrefix: this.form.codePrefix,
      subjects: this.form.selectedSubjectIds.map(id => ({ id }))
    };

    if (this.editingId()) {
      programData.id = this.editingId()!;
      this.programService.update(this.editingId()!, programData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadPrograms(); },
        error: () => { this.saving.set(false); }
      });
    } else {
      this.programService.create(programData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadPrograms(); },
        error: () => { this.saving.set(false); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este programa?')) return;
    this.programService.delete(id).subscribe({
      next: () => { this.loadPrograms(); },
      error: () => { alert('No se puede eliminar el programa. Puede que tenga materias asociadas.'); }
    });
  }

  onlyLetters(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }
}
