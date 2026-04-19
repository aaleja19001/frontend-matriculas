import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  programs: Program[] = [];
  filtered: Program[] = [];
  subjects: Subject[] = [];
  loading = false;
  search = '';
  showModal = false;
  saving = false;
  editingId: number | null = null;

  form = {
    name: '',
    codePrefix: '',
    selectedSubjectIds: [] as number[]
  };

  constructor(
    private programService: ProgramService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPrograms();
    this.loadSubjects();
  }

  loadPrograms() {
    this.loading = true;
    this.programService.getAll().subscribe({
      next: data => {
        this.programs = [...data];
        this.filtered = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadSubjects() {
    this.subjectService.getAll().subscribe({
      next: data => { this.subjects = data; this.cdr.detectChanges(); }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.search = value;
    this.filtered = this.programs.filter(p =>
      p.name?.toLowerCase().includes(value) ||
      p.codePrefix?.toLowerCase().includes(value)
    );
    this.cdr.detectChanges();
  }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', codePrefix: '', selectedSubjectIds: [] };
    this.showModal = true;
  }

  openEdit(program: Program) {
    this.editingId = program.id!;
    this.form = {
      name: program.name,
      codePrefix: program.codePrefix,
      selectedSubjectIds: program.subjects?.map(s => s.id!) || []
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
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
    this.saving = true;
    const programData: any = {
      name: this.form.name,
      codePrefix: this.form.codePrefix,
      subjects: this.form.selectedSubjectIds.map(id => ({ id }))
    };

    if (this.editingId) {
      programData.id = this.editingId;
      this.programService.update(this.editingId, programData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadPrograms(); },
        error: () => { this.saving = false; }
      });
    } else {
      this.programService.create(programData).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadPrograms(); },
        error: () => { this.saving = false; }
      });
    }
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este programa?')) return;
    this.programService.delete(id).subscribe({
      next: () => { this.loadPrograms(); },
      error: (err) => { alert('No se puede eliminar el programa. Puede que tenga materias asociadas.'); }
    });
  }
}
