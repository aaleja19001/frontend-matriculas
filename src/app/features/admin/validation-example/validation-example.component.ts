import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaxLengthDirective } from '../../../shared/directives/max-length.directive';
import { ValidationService } from '../../../core/services/validation.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Componente de ejemplo mostrando cómo usar el sistema de validación
 */
@Component({
  selector: 'app-validation-example',
  standalone: true,
  imports: [CommonModule, FormsModule, MaxLengthDirective],
  template: `
    <div style="max-width: 32rem; margin: 2rem auto; padding: 0 1rem;">
      <div style="background: white; border: 1px solid #E2E8F0; border-radius: 1rem; padding: 2rem;">
        
        <h1 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">
          Ejemplo de Validación
        </h1>
        <p style="color: #64748B; margin-bottom: 2rem;">
          Este componente muestra cómo usar el sistema de validación y manejo de errores.
        </p>

        <!-- Formulario -->
        <form (ngSubmit)="submit()" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Campo 1: Nombre (20 caracteres) -->
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              Nombre <span style="color: #EF4444;">*</span>
            </label>
            <input 
              type="text"
              [(ngModel)]="form.name"
              name="name"
              appMaxLength="firstName"
              (characterLimitExceeded)="onCharacterLimitExceeded($event)"
              placeholder="Máximo 20 caracteres"
              style="
                width: 100%;
                border: 1px solid #E2E8F0;
                border-radius: 0.75rem;
                padding: 0.75rem 1rem;
                font-size: 0.875rem;
                color: #0F172A;
                background-color: #F8FAFC;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
              "
              [style.borderColor]="validationErrors()['firstName'] ? '#EF4444' : '#E2E8F0'"
              [style.backgroundColor]="validationErrors()['firstName'] ? '#FEE2E2' : '#F8FAFC'"
              onfocus="this.style.borderColor='#2563EB'; this.style.backgroundColor='white'"
            />
            <p *ngIf="validationErrors()['firstName']" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 600;">
              ❌ {{ validationErrors()['firstName'] }}
            </p>
            <p style="color: #94A3B8; font-size: 0.7rem; margin-top: 0.25rem;">
              {{ form.name.length }}/{{ getCharLimit('firstName') }} caracteres
            </p>
          </div>

          <!-- Campo 2: Email (35 caracteres) -->
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              Email <span style="color: #EF4444;">*</span>
            </label>
            <input 
              type="email"
              [(ngModel)]="form.email"
              name="email"
              appMaxLength="email"
              (characterLimitExceeded)="onCharacterLimitExceeded($event)"
              placeholder="Máximo 35 caracteres"
              style="
                width: 100%;
                border: 1px solid #E2E8F0;
                border-radius: 0.75rem;
                padding: 0.75rem 1rem;
                font-size: 0.875rem;
                color: #0F172A;
                background-color: #F8FAFC;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
              "
              [style.borderColor]="validationErrors()['email'] ? '#EF4444' : '#E2E8F0'"
              [style.backgroundColor]="validationErrors()['email'] ? '#FEE2E2' : '#F8FAFC'"
              onfocus="this.style.borderColor='#2563EB'; this.style.backgroundColor='white'"
            />
            <p *ngIf="validationErrors()['email']" style="color: #EF4444; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 600;">
              ❌ {{ validationErrors()['email'] }}
            </p>
            <p style="color: #94A3B8; font-size: 0.7rem; margin-top: 0.25rem;">
              {{ form.email.length }}/{{ getCharLimit('email') }} caracteres
            </p>
          </div>

          <!-- Botones -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <button 
              type="button"
              (click)="testBackendError()"
              style="
                padding: 0.75rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 700;
                background: #F8FAFC;
                color: #64748B;
                border: 1px solid #E2E8F0;
                cursor: pointer;
                transition: all 0.2s;
              "
              onmouseover="this.style.backgroundColor='#F1F5F9'"
            >
              Simular Error
            </button>
            <button 
              type="submit"
              style="
                padding: 0.75rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 700;
                background-color: #2563EB;
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
              "
              onmouseover="this.style.backgroundColor='#1D4ED8'"
            >
              Enviar
            </button>
          </div>
        </form>

        <!-- Info -->
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #E2E8F0;">
          <h3 style="font-size: 0.875rem; font-weight: 700; color: #0F172A; margin-bottom: 1rem;">
            ℹ️ Cómo funciona:
          </h3>
          <ul style="color: #64748B; font-size: 0.875rem; line-height: 1.6; padding-left: 1.25rem;">
            <li>✅ Los campos se validan en tiempo real mientras escribes</li>
            <li>✅ El campo "Nombre" tiene máximo 20 caracteres</li>
            <li>✅ El campo "Email" tiene máximo 35 caracteres</li>
            <li>❌ Si excedes el límite, verás el campo en rojo</li>
            <li>📊 Un contador muestra cuántos caracteres has escrito</li>
            <li>🔴 Los errores del backend aparecen en rojo abajo</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ValidationExampleComponent {
  form = {
    name: '',
    email: ''
  };

  validationErrors = signal<{ [key: string]: string }>({});

  constructor(
    private validationService: ValidationService,
    private toastService: ToastService
  ) {}

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

  validateForm(): boolean {
    const fieldsToValidate = {
      firstName: this.form.name,
      email: this.form.email
    };

    const errors = this.validationService.validateFields(fieldsToValidate);
    
    if (errors.length > 0) {
      const errorMap: { [key: string]: string } = {};
      errors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      this.validationErrors.set(errorMap);
      return false;
    }

    this.validationErrors.set({});
    return true;
  }

  submit(): void {
    if (!this.validateForm()) {
      this.toastService.error('Por favor corrige los errores antes de enviar');
      return;
    }

    this.toastService.success(`¡Formulario enviado! Nombre: ${this.form.name}, Email: ${this.form.email}`);
    this.form = { name: '', email: '' };
  }

  testBackendError(): void {
    this.toastService.error('❌ [Error 400] - El email ya está registrado en el sistema');
  }
}
