import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvailableSlot, AvailableSlotService } from '../../../core/services/available-slot.service';
import { AdminUser, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slots.component.html'
})
export class SlotsComponent implements OnInit {

  slots = signal<AvailableSlot[]>([]);
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  advisors = signal<AdminUser[]>([]);

  stats = computed(() => {
    const all = this.slots();
    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      totalSpots: all.reduce((acc, s) => acc + (s.availableSpots ?? 0), 0)
    };
  });

  form: any = {
    startTime: '',
    availableSpots: 1,
    active: true,
    program: { id: 2 },
    advisors: []
  };
  
  constructor(private slotService: AvailableSlotService, private userService: UserService) {}

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.loading.set(true);
    this.slotService.getAll().subscribe({
      next: data => { 
        this.slots.set([...data]); 
        this.loading.set(false); 
      },
      error: () => this.loading.set(false)
    });
  }

  openModal() {
    this.form = { startTime: '', availableSpots: 1, active: true, program: { id: 2 }, advisors: [] } as any;
    this.userService.getAll().subscribe({ next: data => { this.advisors.set(data.filter(u => (u.authorities||[]).includes('ROLE_ADVISOR'))); }, error: () => this.advisors.set([]) });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  save() {
    this.saving.set(true);
    const payload = {
      ...this.form,
      startTime: `${this.form.startTime}:00Z`,
      advisors: (this.form as any).advisors ? (this.form as any).advisors.map((id: any) => ({ id })) : undefined
    };
    this.slotService.create(payload).subscribe({
      next: () => { 
        this.loadSlots(); 
        this.closeModal(); 
        this.saving.set(false); 
      },
      error: () => this.saving.set(false)
    });
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este cupo?')) return;
    this.deletingId.set(id);
    this.slotService.delete(id).subscribe({
      next: () => { 
        this.loadSlots(); 
        this.deletingId.set(null); 
      },
      error: () => {
        this.deletingId.set(null);
        alert('Error al eliminar el cupo.');
      }
    });
  }

  formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  formatEndDate(start: string) {
    if (!start) return '—';
    const d = new Date(start);
    d.setMinutes(d.getMinutes() + 30);
    return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  onAdvisorToggle(id: number | undefined, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const arr = (this.form as any).advisors || [];
    if (checked) {
      if (id !== undefined && !arr.includes(id)) arr.push(id);
    } else {
      if (id !== undefined) {
        const idx = arr.indexOf(id);
        if (idx >= 0) arr.splice(idx, 1);
      }
    }
    (this.form as any).advisors = [...arr];
  }
}
