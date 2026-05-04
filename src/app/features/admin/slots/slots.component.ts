import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailableSlotService, AvailableSlot } from '../../../core/services/available-slot.service';

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

  form: AvailableSlot = {
    startTime: '',
    endTime: '',
    availableSpots: 1,
    active: true,
    program: { id: 2 }
  };

  constructor(private slotService: AvailableSlotService) {}

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
    this.form = { startTime: '', endTime: '', availableSpots: 1, active: true, program: { id: 2 } };
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
      endTime: `${this.form.endTime}:00Z`
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
}