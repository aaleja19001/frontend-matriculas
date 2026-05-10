import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  pendingCount = signal(0);

  constructor(
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadPendingCount();
    // Refresh every 30 seconds
    setInterval(() => this.loadPendingCount(), 30000);
  }

  loadPendingCount() {
    this.http.get<any[]>(`${environment.apiUrl}/appointments`).subscribe({
      next: data => {
        const count = data.filter(a => a.status === 'PENDING').length;
        this.pendingCount.set(count);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
