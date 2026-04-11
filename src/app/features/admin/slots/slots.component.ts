import { Component, OnInit } from '@angular/core';
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

  slots: AvailableSlot[] = [];
  loading = false;
  showModal = false;
  saving = false;
  deleting: number | null = null;

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
    this.loading = true;
    this.slotService.getAll().subscribe({
      next: data => { this.slots = [...data]; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal() {
    this.form = { startTime: '', endTime: '', availableSpots: 1, active: true, program: { id: 2 } };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    this.saving = true;
    const payload = {
      ...this.form,
      startTime: `${this.form.startTime}:00Z`,
      endTime: `${this.form.endTime}:00Z`
    };
    this.slotService.create(payload).subscribe({
      next: () => { this.loadSlots(); this.closeModal(); this.saving = false; },
      error: () => this.saving = false
    });
  }

  delete(id: number) {
    this.deleting = id;
    this.slotService.delete(id).subscribe({
      next: () => { this.loadSlots(); this.deleting = null; },
      error: () => this.deleting = null
    });
  }

  formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }
}