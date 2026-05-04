import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex">
      <app-sidebar />
      <main class="ml-64 flex-1 min-h-screen bg-gray-50 p-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}