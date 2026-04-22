import { Component, AfterViewInit } from '@angular/core';
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
export class LoginComponent implements AfterViewInit {
  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

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


  ngAfterViewInit() {
    this.initMeteors();
  }

  private initMeteors() {
    const canvas = document.getElementById('meteorCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Meteor {
      x = 0; y = 0; len = 0; speed = 0; opacity = 0; width = 0; color = '';

      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x       = Math.random() * (canvas.width + 300) - 100;
        this.y       = initial ? Math.random() * canvas.height : -Math.random() * 200;
        this.len     = 80 + Math.random() * 120;
        this.speed   = 1.8 + Math.random() * 2.5;
        this.opacity = 0.5 + Math.random() * 0.4;
        this.width   = 0.8 + Math.random() * 1.2;
        this.color   = Math.random() > 0.5 ? '37,99,235' : '16,185,129';
      }

      update() {
        this.x += this.speed;
        this.y += this.speed;
        if (this.x > canvas.width + 200 || this.y > canvas.height + 200) this.reset();
      }

      draw() {
        const angle = Math.PI / 4;
        const x2 = this.x - Math.cos(angle) * this.len;
        const y2 = this.y - Math.sin(angle) * this.len;

        const grad = ctx.createLinearGradient(x2, y2, this.x, this.y);
        grad.addColorStop(0,   `rgba(${this.color}, 0)`);
        grad.addColorStop(0.6, `rgba(${this.color}, ${this.opacity * 0.4})`);
        grad.addColorStop(1,   `rgba(${this.color}, ${this.opacity})`);

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = this.width;
        ctx.lineCap     = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    const meteors = Array.from({ length: 7 }, (_, i) => {
      const m = new Meteor();
      m.x = -100 - i * 180;
      m.y = -100 - i * 60;
      return m;
    });

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(37,99,235,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      meteors.forEach(m => { m.update(); m.draw(); });
      requestAnimationFrame(animate);
    };

    animate();
  }
}




