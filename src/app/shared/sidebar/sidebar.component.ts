import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  constructor(
    public authService: AuthService,
    public appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.appointmentService.refreshPendingCount();
    // Refresh every 30 seconds
    setInterval(() => this.appointmentService.refreshPendingCount(), 30000);
  }

  logout() {
    this.authService.logout();
  }
}
