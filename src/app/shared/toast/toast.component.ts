import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
      <div *ngFor="let t of toastService.toasts()"
           class="toast-card flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border pointer-events-auto transition-all duration-300 transform"
           [ngClass]="{
             'bg-emerald-50 border-emerald-200 text-emerald-900': t.type === 'success',
             'bg-red-50 border-red-300 text-red-900': t.type === 'error',
             'bg-blue-50 border-blue-200 text-blue-900': t.type === 'info',
             'bg-amber-50 border-amber-200 text-amber-900': t.type === 'warning'
           }">
        
        <!-- Icon -->
        <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
             [ngClass]="{
               'bg-emerald-100 text-emerald-600': t.type === 'success',
               'bg-red-100 text-red-600': t.type === 'error',
               'bg-blue-100 text-blue-600': t.type === 'info',
               'bg-amber-100 text-amber-600': t.type === 'warning'
             }">
          <svg *ngIf="t.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
          <svg *ngIf="t.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <svg *ngIf="t.type === 'info'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg *ngIf="t.type === 'warning'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <!-- Message Content -->
        <div class="flex-1">
          <p class="text-sm font-bold tracking-tight leading-tight break-words">{{ t.message }}</p>
        </div>

        <!-- Close Button -->
        <button (click)="toastService.remove(t.id)" 
                class="ml-2 flex-shrink-0 transition-colors"
                [ngClass]="{
                  'text-emerald-300 hover:text-emerald-600': t.type === 'success',
                  'text-red-300 hover:text-red-600': t.type === 'error',
                  'text-blue-300 hover:text-blue-600': t.type === 'info',
                  'text-amber-300 hover:text-amber-600': t.type === 'warning'
                }">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <style>
      .toast-card {
        animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        min-width: 300px;
        max-width: 100%;
      }
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(100%) scale(0.9); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }
    </style>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}

