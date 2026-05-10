import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUser, UserService } from '../../../core/services/user.service';
import { ValidationService } from '../../../core/services/validation.service';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(false);
  showModal = signal(false);
  saving = signal(false);
  editingLogin = signal<string | null>(null);
  search = signal('');
  validationErrors = signal<{ [key: string]: string }>({});
  credentialsModal = signal<{ login: string; password?: string } | null>(null);


  form: AdminUser = { login: '', firstName: '', lastName: '', email: '', activated: true, langKey: 'es', authorities: [] };

  constructor(
    private userService: UserService,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: data => { 
        // Log payload for debugging
        console.debug('admin users payload', data);
        // Excluir usuarios con rol ROLE_USER (estudiantes). Soporta strings u objetos.
        const filtered = (data || []).filter(u => {
          const auths = (u.authorities || []) as any[];
          const hasRoleUser = auths.some(a => {
            if (!a) return false;
            if (typeof a === 'string') return a === 'ROLE_USER';
            if (a.authority) return a.authority === 'ROLE_USER';
            if (a.name) return a.name === 'ROLE_USER';
            return false;
          });
          return !hasRoleUser;
        });
        this.users.set(filtered);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  openCreate() {
    this.editingLogin.set(null);
    this.form = { login: '', firstName: '', lastName: '', email: '', activated: true, langKey: 'es', authorities: [] };
    this.showModal.set(true);
  }

  openEdit(u: AdminUser) {
    this.editingLogin.set(u.login || null);
    this.form = { ...u };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingLogin.set(null);
  }

  toggleRole(role: string) {
    const auths = this.form.authorities || [];
    const idx = auths.indexOf(role);
    if (idx === -1) auths.push(role); else auths.splice(idx, 1);
    this.form.authorities = [...auths];
  }

  isRoleSelected(role: string) {
    return (this.form.authorities || []).includes(role);
  }

  save() {
    this.saving.set(true);
    const payload = { ...this.form } as any;
    if (this.editingLogin()) {
      payload.id = this.users().find(u => u.login === this.editingLogin())?.id;
      this.userService.update(this.editingLogin()!, payload).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadUsers(); },
        error: () => { this.saving.set(false); }
      });
    } else {
      const sendEmail = localStorage.getItem('admin_send_credentials_email') !== 'false';
      this.userService.create(payload, sendEmail).subscribe({
        next: (createdUser) => { 
          this.saving.set(false); 
          this.closeModal(); 
          this.loadUsers(); 
          if (!sendEmail && createdUser.password) {
            this.credentialsModal.set({ login: createdUser.login, password: createdUser.password });
          }
        },
        error: () => { this.saving.set(false); }
      });
    }
  }

  delete(login: string) {
    if (!confirm('¿Eliminar usuario?')) return;
    this.userService.delete(login).subscribe({ next: () => this.loadUsers() });
  }

  onCharacterLimitExceeded(event: { field: string; limit: number; current: number }): void {
    const errorMsg = this.validationService.formatErrorMessage(
      event.field,
      event.limit,
      event.current
    );
    this.validationErrors.update(errors => ({
      ...errors,
      [event.field]: errorMsg
    }));
    setTimeout(() => {
      this.validationErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[event.field];
        return newErrors;
      });
    }, 3000);
  }

  getCharLimit(fieldName: string): number {
    return this.validationService.getFieldLimit(fieldName);
  }

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u => (u.login || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  });
}
