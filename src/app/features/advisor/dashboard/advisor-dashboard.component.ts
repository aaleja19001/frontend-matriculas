import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Appointment, AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-advisor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">

      <!-- Advisor Welcome Header -->
      <div class="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Panel de Asesoría</span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">¡Hola, {{ advisorName() }}!</h1>
          <p class="text-slate-500 mt-2 max-w-md font-medium">Gestiona tus citas asignadas y apoya a los estudiantes en su proceso de matrícula.</p>
        </div>
        
        <div class="flex items-center gap-3 relative z-10">
          <button routerLink="/advisor/profile" 
                  class="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Mi Perfil
          </button>
        </div>

        <!-- Decorative -->
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Asignadas</p>
          <p class="text-3xl font-black text-slate-900 tracking-tighter">{{ stats().total }}</p>
        </div>
        <div class="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/50 shadow-sm">
          <p class="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1">Pendientes</p>
          <p class="text-3xl font-black text-amber-600 tracking-tighter">{{ stats().pending }}</p>
        </div>
        <div class="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 shadow-sm">
          <p class="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">Atendidas</p>
          <p class="text-3xl font-black text-blue-600 tracking-tighter">{{ stats().approved }}</p>
        </div>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Mis Citas Programadas</h2>
          
          <div class="flex items-center gap-4">
            <select (change)="onStatusChange($event)" class="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none ring-1 ring-slate-200">
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="REJECTED">Rechazadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
            <div *ngIf="loading()" class="w-5 h-5 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        </div>

        <div class="p-4 md:p-8">
          <div *ngIf="!loading() && filteredAppointments().length > 0" class="space-y-4">
            <div *ngFor="let a of filteredAppointments()" 
                 class="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all duration-300 gap-6">
              
              <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors duration-300"
                     [ngClass]="{
                       'bg-amber-100 text-amber-600': a.status === 'PENDING',
                       'bg-emerald-100 text-emerald-600': a.status === 'APPROVED',
                       'bg-slate-100 text-slate-400': a.status === 'CANCELLED',
                       'bg-rose-100 text-rose-600': a.status === 'REJECTED'
                     }">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-3 flex-wrap">
                    <p class="font-black text-slate-900 tracking-tight">{{ getStudentName(a) }}</p>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                          [ngClass]="{
                            'bg-amber-50 text-amber-600 border border-amber-100': a.status === 'PENDING',
                            'bg-emerald-50 text-emerald-600 border border-emerald-100': a.status === 'APPROVED',
                            'bg-slate-50 text-slate-500 border border-slate-100': a.status === 'CANCELLED',
                            'bg-rose-50 text-rose-600 border border-rose-100': a.status === 'REJECTED'
                          }">
                      {{ statusLabels[a.status] }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mt-1.5 flex-wrap">
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      Código: {{ a.student?.studentCode || '—' }}
                    </p>
                    <p *ngIf="a.availableSlot" class="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {{ formatDate(a.availableSlot.startTime) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button (click)="openDetail(a)"
                        class="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-200">
                  Ver Detalle
                </button>
                <button *ngIf="a.status === 'PENDING'"
                        (click)="cancelAppointment(a)"
                        class="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-200">
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && filteredAppointments().length === 0" 
               class="py-16 text-center flex flex-col items-center">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg class="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight mb-2">No hay citas asignadas</h3>
            <p class="text-slate-500 max-w-sm font-medium">No se encontraron citas con los filtros seleccionados.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div *ngIf="selected()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Detalle de la Cita</h2>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estudiante: {{ getStudentName(selected()!) }}</p>
          </div>
          <button (click)="closeDetail()" class="p-2 rounded-xl hover:bg-white transition-colors">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8">
          
          <!-- Student & Schedule Info -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</p>
              <p class="font-bold text-slate-900">{{ selected()?.student?.studentCode || '—' }}</p>
            </div>
            <div class="space-y-1 text-right">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Créditos Cursados</p>
              <p class="font-bold text-slate-900">{{ selected()?.currentCredits }}</p>
            </div>
          </div>

          <!-- Schedule Link -->
          <div *ngIf="selected()?.currentSchedule" class="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
            <p class="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">Horario Actual (Link/Ref)</p>
            <p class="text-sm font-medium text-blue-900 break-all">{{ selected()?.currentSchedule }}</p>
          </div>

          <!-- Notes -->
          <div *ngIf="selected()?.notes" class="bg-slate-50 rounded-2xl p-4">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas del Estudiante</p>
            <p class="text-sm font-medium text-slate-700 italic">"{{ selected()?.notes }}"</p>
          </div>

          <!-- Enrollments -->
          <div>
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Materias a Matricular</h3>
            <div class="space-y-3">
              <div *ngFor="let e of selected()?.enrollments" class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div>
                  <p class="text-sm font-bold text-slate-900">{{ e.subjectOffering.subject.name }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prof: {{ e.subjectOffering.professor.firstName }} {{ e.subjectOffering.professor.lastName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-slate-700">{{ formatTimeRange(e.subjectOffering.startTime, e.subjectOffering.endTime) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">{{ e.subjectOffering.dayOfWeek }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-3">
          <button (click)="closeDetail()" class="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            Cerrar
          </button>
          <div *ngIf="selected()?.status === 'PENDING'" class="flex gap-3">
            <button (click)="updateStatus(selected()!.id!, 'REJECTED')" 
                    class="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition-colors">
              Rechazar
            </button>
            <button (click)="updateStatus(selected()!.id!, 'APPROVED')" 
                    class="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
              Aprobar Cita
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `
})
export class AdvisorDashboardComponent implements OnInit {

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  advisorName = signal('');
  selectedStatus = signal('ALL');
  selected = signal<Appointment | null>(null);

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    CANCELLED: 'Cancelada'
  };

  filteredAppointments = computed(() => {
    if (this.selectedStatus() === 'ALL') return this.appointments();
    return this.appointments().filter(a => a.status === this.selectedStatus());
  });

  stats = computed(() => {
    const all = this.appointments();
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'PENDING').length,
      approved: all.filter(a => a.status === 'APPROVED').length
    };
  });

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.advisorName.set(this.authService.currentUser()?.sub || 'Asesor');
    this.loadAppointments();
  }

  loadAppointments() {
    const user = this.authService.currentUser();
    if (!user || !user.id) return;

    this.loading.set(true);
    this.appointmentService.getByAdvisor(user.id).subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar tus citas');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(event: any) {
    this.selectedStatus.set(event.target.value);
  }

  getStudentName(a: Appointment) {
    return `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.trim() || 'Estudiante';
  }

  formatDate(date: string | undefined) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  formatTime(date: string) {
    return new Date(date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  formatTimeRange(start: string, end: string) {
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  openDetail(a: Appointment) {
    this.selected.set(a);
  }

  closeDetail() {
    this.selected.set(null);
  }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.toast.success(`Cita ${status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
        this.loadAppointments();
        this.closeDetail();
      },
      error: () => this.toast.error('Error al actualizar el estado')
    });
  }

  cancelAppointment(a: Appointment) {
    if (confirm('¿Estás seguro de cancelar esta cita?')) {
      this.appointmentService.cancel(a.id!).subscribe({
        next: () => {
          this.toast.success('Cita cancelada');
          this.loadAppointments();
        },
        error: () => this.toast.error('Error al cancelar la cita')
      });
    }
  }
}
