import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}