import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  subjects: Subject[] = [];
  filtered: Subject[] = [];
  programs: Program[] = [];
  loading = false;
  search = '';
  showModal = false;
  saving = false;
  editingId: number | null = null;

  form = {
    name: '',
    code: '',
    credits: 3,
    selectedProgramIds: [] as number[]
  };

  constructor(
    private subjectService: SubjectService,
    private programService: ProgramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadPrograms();
  }

  loadSubjects() {
    this.loading = true;
    this.subjectService.getAll().subscribe({
      next: data => {
        this.subjects = [...data];
        this.filtered = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadPrograms() {
    this.programService.getAll().subscribe({
      next: data => { this.programs = data; this.cdr.detectChanges(); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.search = value;
    this.filtered = this.subjects.filter(s =>
      s.name?.toLowerCase().includes(value) ||
      s.code?.toLowerCase().includes(value)
    );
    this.cdr.detectChanges();
  }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', code: '', credits: 3, selectedProgramIds: [] };
    this.showModal = true;
  }

  openEdit(subject: Subject) {
    this.editingId = subject.id!;
    this.form = {
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      selectedProgramIds: subject.programs?.map(p => p.id) || []
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
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
    this.saving = true;
    const subjectData: any = {
      name: this.form.name,
      code: this.form.code,
      credits: this.form.credits,
      programs: this.form.selectedProgramIds.map(id => ({ id }))
    };

    if (this.editingId) {
      subjectData.id = this.editingId;
      this.subjectService.update(this.editingId, subjectData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadSubjects(); },
        error: () => { this.saving = false; }
      });
    } else {
      this.subjectService.create(subjectData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadSubjects(); },
        error: () => { this.saving = false; }
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
