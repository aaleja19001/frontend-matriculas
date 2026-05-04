import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService, Subject } from '../../../core/services/subject.service';
import { ProgramService, Program } from '../../../core/services/program.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html'
})
export class SubjectsComponent implements OnInit {

  subjects = signal<Subject[]>([]);
  programs = signal<Program[]>([]);
  search = signal('');
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  filtered = computed(() => {
    const value = this.search().toLowerCase();
    return this.subjects().filter(s =>
      s.name?.toLowerCase().includes(value) ||
      s.code?.toLowerCase().includes(value)
    );
  });

  form = {
    name: '',
    code: '',
    credits: 3,
    selectedProgramIds: [] as number[]
  };

  constructor(
    private subjectService: SubjectService,
    private programService: ProgramService
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadPrograms();
  }

  loadSubjects() {
    this.loading.set(true);
    this.subjectService.getAll().subscribe({
      next: data => {
        this.subjects.set([...data]);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  loadPrograms() {
    this.programService.getAll().subscribe({
      next: data => { this.programs.set(data); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { name: '', code: '', credits: 3, selectedProgramIds: [] };
    this.showModal.set(true);
  }

  openEdit(subject: Subject) {
    this.editingId.set(subject.id!);
    this.form = {
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      selectedProgramIds: subject.programs?.map(p => p.id) || []
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  toggleProgram(programId: number) {
    const index = this.form.selectedProgramIds.indexOf(programId);
    if (index > -1) {
      this.form.selectedProgramIds.splice(index, 1);
    } else {
      this.form.selectedProgramIds.push(programId);
    }
  }

  save() {
    this.saving.set(true);
    const subjectData: any = {
      name: this.form.name,
      code: this.form.code,
      credits: this.form.credits,
      programs: this.form.selectedProgramIds.map(id => ({ id }))
    };

    if (this.editingId()) {
      subjectData.id = this.editingId()!;
      this.subjectService.update(this.editingId()!, subjectData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadSubjects(); },
        error: () => { this.saving.set(false); }
      });
    } else {
      this.subjectService.create(subjectData).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadSubjects(); },
        error: () => { this.saving.set(false); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;
    this.subjectService.delete(id).subscribe({
      next: () => { this.loadSubjects(); },
      error: () => { alert('No se puede eliminar la materia. Puede que esté asociada a citas o programas.'); }
    });
  }
}
